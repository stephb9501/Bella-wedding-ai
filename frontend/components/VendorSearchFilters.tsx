'use client';

import { useState, useEffect } from 'react';
import { X, Filter, ChevronDown, ChevronUp, MapPin, DollarSign, Star, Calendar } from 'lucide-react';

export interface FilterValues {
  query: string;
  categories: string[];
  priceRange: [number, number];
  city: string;
  state: string;
  radius: number;
  minRating: number;
  availabilityDate: string;
}

interface VendorSearchFiltersProps {
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
  onClearFilters: () => void;
  className?: string;
}

const CATEGORIES = [
  'Venue',
  'Catering',
  'Photography',
  'Videography',
  'Florist',
  'DJ/Music',
  'Hair & Makeup',
  'Wedding Planner',
  'Cake',
  'Transportation',
  'Officiant',
  'Invitations',
  'Dress & Attire',
  'Rentals',
  'Other',
];

const PRICE_LABELS = ['$', '$$', '$$$', '$$$$'];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const RADIUS_OPTIONS = [10, 25, 50, 100];

export default function VendorSearchFilters({
  filters,
  onFilterChange,
  onClearFilters,
  className = '',
}: VendorSearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.categories.length > 0) count++;
    if (filters.priceRange[0] > 1 || filters.priceRange[1] < 4) count++;
    if (filters.city) count++;
    if (filters.state) count++;
    if (filters.radius !== 50) count++;
    if (filters.minRating > 0) count++;
    if (filters.availabilityDate) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handlePriceRangeChange = (index: number, value: number) => {
    const newPriceRange: [number, number] = [...filters.priceRange] as [number, number];
    newPriceRange[index] = value;
    // Ensure min <= max
    if (newPriceRange[0] > newPriceRange[1]) {
      if (index === 0) newPriceRange[1] = newPriceRange[0];
      else newPriceRange[0] = newPriceRange[1];
    }
    onFilterChange({ ...filters, priceRange: newPriceRange });
  };

  return (
    <div className={`bg-white rounded-xl shadow-md ${className}`}>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between text-gray-900 font-medium"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-champagne-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Desktop Always Visible, Mobile Collapsible */}
      <div className={`lg:block ${isExpanded ? 'block' : 'hidden'}`}>
        <div className="p-6 space-y-6">
          {/* Header - Desktop Only */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              {activeFiltersCount > 0 && (
                <span className="bg-champagne-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={onClearFilters}
                className="text-sm text-champagne-600 hover:text-champagne-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Business name or description..."
              value={filters.query}
              onChange={(e) => onFilterChange({ ...filters, query: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Categories
            </label>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
              {CATEGORIES.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="w-4 h-4 text-champagne-600 border-gray-300 rounded focus:ring-champagne-500"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Price Range
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-12">Min:</span>
                <div className="flex gap-2 flex-1">
                  {PRICE_LABELS.map((label, index) => (
                    <button
                      key={index}
                      onClick={() => handlePriceRangeChange(0, index + 1)}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded transition ${
                        filters.priceRange[0] === index + 1
                          ? 'bg-champagne-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-12">Max:</span>
                <div className="flex gap-2 flex-1">
                  {PRICE_LABELS.map((label, index) => (
                    <button
                      key={index}
                      onClick={() => handlePriceRangeChange(1, index + 1)}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded transition ${
                        filters.priceRange[1] === index + 1
                          ? 'bg-champagne-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="City"
                value={filters.city}
                onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
              />
              <select
                value={filters.state}
                onChange={(e) => onFilterChange({ ...filters, state: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
              >
                <option value="">All States</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Distance Radius */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Distance Radius
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                {RADIUS_OPTIONS.map((radius) => (
                  <button
                    key={radius}
                    onClick={() => onFilterChange({ ...filters, radius })}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded transition ${
                      filters.radius === radius
                        ? 'bg-champagne-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {radius} mi
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Note: Distance filtering requires location coordinates
              </p>
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Minimum Rating
            </label>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => onFilterChange({ ...filters, minRating: rating })}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded transition ${
                    filters.minRating === rating
                      ? 'bg-champagne-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rating === 0 ? 'Any' : `${rating}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Availability Date
            </label>
            <input
              type="date"
              value={filters.availabilityDate}
              onChange={(e) =>
                onFilterChange({ ...filters, availabilityDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
            />
            {filters.availabilityDate && (
              <button
                onClick={() => onFilterChange({ ...filters, availabilityDate: '' })}
                className="mt-2 text-sm text-champagne-600 hover:text-champagne-700"
              >
                Clear date
              </button>
            )}
          </div>

          {/* Clear All Button - Mobile */}
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="w-full lg:hidden px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
