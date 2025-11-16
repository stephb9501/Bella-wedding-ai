'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  DollarSign,
  Star,
  Heart,
  Filter,
  Sparkles,
  Camera,
  Music,
  Cake,
  Flower,
  Shirt,
  Home,
  Car,
  Film,
  Coffee,
  Users,
  ChevronDown,
  MessageCircle,
  Calendar,
  Award,
  TrendingUp,
} from 'lucide-react';
import { getVendorRecommendations } from '@/lib/enhanced-ai-assistant';

interface Vendor {
  id: string;
  name: string;
  category: string;
  location: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  priceRange: string;
  tier: 'Premium' | 'Featured' | 'Elite';
  description: string;
  specialties: string[];
  yearsExperience: number;
  completedEvents: number;
  responseTime: string;
  availability: 'Available' | 'Limited' | 'Booked';
  featured: boolean;
  profileImage?: string;
  portfolioImages: string[];
  verified: boolean;
  topRated: boolean;
}

const categoryIcons: Record<string, any> = {
  Photography: Camera,
  Videography: Film,
  'DJ/Music': Music,
  Catering: Coffee,
  'Cake/Desserts': Cake,
  Florist: Flower,
  Venue: Home,
  'Hair/Makeup': Shirt,
  Transportation: Car,
  'Event Planning': Users,
};

export default function VendorSearch() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [priceFilter, setPriceFilter] = useState<string>('All');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);
  const [userBudget, setUserBudget] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<string>('');

  // Load user's wedding details from localStorage for AI recommendations
  useEffect(() => {
    const weddingDetails = localStorage.getItem('bella_wedding_details');
    if (weddingDetails) {
      const details = JSON.parse(weddingDetails);
      setUserBudget(details.budget || 0);
      setUserLocation(details.location || '');
    }

    const savedFavorites = localStorage.getItem('bella_favorite_vendors');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // Generate sample vendors
    const sampleVendors: Vendor[] = [
      {
        id: '1',
        name: 'Elegant Moments Photography',
        category: 'Photography',
        location: 'Austin, TX',
        city: 'Austin',
        state: 'TX',
        rating: 4.9,
        reviewCount: 127,
        startingPrice: 2500,
        priceRange: '$2,500 - $5,000',
        tier: 'Elite',
        description: 'Award-winning wedding photography capturing your most precious moments with artistic flair and timeless elegance.',
        specialties: ['Destination Weddings', 'Fine Art', 'Editorial', 'Outdoor'],
        yearsExperience: 12,
        completedEvents: 450,
        responseTime: '< 2 hours',
        availability: 'Available',
        featured: true,
        portfolioImages: [],
        verified: true,
        topRated: true,
      },
      {
        id: '2',
        name: 'Harmony Wedding Films',
        category: 'Videography',
        location: 'Austin, TX',
        city: 'Austin',
        state: 'TX',
        rating: 4.8,
        reviewCount: 89,
        startingPrice: 3000,
        priceRange: '$3,000 - $6,500',
        tier: 'Featured',
        description: 'Cinematic wedding videography that tells your unique love story. We create films that you\'ll treasure forever.',
        specialties: ['Cinematic Style', 'Drone Footage', 'Same-Day Edits', 'Documentary'],
        yearsExperience: 8,
        completedEvents: 320,
        responseTime: '< 4 hours',
        availability: 'Limited',
        featured: true,
        portfolioImages: [],
        verified: true,
        topRated: true,
      },
      {
        id: '3',
        name: 'DJ Soundwave Events',
        category: 'DJ/Music',
        location: 'Dallas, TX',
        city: 'Dallas',
        state: 'TX',
        rating: 4.7,
        reviewCount: 156,
        startingPrice: 1500,
        priceRange: '$1,500 - $3,500',
        tier: 'Premium',
        description: 'Professional DJ services that keep your dance floor packed all night. Custom playlists tailored to your style.',
        specialties: ['Open Format', 'Live Musicians', 'MC Services', 'Lighting'],
        yearsExperience: 10,
        completedEvents: 580,
        responseTime: '< 6 hours',
        availability: 'Available',
        featured: false,
        portfolioImages: [],
        verified: true,
        topRated: false,
      },
      {
        id: '4',
        name: 'Gourmet Celebrations Catering',
        category: 'Catering',
        location: 'Houston, TX',
        city: 'Houston',
        state: 'TX',
        rating: 4.9,
        reviewCount: 203,
        startingPrice: 4500,
        priceRange: '$4,500 - $12,000',
        tier: 'Elite',
        description: 'Farm-to-table wedding catering with customizable menus. Award-winning chefs create unforgettable dining experiences.',
        specialties: ['Farm-to-Table', 'Dietary Accommodations', 'International Cuisine', 'Plated Service'],
        yearsExperience: 15,
        completedEvents: 720,
        responseTime: '< 3 hours',
        availability: 'Available',
        featured: true,
        portfolioImages: [],
        verified: true,
        topRated: true,
      },
      {
        id: '5',
        name: 'Sweet Dreams Bakery',
        category: 'Cake/Desserts',
        location: 'San Antonio, TX',
        city: 'San Antonio',
        state: 'TX',
        rating: 4.8,
        reviewCount: 92,
        startingPrice: 800,
        priceRange: '$800 - $2,500',
        tier: 'Featured',
        description: 'Custom wedding cakes and dessert tables that taste as amazing as they look. All made from scratch with premium ingredients.',
        specialties: ['Custom Designs', 'Dessert Tables', 'Macarons', 'Gluten-Free Options'],
        yearsExperience: 7,
        completedEvents: 380,
        responseTime: '< 5 hours',
        availability: 'Available',
        featured: false,
        portfolioImages: [],
        verified: true,
        topRated: true,
      },
      {
        id: '6',
        name: 'Blooms & Petals Floral Design',
        category: 'Florist',
        location: 'Austin, TX',
        city: 'Austin',
        state: 'TX',
        rating: 4.9,
        reviewCount: 145,
        startingPrice: 2000,
        priceRange: '$2,000 - $6,000',
        tier: 'Elite',
        description: 'Stunning floral arrangements that bring your wedding vision to life. From bouquets to ceremony arches, we do it all.',
        specialties: ['Bridal Bouquets', 'Ceremony Arches', 'Centerpieces', 'Seasonal Flowers'],
        yearsExperience: 11,
        completedEvents: 490,
        responseTime: '< 2 hours',
        availability: 'Limited',
        featured: true,
        portfolioImages: [],
        verified: true,
        topRated: true,
      },
      {
        id: '7',
        name: 'The Grand Estate',
        category: 'Venue',
        location: 'Round Rock, TX',
        city: 'Round Rock',
        state: 'TX',
        rating: 4.7,
        reviewCount: 178,
        startingPrice: 5000,
        priceRange: '$5,000 - $15,000',
        tier: 'Elite',
        description: 'Elegant indoor/outdoor venue with stunning Hill Country views. Accommodates 50-300 guests with all-inclusive packages.',
        specialties: ['Outdoor Ceremonies', 'Indoor Reception', 'Bridal Suite', 'Onsite Parking'],
        yearsExperience: 9,
        completedEvents: 420,
        responseTime: '< 4 hours',
        availability: 'Available',
        featured: true,
        portfolioImages: [],
        verified: true,
        topRated: false,
      },
      {
        id: '8',
        name: 'Glamour Beauty Studio',
        category: 'Hair/Makeup',
        location: 'Austin, TX',
        city: 'Austin',
        state: 'TX',
        rating: 4.8,
        reviewCount: 134,
        startingPrice: 600,
        priceRange: '$600 - $2,000',
        tier: 'Featured',
        description: 'Professional bridal hair and makeup artists who specialize in making you look flawless on your big day.',
        specialties: ['Airbrush Makeup', 'Updos', 'Trial Sessions', 'Bridal Party Services'],
        yearsExperience: 6,
        completedEvents: 310,
        responseTime: '< 3 hours',
        availability: 'Available',
        featured: false,
        portfolioImages: [],
        verified: true,
        topRated: true,
      },
      {
        id: '9',
        name: 'Luxury Limo & Transportation',
        category: 'Transportation',
        location: 'Austin, TX',
        city: 'Austin',
        state: 'TX',
        rating: 4.6,
        reviewCount: 87,
        startingPrice: 800,
        priceRange: '$800 - $3,000',
        tier: 'Premium',
        description: 'First-class wedding transportation with a fleet of luxury vehicles. Professional chauffeurs ensure timely arrival.',
        specialties: ['Stretch Limos', 'Party Buses', 'Classic Cars', 'Shuttle Service'],
        yearsExperience: 13,
        completedEvents: 650,
        responseTime: '< 8 hours',
        availability: 'Available',
        featured: false,
        portfolioImages: [],
        verified: true,
        topRated: false,
      },
      {
        id: '10',
        name: 'Perfect Day Event Planning',
        category: 'Event Planning',
        location: 'Dallas, TX',
        city: 'Dallas',
        state: 'TX',
        rating: 4.9,
        reviewCount: 167,
        startingPrice: 3500,
        priceRange: '$3,500 - $8,000',
        tier: 'Elite',
        description: 'Full-service wedding planning that handles every detail. From concept to execution, we make your dream wedding a reality.',
        specialties: ['Full Planning', 'Day-of Coordination', 'Destination Weddings', 'Budget Management'],
        yearsExperience: 14,
        completedEvents: 520,
        responseTime: '< 1 hour',
        availability: 'Limited',
        featured: true,
        portfolioImages: [],
        verified: true,
        topRated: true,
      },
      {
        id: '11',
        name: 'Artisan Lens Photography',
        category: 'Photography',
        location: 'Houston, TX',
        city: 'Houston',
        state: 'TX',
        rating: 4.7,
        reviewCount: 98,
        startingPrice: 1800,
        priceRange: '$1,800 - $4,000',
        tier: 'Premium',
        description: 'Creative wedding photography with a documentary style. Natural, candid moments captured beautifully.',
        specialties: ['Documentary Style', 'Natural Light', 'Engagement Sessions', 'Albums'],
        yearsExperience: 5,
        completedEvents: 210,
        responseTime: '< 4 hours',
        availability: 'Available',
        featured: false,
        portfolioImages: [],
        verified: true,
        topRated: false,
      },
      {
        id: '12',
        name: 'Texas BBQ Catering Co.',
        category: 'Catering',
        location: 'Austin, TX',
        city: 'Austin',
        state: 'TX',
        rating: 4.8,
        reviewCount: 189,
        startingPrice: 2500,
        priceRange: '$2,500 - $7,000',
        tier: 'Featured',
        description: 'Authentic Texas BBQ catering for your wedding. Smoked meats, homemade sides, and Southern hospitality.',
        specialties: ['BBQ', 'Buffet Style', 'Taco Bars', 'Food Trucks'],
        yearsExperience: 9,
        completedEvents: 540,
        responseTime: '< 5 hours',
        availability: 'Available',
        featured: true,
        portfolioImages: [],
        verified: true,
        topRated: true,
      },
    ];

    setVendors(sampleVendors);
    setFilteredVendors(sampleVendors);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...vendors];

    // Search term
    if (searchTerm) {
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((v) => v.category === selectedCategory);
    }

    // Location filter
    if (selectedLocation !== 'All') {
      filtered = filtered.filter((v) => v.city === selectedLocation);
    }

    // Price filter
    if (priceFilter !== 'All') {
      if (priceFilter === 'budget') {
        filtered = filtered.filter((v) => v.startingPrice < 2000);
      } else if (priceFilter === 'mid') {
        filtered = filtered.filter((v) => v.startingPrice >= 2000 && v.startingPrice < 5000);
      } else if (priceFilter === 'luxury') {
        filtered = filtered.filter((v) => v.startingPrice >= 5000);
      }
    }

    // Rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter((v) => v.rating >= ratingFilter);
    }

    // Sort
    if (sortBy === 'recommended') {
      filtered.sort((a, b) => {
        // Featured first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        // Then by rating
        return b.rating - a.rating;
      });
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.startingPrice - a.startingPrice);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'reviews') {
      filtered.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    setFilteredVendors(filtered);
  }, [vendors, searchTerm, selectedCategory, selectedLocation, priceFilter, ratingFilter, sortBy]);

  const toggleFavorite = (vendorId: string) => {
    const newFavorites = favorites.includes(vendorId)
      ? favorites.filter((id) => id !== vendorId)
      : [...favorites, vendorId];
    setFavorites(newFavorites);
    localStorage.setItem('bella_favorite_vendors', JSON.stringify(newFavorites));
  };

  const categories = ['All', ...Array.from(new Set(vendors.map((v) => v.category)))];
  const locations = ['All', ...Array.from(new Set(vendors.map((v) => v.city)))];

  const getTierBadgeColor = (tier: string) => {
    if (tier === 'Elite') return 'bg-purple-100 text-purple-700 border-purple-300';
    if (tier === 'Featured') return 'bg-blue-100 text-blue-700 border-blue-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  const getAvailabilityColor = (availability: string) => {
    if (availability === 'Available') return 'text-green-600';
    if (availability === 'Limited') return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-purple-600">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Search className="w-10 h-10 text-purple-600" />
            </div>
            <div>
              <h1 className="text-4xl font-serif text-champagne-900 font-bold">Find Your Perfect Vendors</h1>
              <p className="text-champagne-600 mt-1">Discover vetted, top-rated wedding professionals</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-champagne-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search vendors by name, specialty, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-champagne-200 focus:border-purple-400 focus:outline-none text-champagne-900 text-lg"
            />
          </div>

          {/* Quick Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                showFilters
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border-2 border-champagne-200 text-champagne-700 hover:border-purple-400'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-champagne-200 focus:border-purple-400 focus:outline-none text-champagne-900"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-champagne-200 focus:border-purple-400 focus:outline-none text-champagne-900"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviewed</option>
            </select>

            <div className="ml-auto text-champagne-600">
              {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white border-b-2 border-champagne-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-champagne-700 mb-2">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-champagne-200 focus:border-purple-400 focus:outline-none"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-champagne-700 mb-2">Price Range</label>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-champagne-200 focus:border-purple-400 focus:outline-none"
                >
                  <option value="All">All Prices</option>
                  <option value="budget">Budget-Friendly (&lt; $2,000)</option>
                  <option value="mid">Mid-Range ($2,000 - $5,000)</option>
                  <option value="luxury">Luxury ($5,000+)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-champagne-700 mb-2">Minimum Rating</label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-champagne-200 focus:border-purple-400 focus:outline-none"
                >
                  <option value="0">All Ratings</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.7">4.7+ Stars</option>
                  <option value="4.8">4.8+ Stars</option>
                  <option value="4.9">4.9+ Stars</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedLocation('All');
                setPriceFilter('All');
                setRatingFilter(0);
                setSearchTerm('');
              }}
              className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {showAIRecommendations && selectedCategory !== 'All' && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">AI Recommendations</h2>
                  <p className="text-purple-100 text-sm">Based on your budget and preferences</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIRecommendations(false)}
                className="text-white/80 hover:text-white text-sm"
              >
                Dismiss
              </button>
            </div>

            {(() => {
              const recommendations = getVendorRecommendations(selectedCategory, userBudget || 5000);
              return (
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5" />
                    <h3 className="font-bold text-lg">{recommendations.tier} Tier Recommended</h3>
                  </div>
                  <p className="text-purple-100 mb-3">{recommendations.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-semibold">{recommendations.priceRange}</span>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Search Tips:</p>
                    <ul className="space-y-1 text-sm text-purple-100">
                      {recommendations.searchTips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span>•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Vendor Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredVendors.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-champagne-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-champagne-900 mb-2">No vendors found</h3>
            <p className="text-champagne-600 mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedLocation('All');
                setPriceFilter('All');
                setRatingFilter(0);
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => {
              const Icon = categoryIcons[vendor.category] || Users;
              const isFavorite = favorites.includes(vendor.id);

              return (
                <div
                  key={vendor.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-purple-300 overflow-hidden group"
                >
                  {/* Vendor Card Header */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                    <Icon className="w-20 h-20 text-purple-600/30" />
                    {vendor.featured && (
                      <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        FEATURED
                      </div>
                    )}
                    <button
                      onClick={() => toggleFavorite(vendor.id)}
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition"
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-champagne-400'}`}
                      />
                    </button>
                    <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-bold border ${getTierBadgeColor(vendor.tier)}`}>
                      {vendor.tier} Tier
                    </div>
                  </div>

                  {/* Vendor Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-champagne-900 mb-1">{vendor.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-champagne-600">
                          <MapPin className="w-4 h-4" />
                          {vendor.location}
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="font-bold text-champagne-900">{vendor.rating}</span>
                      </div>
                      <span className="text-sm text-champagne-600">({vendor.reviewCount} reviews)</span>
                      {vendor.topRated && (
                        <div className="ml-auto px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                          TOP RATED
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-champagne-600 mb-4 line-clamp-3">{vendor.description}</p>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {vendor.specialties.slice(0, 3).map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-champagne-100 text-champagne-700 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                      {vendor.specialties.length > 3 && (
                        <span className="px-2 py-1 bg-champagne-100 text-champagne-700 text-xs rounded-full">
                          +{vendor.specialties.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-champagne-200">
                      <div className="text-center">
                        <div className="text-xs text-champagne-600 mb-1">Experience</div>
                        <div className="font-bold text-champagne-900">{vendor.yearsExperience} years</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-champagne-600 mb-1">Events</div>
                        <div className="font-bold text-champagne-900">{vendor.completedEvents}</div>
                      </div>
                    </div>

                    {/* Price & Availability */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-xs text-champagne-600 mb-1">Starting at</div>
                        <div className="text-2xl font-bold text-champagne-900">
                          ${vendor.startingPrice.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-champagne-600 mb-1">Availability</div>
                        <div className={`font-bold ${getAvailabilityColor(vendor.availability)}`}>
                          {vendor.availability}
                        </div>
                      </div>
                    </div>

                    {/* Response Time */}
                    <div className="flex items-center gap-2 mb-4 text-sm text-champagne-600">
                      <TrendingUp className="w-4 h-4" />
                      Responds in {vendor.responseTime}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/messages?vendor=${vendor.id}`)}
                        className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                      <button
                        onClick={() => router.push(`/vendor-profile/${vendor.id}`)}
                        className="px-4 py-3 bg-champagne-100 text-champagne-900 rounded-lg hover:bg-champagne-200 transition font-medium"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
