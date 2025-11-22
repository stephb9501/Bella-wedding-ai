'use client';

import { useState } from 'react';
import { Upload, Check, X, AlertCircle } from 'lucide-react';

export default function ImportVenuesPage() {
  const [pastedData, setPastedData] = useState('');
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const parseVenueData = (text: string) => {
    const venues = [];
    const lines = text.split('\n').filter(line => line.trim());

    let currentVenue: any = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines, headers, and numbers
      if (!line || line.match(/^#/) || line.match(/^\d+$/)) continue;

      // Check if this line looks like a venue name (no address-like patterns)
      const isName = !line.match(/\d{3,5}/) && // No street numbers
                     !line.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/) && // No phone
                     !line.match(/@/) && // No email
                     !line.includes('AL ') &&
                     !line.match(/^\d+/) &&
                     line.length > 3;

      // Check if this is contact info
      const hasPhone = line.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      const hasEmail = line.includes('@');

      // Check if this is an address
      const hasAddress = line.match(/\d{3,5}/) || line.includes('Rd') || line.includes('St') ||
                        line.includes('Ave') || line.includes('Dr') || line.includes('Co Rd') ||
                        line.includes('AL ');

      // Check if this is a website
      const hasWebsite = line.match(/\.(com|net|org|co)/) && !line.includes('@');

      if (isName && !currentVenue.name) {
        // This is a venue name
        currentVenue.name = line;
      } else if (hasAddress && !currentVenue.address) {
        // This is an address
        currentVenue.address = line;

        // Extract city
        const cityMatch = line.match(/,\s*([^,]+),?\s*AL/);
        if (cityMatch) {
          currentVenue.city = cityMatch[1].trim();
        } else {
          // Just city name, no full address
          const justCity = line.replace(/,?\s*AL.*/, '').trim();
          if (justCity && !justCity.match(/\d/)) {
            currentVenue.city = justCity;
          }
        }
        currentVenue.state = 'AL';
      } else if ((hasPhone || hasEmail) && !currentVenue.contact) {
        // This is contact info
        currentVenue.contact = line.replace(/\s+/g, ' ');
      } else if (hasWebsite && !currentVenue.website) {
        // This is a website
        currentVenue.website = line.replace(/https?:\/\//, '').replace(/^www\./, '').trim();
      }

      // If we have enough info, save this venue and start a new one
      if (currentVenue.name && (currentVenue.address || currentVenue.city)) {
        // Check if the next line is also a new venue
        const nextLine = lines[i + 1];
        if (!nextLine ||
            nextLine.match(/^\d+$/) ||
            (!nextLine.match(/\d{3,5}/) && !nextLine.match(/\(?\d{3}\)/) && !nextLine.includes('@') && !nextLine.match(/\.(com|net)/))) {
          venues.push({ ...currentVenue });
          currentVenue = {};
        }
      }
    }

    // Add the last venue if it exists
    if (currentVenue.name) {
      venues.push(currentVenue);
    }

    return venues;
  };

  const handleImport = async () => {
    setImporting(true);
    setError('');
    setResults(null);

    try {
      // Parse the pasted data
      const venues = parseVenueData(pastedData);

      if (venues.length === 0) {
        setError('No venues found in pasted data. Please check the format.');
        setImporting(false);
        return;
      }

      // Send to API
      const response = await fetch('/api/admin/import-venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ venues }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      setResults(result);
      setPastedData(''); // Clear the textarea on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          Import Venues
        </h1>
        <p style={{ color: '#666' }}>
          Paste venue information below and it will be automatically parsed and imported.
        </p>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
            Paste Venue Data:
          </label>
          <textarea
            value={pastedData}
            onChange={(e) => setPastedData(e.target.value)}
            placeholder="Example:
Hampton Cove Wedding Venue
823 Cherry Tree Rd, Huntsville, AL 35748
(256) 603-7585 • hamptoncovewedding@gmail.com
hamptoncoveweddingvenue.com

Douglas Manor
545 Chelsea Springs Dr, Columbiana, AL 35051
(205) 369-8714 • info@douglasmanorevents.com"
            style={{
              width: '100%',
              minHeight: '300px',
              padding: '12px',
              border: '2px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'monospace',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleImport}
            disabled={!pastedData.trim() || importing}
            style={{
              background: importing ? '#9CA3AF' : '#E11D48',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: importing || !pastedData.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Upload size={20} />
            {importing ? 'Importing...' : 'Import Venues'}
          </button>

          {pastedData.trim() && (
            <span style={{ color: '#666', fontSize: '14px' }}>
              Ready to parse
            </span>
          )}
        </div>

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}>
            <X size={20} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: '600', color: '#DC2626', marginBottom: '4px' }}>Error</div>
              <div style={{ color: '#991B1B', fontSize: '14px' }}>{error}</div>
            </div>
          </div>
        )}

        {results && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#D1FAE5',
            border: '1px solid #6EE7B7',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}>
            <Check size={20} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: '#059669', marginBottom: '8px' }}>
                Import Successful!
              </div>
              <div style={{ color: '#047857', fontSize: '14px', marginBottom: '12px' }}>
                <div>✓ Imported: {results.imported} venues</div>
                {results.failed > 0 && <div>✗ Failed: {results.failed} venues</div>}
              </div>

              {results.errors && results.errors.length > 0 && (
                <details style={{ marginTop: '12px' }}>
                  <summary style={{ cursor: 'pointer', color: '#047857', fontWeight: '600' }}>
                    View Errors
                  </summary>
                  <pre style={{
                    marginTop: '8px',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '6px',
                    fontSize: '12px',
                    overflow: 'auto',
                  }}>
                    {JSON.stringify(results.errors, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: '#F9FAFB', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <AlertCircle size={20} style={{ color: '#6B7280', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>Format Tips:</div>
            <ul style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li>Each venue should have: Name, Address (with city and AL), Contact info (phone/email), and optionally a website</li>
              <li>Separate different pieces of info on different lines</li>
              <li>Leave blank lines between venues (optional)</li>
              <li>The parser automatically detects names, addresses, phone numbers, emails, and websites</li>
              <li>Works with copy/paste from websites, spreadsheets, or text documents</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
