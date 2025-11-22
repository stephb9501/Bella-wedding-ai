'use client';

import { useState, useEffect } from 'react';
import { Upload, Check, X, AlertCircle, Download, History, Eye, Edit2, Trash2, ChevronDown } from 'lucide-react';

// Vendor categories
const CATEGORIES = [
  'Venues',
  'Photographers',
  'Caterers',
  'DJs/Bands',
  'Florists',
  'Bakers/Cakes',
  'Hair & Makeup',
  'Transportation',
  'Planners',
  'Officiants',
  'Rentals',
  'Videographers',
] as const;

type Category = typeof CATEGORIES[number];

interface ParsedVendor {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  contact?: string;
  email?: string;
  phone?: string;
  website?: string;
  specialties?: string;
  packages?: string;
  serviceArea?: string;
  socialMedia?: string;
  hours?: string;
  certifications?: string;
  capacity?: string;
  amenities?: string;
  equipment?: string;
  menu?: string;
  warnings?: string[];
}

interface ImportHistory {
  id: string;
  date: string;
  category: string;
  imported: number;
  failed: number;
}

export default function ImportVendorsPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('Venues');
  const [pastedData, setPastedData] = useState('');
  const [importing, setImporting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [parsedVendors, setParsedVendors] = useState<ParsedVendor[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);
  const [progress, setProgress] = useState(0);

  // Load import history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('importHistory');
    if (history) {
      setImportHistory(JSON.parse(history));
    }
  }, []);

  // Enhanced parser that handles multiple vendor types
  const parseVendorData = (text: string, category: Category): ParsedVendor[] => {
    const vendors: ParsedVendor[] = [];
    const lines = text.split('\n').filter(line => line.trim());

    let currentVendor: ParsedVendor = { name: '', warnings: [] };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines, comments, and numbered list markers
      if (!line || line.match(/^#/) || line.match(/^\d+\.?\s*$/)) continue;

      // Remove numbered list prefix
      const cleanLine = line.replace(/^\d+\.\s*/, '');

      // Detect different types of information
      const hasPhone = cleanLine.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      const hasEmail = cleanLine.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      const hasWebsite = cleanLine.match(/(?:www\.|https?:\/\/)?([a-zA-Z0-9-]+\.(?:com|net|org|co|us|photo|events?))/i) && !cleanLine.includes('@');
      const hasAddress = cleanLine.match(/\d{3,5}/) || cleanLine.match(/\b(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Way|Place|Pl)\b/i);
      const hasCityState = cleanLine.match(/,\s*([^,]+),?\s*AL\s*\d{5}/i);

      // Category-specific field detection
      const isSpecialty = cleanLine.match(/^Specializes?\s+in:/i);
      const isPackage = cleanLine.match(/^Packages?:/i);
      const isServiceArea = cleanLine.match(/^Service\s+Area:/i);
      const isSocialMedia = cleanLine.match(/^Social\s+Media:/i);
      const isHours = cleanLine.match(/^Hours?:/i);
      const isCertification = cleanLine.match(/^Certifications?:|^Licensed:/i);
      const isCapacity = cleanLine.match(/^Capacity:/i);
      const isAmenities = cleanLine.match(/^Amenities:/i);
      const isEquipment = cleanLine.match(/^Equipment:/i);
      const isMenu = cleanLine.match(/^Menu\s+Options?:/i);

      // Determine if this is a vendor name (first non-categorized line or after we saved previous vendor)
      const isLikelyName = !currentVendor.name &&
                          !hasPhone &&
                          !hasEmail &&
                          !hasWebsite &&
                          !hasAddress &&
                          !isSpecialty &&
                          !isPackage &&
                          cleanLine.length > 3;

      if (isLikelyName) {
        // If we have a partial vendor, save it first
        if (currentVendor.name) {
          validateVendor(currentVendor);
          vendors.push({ ...currentVendor });
        }
        currentVendor = { name: cleanLine, warnings: [] };
      } else if (hasAddress && !currentVendor.address) {
        currentVendor.address = cleanLine;
        // Extract city and state
        const cityMatch = cleanLine.match(/,\s*([^,]+),?\s*AL/i);
        if (cityMatch) {
          currentVendor.city = cityMatch[1].trim();
          currentVendor.state = 'AL';
        }
      } else if ((hasPhone || hasEmail) && !isSpecialty && !currentVendor.contact) {
        currentVendor.contact = cleanLine.replace(/\s+/g, ' ');
        // Extract email
        if (hasEmail) {
          currentVendor.email = hasEmail[1];
        }
        // Extract phone
        if (hasPhone) {
          currentVendor.phone = hasPhone[0];
        }
      } else if (hasWebsite && !currentVendor.website) {
        const websiteMatch = cleanLine.match(/(?:www\.|https?:\/\/)?([a-zA-Z0-9-]+\.(?:com|net|org|co|us|photo|events?))/i);
        if (websiteMatch) {
          currentVendor.website = websiteMatch[1].replace(/^www\./, '');
        }
      } else if (isSpecialty) {
        currentVendor.specialties = cleanLine.replace(/^Specializes?\s+in:\s*/i, '');
      } else if (isPackage) {
        currentVendor.packages = cleanLine.replace(/^Packages?:\s*/i, '');
      } else if (isServiceArea) {
        currentVendor.serviceArea = cleanLine.replace(/^Service\s+Area:\s*/i, '');
      } else if (isSocialMedia) {
        currentVendor.socialMedia = cleanLine.replace(/^Social\s+Media:\s*/i, '');
      } else if (isHours) {
        currentVendor.hours = cleanLine.replace(/^Hours?:\s*/i, '');
      } else if (isCertification) {
        currentVendor.certifications = cleanLine.replace(/^(?:Certifications?|Licensed):\s*/i, '');
      } else if (isCapacity) {
        currentVendor.capacity = cleanLine.replace(/^Capacity:\s*/i, '');
      } else if (isAmenities) {
        currentVendor.amenities = cleanLine.replace(/^Amenities:\s*/i, '');
      } else if (isEquipment) {
        currentVendor.equipment = cleanLine.replace(/^Equipment:\s*/i, '');
      } else if (isMenu) {
        currentVendor.menu = cleanLine.replace(/^Menu\s+Options?:\s*/i, '');
      }
    }

    // Add the last vendor
    if (currentVendor.name) {
      validateVendor(currentVendor);
      vendors.push(currentVendor);
    }

    return vendors;
  };

  // Validate vendor and add warnings
  const validateVendor = (vendor: ParsedVendor) => {
    vendor.warnings = [];

    if (!vendor.email && !vendor.contact?.includes('@')) {
      vendor.warnings.push('Missing email address');
    }
    if (!vendor.phone && !vendor.contact?.match(/\d{3}/)) {
      vendor.warnings.push('Missing phone number');
    }
    if (!vendor.city && !vendor.address) {
      vendor.warnings.push('Missing location information');
    }
    if (!vendor.website) {
      vendor.warnings.push('No website provided');
    }
  };

  // Check for duplicate vendors
  const checkDuplicates = (vendors: ParsedVendor[]): ParsedVendor[] => {
    const seen = new Set<string>();
    return vendors.map(vendor => {
      const key = vendor.name.toLowerCase().replace(/\s+/g, '');
      if (seen.has(key)) {
        vendor.warnings = vendor.warnings || [];
        vendor.warnings.push('Possible duplicate');
      }
      seen.add(key);
      return vendor;
    });
  };

  const handlePreview = () => {
    setPreviewing(true);
    setError('');

    try {
      const parsed = parseVendorData(pastedData, selectedCategory);

      if (parsed.length === 0) {
        setError('No vendors found in pasted data. Please check the format.');
        setPreviewing(false);
        return;
      }

      const withDuplicateCheck = checkDuplicates(parsed);
      setParsedVendors(withDuplicateCheck);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse data');
      setPreviewing(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setError('');
    setResults(null);
    setProgress(0);

    try {
      const vendorsToImport = parsedVendors;

      if (vendorsToImport.length === 0) {
        setError('No vendors to import');
        setImporting(false);
        return;
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Send to API
      const response = await fetch('/api/admin/import-vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendors: vendorsToImport,
          category: selectedCategory
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      setResults(result);

      // Add to import history
      const newHistoryItem: ImportHistory = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        category: selectedCategory,
        imported: result.imported,
        failed: result.failed,
      };

      const updatedHistory = [newHistoryItem, ...importHistory].slice(0, 10);
      setImportHistory(updatedHistory);
      localStorage.setItem('importHistory', JSON.stringify(updatedHistory));

      // Clear form on success
      setPastedData('');
      setParsedVendors([]);
      setPreviewing(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  const handleDeletePreview = (index: number) => {
    setParsedVendors(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditPreview = (index: number, field: keyof ParsedVendor, value: string) => {
    setParsedVendors(prev => prev.map((vendor, i) => {
      if (i === index) {
        const updated = { ...vendor, [field]: value };
        validateVendor(updated);
        return updated;
      }
      return vendor;
    }));
  };

  const downloadTemplate = () => {
    const template = `# ${selectedCategory} Import Template
# Copy this template and fill in your vendor information

1. Vendor Name Here
123 Street Address, City, AL 35XXX
(256) 555-1234 • email@vendor.com
www.vendorwebsite.com
Specializes in: Your specialties here
${selectedCategory === 'Photographers' ? 'Packages: Full Day ($2,500), Half Day ($1,500)' : ''}
${selectedCategory === 'Caterers' ? 'Menu Options: Plated dinners, Buffet style, etc.' : ''}
${selectedCategory === 'DJs/Bands' ? 'Equipment: Sound system, lighting, etc.' : ''}
${selectedCategory === 'Florists' ? 'Popular Flowers: Roses, Peonies, etc.' : ''}
${selectedCategory === 'Venues' ? 'Capacity: 200 guests' : ''}
Service Area: Your service area
Social Media: Instagram @handle

2. Second Vendor Name
Another Address, City, AL 35XXX
Contact information
...
`;

    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCategory.toLowerCase()}-import-template.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalImported = importHistory.reduce((sum, item) => sum + item.imported, 0);
  const totalFailed = importHistory.reduce((sum, item) => sum + item.failed, 0);
  const successRate = totalImported + totalFailed > 0
    ? ((totalImported / (totalImported + totalFailed)) * 100).toFixed(1)
    : '0';

  return (
    <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          Import Vendors
        </h1>
        <p style={{ color: '#666' }}>
          Import wedding vendors across all categories with intelligent parsing and preview.
        </p>
      </div>

      {/* Statistics Cards */}
      {importHistory.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Total Imported</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669' }}>{totalImported}</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Success Rate</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3B82F6' }}>{successRate}%</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Total Imports</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8B5CF6' }}>{importHistory.length}</div>
          </div>
        </div>
      )}

      {/* Main Import Form */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        {/* Category Selector */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
            Select Vendor Category:
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value as Category);
                setParsedVendors([]);
                setPreviewing(false);
              }}
              style={{
                width: '100%',
                padding: '12px 40px 12px 12px',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '16px',
                background: 'white',
                cursor: 'pointer',
                appearance: 'none',
              }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown
              size={20}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#6B7280'
              }}
            />
          </div>
        </div>

        {/* Paste Data Textarea */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontWeight: '600' }}>
              Paste {selectedCategory} Data:
            </label>
            <button
              onClick={downloadTemplate}
              style={{
                background: 'transparent',
                color: '#3B82F6',
                padding: '6px 12px',
                border: '1px solid #3B82F6',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Download size={16} />
              Download Template
            </button>
          </div>
          <textarea
            value={pastedData}
            onChange={(e) => {
              setPastedData(e.target.value);
              setPreviewing(false);
              setParsedVendors([]);
            }}
            placeholder={`Example for ${selectedCategory}:

Vendor Name
123 Main Street, City, AL 35XXX
(256) 555-1234 • email@vendor.com
www.vendorwebsite.com
Specializes in: Your specialties
${selectedCategory === 'Photographers' ? 'Packages: Full Day ($2,500), Half Day ($1,500)' : ''}
${selectedCategory === 'Caterers' ? 'Menu Options: Your menu items' : ''}
${selectedCategory === 'Venues' ? 'Capacity: 200 guests' : ''}

Click "Download Template" for a complete example.`}
            disabled={previewing}
            style={{
              width: '100%',
              minHeight: '300px',
              padding: '12px',
              border: '2px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'monospace',
              resize: 'vertical',
              background: previewing ? '#F9FAFB' : 'white',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {!previewing ? (
            <button
              onClick={handlePreview}
              disabled={!pastedData.trim()}
              style={{
                background: pastedData.trim() ? '#3B82F6' : '#9CA3AF',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: pastedData.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Eye size={20} />
              Preview Import
            </button>
          ) : (
            <>
              <button
                onClick={handleImport}
                disabled={importing || parsedVendors.length === 0}
                style={{
                  background: importing ? '#9CA3AF' : '#059669',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: importing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Upload size={20} />
                {importing ? 'Importing...' : `Import ${parsedVendors.length} Vendor${parsedVendors.length !== 1 ? 's' : ''}`}
              </button>
              <button
                onClick={() => {
                  setPreviewing(false);
                  setParsedVendors([]);
                }}
                disabled={importing}
                style={{
                  background: 'white',
                  color: '#6B7280',
                  padding: '12px 24px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: importing ? 'not-allowed' : 'pointer',
                }}
              >
                Edit Data
              </button>
            </>
          )}

          {pastedData.trim() && !previewing && (
            <span style={{ color: '#666', fontSize: '14px' }}>
              Ready to preview • {selectedCategory}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {importing && (
          <div style={{ marginTop: '20px' }}>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#E5E7EB',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #059669, #10B981)',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px', color: '#6B7280' }}>
              Importing vendors... {progress}%
            </div>
          </div>
        )}

        {/* Error Display */}
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

        {/* Success Results */}
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
                <div>✓ Imported: {results.imported} {selectedCategory}</div>
                {results.failed > 0 && <div>✗ Failed: {results.failed} {selectedCategory}</div>}
              </div>

              {results.errors && results.errors.length > 0 && (
                <details style={{ marginTop: '12px' }}>
                  <summary style={{ cursor: 'pointer', color: '#047857', fontWeight: '600' }}>
                    View Errors ({results.errors.length})
                  </summary>
                  <pre style={{
                    marginTop: '8px',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '6px',
                    fontSize: '12px',
                    overflow: 'auto',
                    maxHeight: '200px',
                  }}>
                    {JSON.stringify(results.errors, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Preview Table */}
      {previewing && parsedVendors.length > 0 && (
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            Preview ({parsedVendors.length} vendor{parsedVendors.length !== 1 ? 's' : ''})
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Contact</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Location</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Details</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {parsedVendors.map((vendor, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '12px' }}>
                      {editingIndex === index ? (
                        <input
                          type="text"
                          value={vendor.name}
                          onChange={(e) => handleEditPreview(index, 'name', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '6px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px',
                          }}
                        />
                      ) : (
                        <div style={{ fontWeight: '600' }}>{vendor.name}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '13px' }}>
                        {vendor.email && <div>📧 {vendor.email}</div>}
                        {vendor.phone && <div>📱 {vendor.phone}</div>}
                        {vendor.website && <div>🌐 {vendor.website}</div>}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '13px' }}>
                        {vendor.city && <div>{vendor.city}, {vendor.state || 'AL'}</div>}
                        {vendor.address && <div style={{ color: '#6B7280' }}>{vendor.address}</div>}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>
                        {vendor.specialties && <div>🎯 {vendor.specialties.slice(0, 50)}...</div>}
                        {vendor.packages && <div>💰 {vendor.packages.slice(0, 50)}...</div>}
                        {vendor.capacity && <div>👥 {vendor.capacity}</div>}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {vendor.warnings && vendor.warnings.length > 0 ? (
                        <div>
                          {vendor.warnings.map((warning, i) => (
                            <div key={i} style={{
                              fontSize: '12px',
                              color: '#D97706',
                              background: '#FEF3C7',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              marginBottom: '4px',
                            }}>
                              ⚠️ {warning}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#059669', fontSize: '12px' }}>✓ Ready</span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#3B82F6',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePreview(index)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#DC2626',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import History */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={24} />
            Import History
          </h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              background: 'transparent',
              color: '#6B7280',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {showHistory ? 'Hide' : 'Show'}
          </button>
        </div>

        {showHistory && importHistory.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Imported</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Failed</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {importHistory.map((item) => {
                  const rate = item.imported + item.failed > 0
                    ? ((item.imported / (item.imported + item.failed)) * 100).toFixed(0)
                    : '0';
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '12px' }}>{formatDate(item.date)}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: '#EEF2FF',
                          color: '#4F46E5',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#059669', fontWeight: '600' }}>{item.imported}</td>
                      <td style={{ padding: '12px', color: item.failed > 0 ? '#DC2626' : '#6B7280' }}>
                        {item.failed}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          color: Number(rate) > 80 ? '#059669' : Number(rate) > 50 ? '#D97706' : '#DC2626',
                          fontWeight: '600',
                        }}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {showHistory && importHistory.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            No import history yet. Start by importing your first batch of vendors!
          </div>
        )}
      </div>

      {/* Format Tips */}
      <div style={{ marginTop: '30px', padding: '20px', background: '#F9FAFB', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <AlertCircle size={20} style={{ color: '#6B7280', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>Format Tips:</div>
            <ul style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li>Each vendor should include: Name, Contact (phone/email), and Location</li>
              <li>Add category-specific info like packages, specialties, service area, etc.</li>
              <li>Use the "Download Template" button for examples specific to your selected category</li>
              <li>The parser automatically detects names, addresses, phone numbers, emails, and websites</li>
              <li>Preview your data before importing to catch any issues</li>
              <li>Edit individual fields in the preview table if needed</li>
              <li>Check sample files in <code>/sample-data/</code> for complete examples</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
