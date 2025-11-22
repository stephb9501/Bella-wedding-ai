'use client';

import { useState } from 'react';
import { Heart, MapPin, Star, Grid, List, ChevronDown, MessageCircle, Phone, Mail } from 'lucide-react';
import Image from 'next/image';
import StarRating from './StarRating';

export interface Vendor {
  id: string;
  business_name: string;
  category: string;
  city: string;
  state: string;
  description: string;
  tier: 'free' | 'premium' | 'featured' | 'elite';
  price_range: number;
  average_rating: number;
  review_count: number;
  starting_price?: number;
  distance?: number;
  photo_urls?: string[];
  email?: string;
  phone?: string;
  is_featured?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface VendorSearchResultsProps {
  vendors: Vendor[];
  pagination: Pagination;
  loading: boolean;
  sortBy: string;
  viewMode?: 'grid' | 'list';
  onSortChange: (sort: string) => void;
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onPageChange: (page: number) => void;
  onVendorClick?: (vendor: Vendor) => void;
  onFavoriteToggle?: (vendorId: string) => void;
  onMessageVendor?: (vendor: Vendor) => void;
  favorites?: Set<string>;
}

const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'distance', label: 'Nearest' },
  { value: 'newest', label: 'Newest' },
];

const PRICE_LABELS = ['$', '$$', '$$$', '$$$$'];

export default function VendorSearchResults({
  vendors,
  pagination,
  loading,
  sortBy,
  viewMode = 'grid',
  onSortChange,
  onViewModeChange,
  onPageChange,
  onVendorClick,
  onFavoriteToggle,
  onMessageVendor,
  favorites = new Set(),
}: VendorSearchResultsProps) {
  const [currentViewMode, setCurrentViewMode] = useState<'grid' | 'list'>(viewMode);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setCurrentViewMode(mode);
    onViewModeChange?.(mode);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-champagne-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Searching vendors...</p>
        </div>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <MapPin className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No vendors found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or search criteria
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Sort and View Options */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Results Count */}
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {pagination.total} {pagination.total === 1 ? 'Vendor' : 'Vendors'} Found
            </h2>
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full sm:w-auto pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            {onViewModeChange && (
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={`p-2 ${
                    currentViewMode === 'grid'
                      ? 'bg-champagne-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`p-2 ${
                    currentViewMode === 'list'
                      ? 'bg-champagne-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  title="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vendor Cards */}
      <div
        className={
          currentViewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }
      >
        {vendors.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            viewMode={currentViewMode}
            isFavorite={favorites.has(vendor.id)}
            onVendorClick={onVendorClick}
            onFavoriteToggle={onFavoriteToggle}
            onMessageVendor={onMessageVendor}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex gap-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg transition ${
                      pagination.page === pageNum
                        ? 'bg-champagne-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface VendorCardProps {
  vendor: Vendor;
  viewMode: 'grid' | 'list';
  isFavorite: boolean;
  onVendorClick?: (vendor: Vendor) => void;
  onFavoriteToggle?: (vendorId: string) => void;
  onMessageVendor?: (vendor: Vendor) => void;
}

function VendorCard({
  vendor,
  viewMode,
  isFavorite,
  onVendorClick,
  onFavoriteToggle,
  onMessageVendor,
}: VendorCardProps) {
  const priceLabel = PRICE_LABELS[vendor.price_range - 1] || '$$';

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div
            className="h-48 sm:h-auto sm:w-64 bg-gradient-to-br from-champagne-200 to-rose-200 relative flex-shrink-0 cursor-pointer"
            onClick={() => onVendorClick?.(vendor)}
          >
            {vendor.photo_urls && vendor.photo_urls.length > 0 ? (
              <Image
                src={vendor.photo_urls[0]}
                alt={vendor.business_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <p className="text-sm">No photos</p>
              </div>
            )}
            {vendor.is_featured && (
              <div className="absolute top-3 left-3">
                <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  FEATURED
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3
                  className="text-xl font-bold text-gray-900 mb-1 cursor-pointer hover:text-champagne-600"
                  onClick={() => onVendorClick?.(vendor)}
                >
                  {vendor.business_name}
                </h3>
                <p className="text-sm text-gray-600">{vendor.category}</p>
              </div>
              <button
                onClick={() => onFavoriteToggle?.(vendor.id)}
                className={`p-2 rounded-full transition ${
                  isFavorite
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-3">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>
                  {vendor.city}, {vendor.state}
                </span>
                {vendor.distance && (
                  <span className="ml-2 text-champagne-600 font-medium">
                    ({vendor.distance} mi)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <StarRating rating={vendor.average_rating} size="sm" />
                <span className="text-sm text-gray-600">
                  ({vendor.review_count} reviews)
                </span>
              </div>
              <span className="text-sm font-semibold text-champagne-600">{priceLabel}</span>
            </div>

            <p className="text-gray-700 text-sm mb-4 line-clamp-2">
              {vendor.description || 'Professional wedding vendor'}
            </p>

            <div className="flex gap-2">
              {onMessageVendor && (
                <button
                  onClick={() => onMessageVendor(vendor)}
                  className="flex-1 px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>
              )}
              <button
                onClick={() => onVendorClick?.(vendor)}
                className="flex-1 px-4 py-2 border-2 border-champagne-600 text-champagne-600 hover:bg-champagne-50 font-medium rounded-lg transition"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
      {/* Image */}
      <div
        className="h-48 bg-gradient-to-br from-champagne-200 to-rose-200 relative cursor-pointer"
        onClick={() => onVendorClick?.(vendor)}
      >
        {vendor.photo_urls && vendor.photo_urls.length > 0 ? (
          <Image
            src={vendor.photo_urls[0]}
            alt={vendor.business_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <p className="text-sm">No photos</p>
          </div>
        )}
        {vendor.is_featured && (
          <div className="absolute top-3 right-3">
            <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              FEATURED
            </span>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle?.(vendor.id);
          }}
          className={`absolute top-3 left-3 p-2 rounded-full transition ${
            isFavorite
              ? 'bg-rose-100 text-rose-600'
              : 'bg-white/90 text-gray-400 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-3">
          <h3
            className="text-xl font-bold text-gray-900 mb-1 cursor-pointer hover:text-champagne-600"
            onClick={() => onVendorClick?.(vendor)}
          >
            {vendor.business_name}
          </h3>
          <p className="text-sm text-gray-600">{vendor.category}</p>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          <span>
            {vendor.city}, {vendor.state}
          </span>
          {vendor.distance && (
            <span className="ml-auto text-champagne-600 font-medium">
              {vendor.distance} mi
            </span>
          )}
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {vendor.description || 'Professional wedding vendor'}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <StarRating rating={vendor.average_rating} size="sm" />
            <span className="text-sm text-gray-600">({vendor.review_count})</span>
          </div>
          <span className="text-sm font-semibold text-champagne-600">{priceLabel}</span>
        </div>

        <div className="space-y-2">
          {onMessageVendor && (
            <button
              onClick={() => onMessageVendor(vendor)}
              className="w-full px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </button>
          )}
          <button
            onClick={() => onVendorClick?.(vendor)}
            className="w-full px-4 py-2 border-2 border-champagne-600 text-champagne-600 hover:bg-champagne-50 font-medium rounded-lg transition"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
