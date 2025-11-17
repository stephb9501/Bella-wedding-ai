'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, Users, DollarSign, MapPin, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  type: 'vendor' | 'checklist' | 'guest' | 'budget' | 'page';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  icon: any;
}

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);

    try {
      // Mock search results - in production, this would call an API
      const mockResults: SearchResult[] = [];

      // Search vendors
      if (searchQuery.toLowerCase().includes('photo')) {
        mockResults.push({
          type: 'vendor',
          id: '1',
          title: 'Professional Photography Studio',
          subtitle: 'Photography & Videography',
          url: '/vendors/1',
          icon: MapPin,
        });
      }

      if (searchQuery.toLowerCase().includes('cater')) {
        mockResults.push({
          type: 'vendor',
          id: '2',
          title: 'Elegant Events Catering',
          subtitle: 'Catering Services',
          url: '/vendors/2',
          icon: MapPin,
        });
      }

      // Search pages
      const pages = [
        { title: 'Budget Tracker', url: '/budget', keywords: ['budget', 'money', 'cost', 'expense'] },
        { title: 'Guest List', url: '/guests', keywords: ['guest', 'rsvp', 'invite'] },
        { title: 'Checklist', url: '/checklist', keywords: ['task', 'todo', 'checklist', 'plan'] },
        { title: 'Timeline', url: '/timeline', keywords: ['timeline', 'schedule', 'date'] },
        { title: 'Vendors', url: '/vendors', keywords: ['vendor', 'supplier', 'service'] },
        { title: 'Settings', url: '/settings', keywords: ['setting', 'account', 'profile'] },
      ];

      pages.forEach(page => {
        if (page.keywords.some(keyword => searchQuery.toLowerCase().includes(keyword))) {
          mockResults.push({
            type: 'page',
            id: page.url,
            title: page.title,
            url: page.url,
            icon: getPageIcon(page.url),
          });
        }
      });

      setResults(mockResults);
      setShowResults(true);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPageIcon = (url: string) => {
    if (url.includes('budget')) return DollarSign;
    if (url.includes('guest')) return Users;
    if (url.includes('checklist') || url.includes('timeline')) return Calendar;
    return MapPin;
  };

  const handleResultClick = (url: string) => {
    router.push(url);
    setShowResults(false);
    setQuery('');
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder="Search vendors, guests, budget items..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
        )}
        {query && !loading && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {results.map((result) => {
            const Icon = result.icon;
            return (
              <button
                key={result.id}
                onClick={() => handleResultClick(result.url)}
                className="w-full p-4 text-left hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-champagne-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-champagne-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{result.title}</p>
                  {result.subtitle && (
                    <p className="text-sm text-gray-600 truncate">{result.subtitle}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 capitalize">{result.type}</span>
              </button>
            );
          })}
        </div>
      )}

      {showResults && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 p-8 text-center z-50">
          <p className="text-gray-600">No results found for "{query}"</p>
          <p className="text-sm text-gray-500 mt-2">Try searching for vendors, budget items, or pages</p>
        </div>
      )}
    </div>
  );
}
