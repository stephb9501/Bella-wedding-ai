'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, X, Star, DollarSign } from 'lucide-react';

export interface VendorLocation {
  id: string;
  business_name: string;
  category: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  average_rating?: number;
  price_range?: number;
  photo_url?: string;
}

interface VendorMapProps {
  vendors: VendorLocation[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onVendorClick?: (vendor: VendorLocation) => void;
  className?: string;
}

const PRICE_LABELS = ['$', '$$', '$$$', '$$$$'];

export default function VendorMap({
  vendors,
  center = { lat: 39.8283, lng: -98.5795 }, // Geographic center of USA
  zoom = 4,
  onVendorClick,
  className = '',
}: VendorMapProps) {
  const [selectedVendor, setSelectedVendor] = useState<VendorLocation | null>(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const mapRef = useRef<HTMLDivElement>(null);

  // Filter vendors with valid coordinates
  const validVendors = vendors.filter(
    (v) => v.latitude && v.longitude && !isNaN(v.latitude) && !isNaN(v.longitude)
  );

  // Auto-center map based on vendors
  useEffect(() => {
    if (validVendors.length > 0) {
      const lats = validVendors.map((v) => v.latitude);
      const lngs = validVendors.map((v) => v.longitude);
      const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
    }
  }, [validVendors]);

  // Convert lat/lng to pixel coordinates
  const latLngToPixel = (lat: number, lng: number, width: number, height: number) => {
    // Simple mercator projection
    const x = ((lng + 180) / 360) * width;
    const latRad = (lat * Math.PI) / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = (height / 2) - (width * mercN / (2 * Math.PI));
    return { x, y };
  };

  const handleMarkerClick = (vendor: VendorLocation) => {
    setSelectedVendor(vendor);
    onVendorClick?.(vendor);
  };

  return (
    <div className={`relative bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      {/* Map Container */}
      <div
        ref={mapRef}
        className="relative w-full h-[500px] bg-gradient-to-br from-blue-50 to-green-50"
      >
        {/* Simple background grid to simulate map */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="#cbd5e0"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Map Info Overlay */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md px-4 py-2">
          <p className="text-sm font-medium text-gray-900">
            {validVendors.length} {validVendors.length === 1 ? 'Vendor' : 'Vendors'} on Map
          </p>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setMapZoom((z) => Math.min(z + 1, 10))}
            className="bg-white rounded-lg shadow-md p-2 hover:bg-gray-50 transition"
            title="Zoom in"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => setMapZoom((z) => Math.max(z - 1, 1))}
            className="bg-white rounded-lg shadow-md p-2 hover:bg-gray-50 transition"
            title="Zoom out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        </div>

        {/* Vendor Markers */}
        {validVendors.map((vendor, index) => {
          const mapWidth = mapRef.current?.clientWidth || 800;
          const mapHeight = mapRef.current?.clientHeight || 500;

          // Calculate position relative to map center
          const latDiff = vendor.latitude - mapCenter.lat;
          const lngDiff = vendor.longitude - mapCenter.lng;

          // Scale factor based on zoom
          const scale = mapZoom / 4;

          // Position markers around center
          const x = (mapWidth / 2) + (lngDiff * scale * 50);
          const y = (mapHeight / 2) - (latDiff * scale * 50);

          // Check if marker is within bounds
          if (x < 0 || x > mapWidth || y < 0 || y > mapHeight) {
            return null;
          }

          return (
            <div
              key={vendor.id}
              className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-transform hover:scale-110"
              style={{
                left: `${x}px`,
                top: `${y}px`,
              }}
              onClick={() => handleMarkerClick(vendor)}
            >
              {/* Marker Pin */}
              <div
                className={`relative ${
                  selectedVendor?.id === vendor.id
                    ? 'text-rose-600'
                    : 'text-champagne-600'
                }`}
              >
                <MapPin
                  className={`w-8 h-8 drop-shadow-lg ${
                    selectedVendor?.id === vendor.id ? 'animate-bounce' : ''
                  }`}
                  fill="currentColor"
                />
                {/* Price indicator */}
                {vendor.price_range && (
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold">
                    {vendor.price_range}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Selected Vendor Card */}
        {selectedVendor && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-sm px-4">
            <div className="bg-white rounded-lg shadow-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {selectedVendor.business_name}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedVendor.category}</p>
                </div>
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="p-1 hover:bg-gray-100 rounded transition"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                <MapPin className="w-4 h-4" />
                <span>
                  {selectedVendor.city}, {selectedVendor.state}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedVendor.average_rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium">
                        {selectedVendor.average_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {selectedVendor.price_range && (
                    <div className="flex items-center gap-1 text-sm font-semibold text-champagne-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{PRICE_LABELS[selectedVendor.price_range - 1]}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onVendorClick?.(selectedVendor)}
                  className="px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white text-sm font-medium rounded-lg transition"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Vendors Message */}
        {validVendors.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                No vendors with location data to display
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-champagne-600" fill="currentColor" />
              <span>Vendor Location</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-600" fill="currentColor" />
              <span>Selected</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Note: This is a simplified map view. For production, integrate with Google Maps or
            Leaflet for full functionality.
          </p>
        </div>
      </div>
    </div>
  );
}
