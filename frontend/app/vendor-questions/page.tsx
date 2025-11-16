'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Heart, Sparkles, Music, Camera, Video, Utensils, Flower2, MapPin, Scissors, Cake, Users, Car, Package, Mail, ClipboardList, Printer, Download, CheckCircle2, Lightbulb, Guitar, ImagePlus, Shirt, Wine, Hotel } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';

interface VendorQuestion {
  id: string;
  question: string;
  category: 'services' | 'equipment' | 'logistics' | 'pricing' | 'experience' | 'contract';
  priority: 'critical' | 'important' | 'nice-to-know';
  asked?: boolean;
}

interface VendorCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  questions: VendorQuestion[];
}

const VENDOR_QUESTIONS: VendorCategory[] = [
  {
    id: 'dj',
    name: 'DJ / Music',
    icon: Music,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    questions: [
      { id: 'dj-1', question: 'Do you provide ceremony AND reception audio?', category: 'services', priority: 'critical' },
      { id: 'dj-2', question: 'Are wireless microphones included? How many?', category: 'equipment', priority: 'critical' },
      { id: 'dj-3', question: 'Do you offer music planning/consultation sessions?', category: 'services', priority: 'important' },
      { id: 'dj-4', question: 'How many setup locations can you handle (ceremony/cocktail/reception)?', category: 'logistics', priority: 'critical' },
      { id: 'dj-5', question: 'Do you need power at both ceremony and reception locations?', category: 'logistics', priority: 'critical' },
      { id: 'dj-6', question: 'Do you have backup equipment on-site?', category: 'equipment', priority: 'critical' },
      { id: 'dj-7', question: 'Do you accept must-play and do-not-play lists?', category: 'services', priority: 'important' },
      { id: 'dj-8', question: 'Do you MC/host announcements (introductions, toasts, cake cutting)?', category: 'services', priority: 'important' },
      { id: 'dj-9', question: 'What is your attire for weddings?', category: 'experience', priority: 'nice-to-know' },
      { id: 'dj-10', question: 'How do you handle song requests from guests?', category: 'services', priority: 'important' },
      { id: 'dj-11', question: 'What time do you arrive for setup?', category: 'logistics', priority: 'important' },
      { id: 'dj-12', question: 'Do you provide uplighting or other lighting effects?', category: 'equipment', priority: 'nice-to-know' },
      { id: 'dj-13', question: 'Do you carry liability insurance?', category: 'contract', priority: 'important' },
      { id: 'dj-14', question: 'What is your payment schedule (deposit, installments, final payment)?', category: 'pricing', priority: 'critical' },
      { id: 'dj-15', question: 'What are your overtime charges if we run late?', category: 'pricing', priority: 'important' },
      { id: 'dj-16', question: 'Do you charge travel fees for venues outside your area?', category: 'pricing', priority: 'important' },
    ]
  },
  {
    id: 'photographer',
    name: 'Photographer',
    icon: Camera,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    questions: [
      { id: 'photo-1', question: 'What is included in your packages (hours, deliverables, prints)?', category: 'services', priority: 'critical' },
      { id: 'photo-2', question: 'How many edited photos will we receive?', category: 'services', priority: 'critical' },
      { id: 'photo-3', question: 'What is the turnaround time for receiving our photos?', category: 'logistics', priority: 'important' },
      { id: 'photo-4', question: 'Do you have a backup photographer/assistant?', category: 'equipment', priority: 'critical' },
      { id: 'photo-5', question: 'Do you have backup cameras and equipment?', category: 'equipment', priority: 'critical' },
      { id: 'photo-6', question: 'Can we see full wedding galleries from recent weddings?', category: 'experience', priority: 'important' },
      { id: 'photo-7', question: 'Do you provide RAW files?', category: 'services', priority: 'nice-to-know' },
      { id: 'photo-8', question: 'Are engagement photos included?', category: 'services', priority: 'important' },
      { id: 'photo-9', question: 'Do you offer albums or prints? What is the cost?', category: 'pricing', priority: 'important' },
      { id: 'photo-10', question: 'How do you handle extreme weather or low-light situations?', category: 'experience', priority: 'important' },
      { id: 'photo-11', question: 'What is your editing style?', category: 'experience', priority: 'important' },
      { id: 'photo-12', question: 'Do you travel? What are travel fees?', category: 'pricing', priority: 'important' },
      { id: 'photo-13', question: 'Can we purchase the copyright/usage rights to our photos?', category: 'contract', priority: 'important' },
      { id: 'photo-14', question: 'How long do you keep our photos on file?', category: 'contract', priority: 'important' },
      { id: 'photo-15', question: 'Do you carry liability insurance?', category: 'contract', priority: 'important' },
      { id: 'photo-16', question: 'What is your payment schedule (deposit, installments, final payment)?', category: 'pricing', priority: 'critical' },
      { id: 'photo-17', question: 'What are your overtime charges if we run late?', category: 'pricing', priority: 'important' },
    ]
  },
  {
    id: 'videographer',
    name: 'Videographer',
    icon: Video,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    questions: [
      { id: 'video-1', question: 'What is included in your packages (hours, highlight reel, full ceremony)?', category: 'services', priority: 'critical' },
      { id: 'video-2', question: 'Do you provide both a highlight reel and full ceremony/reception video?', category: 'services', priority: 'critical' },
      { id: 'video-3', question: 'What is the turnaround time for receiving our videos?', category: 'logistics', priority: 'important' },
      { id: 'video-4', question: 'Do you provide RAW footage?', category: 'services', priority: 'nice-to-know' },
      { id: 'video-5', question: 'Do you offer drone footage? Is it included or extra?', category: 'services', priority: 'important' },
      { id: 'video-6', question: 'Do you have backup equipment and videographers?', category: 'equipment', priority: 'critical' },
      { id: 'video-7', question: 'Do you capture audio (vows, toasts, speeches)?', category: 'services', priority: 'critical' },
      { id: 'video-8', question: 'Can we choose the music for our highlight reel?', category: 'services', priority: 'important' },
      { id: 'video-9', question: 'How many videographers will be present?', category: 'logistics', priority: 'important' },
      { id: 'video-10', question: 'Do you coordinate with our photographer?', category: 'logistics', priority: 'important' },
      { id: 'video-11', question: 'How long do you keep our raw footage on file?', category: 'contract', priority: 'important' },
      { id: 'video-12', question: 'Do you carry liability insurance?', category: 'contract', priority: 'important' },
      { id: 'video-13', question: 'What is your payment schedule (deposit, installments, final payment)?', category: 'pricing', priority: 'critical' },
      { id: 'video-14', question: 'What are your overtime charges if we run late?', category: 'pricing', priority: 'important' },
      { id: 'video-15', question: 'Do you travel? What are travel fees?', category: 'pricing', priority: 'important' },
    ]
  },
  {
    id: 'caterer',
    name: 'Caterer / Food Service',
    icon: Utensils,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    questions: [
      { id: 'cater-1', question: 'Do you offer tastings? When and how many people can attend?', category: 'services', priority: 'critical' },
      { id: 'cater-2', question: 'Can you accommodate dietary restrictions (vegetarian, vegan, gluten-free, allergies)?', category: 'services', priority: 'critical' },
      { id: 'cater-3', question: 'What is your service style (buffet, plated, family-style, stations)?', category: 'services', priority: 'critical' },
      { id: 'cater-4', question: 'What is included in your per-person pricing?', category: 'pricing', priority: 'critical' },
      { id: 'cater-5', question: 'Do you provide tables, chairs, linens, plates, silverware, glassware?', category: 'equipment', priority: 'critical' },
      { id: 'cater-6', question: 'What is your staff-to-guest ratio?', category: 'logistics', priority: 'important' },
      { id: 'cater-7', question: 'Do you provide bar service? What is included?', category: 'services', priority: 'important' },
      { id: 'cater-8', question: 'Do you have liquor liability insurance?', category: 'contract', priority: 'critical' },
      { id: 'cater-9', question: 'What time do you need for setup and breakdown?', category: 'logistics', priority: 'important' },
      { id: 'cater-10', question: 'Do you provide vendor meals? What is the cost?', category: 'pricing', priority: 'important' },
      { id: 'cater-11', question: 'Can we provide our own alcohol? Is there a corkage fee?', category: 'pricing', priority: 'important' },
      { id: 'cater-12', question: 'What happens to leftover food?', category: 'services', priority: 'nice-to-know' },
      { id: 'cater-13', question: 'What is your health department rating?', category: 'contract', priority: 'critical' },
      { id: 'cater-14', question: 'Is the tasting included in the price or an extra charge?', category: 'pricing', priority: 'important' },
      { id: 'cater-15', question: 'When is the final headcount deadline?', category: 'logistics', priority: 'critical' },
      { id: 'cater-16', question: 'What is your payment schedule and overtime charges?', category: 'pricing', priority: 'critical' },
    ]
  },
  {
    id: 'florist',
    name: 'Florist',
    icon: Flower2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    questions: [
      { id: 'florist-1', question: 'Do you provide both ceremony and reception florals?', category: 'services', priority: 'critical' },
      { id: 'florist-2', question: 'What is included in your packages (bouquets, boutonnieres, centerpieces, ceremony arrangements)?', category: 'services', priority: 'critical' },
      { id: 'florist-3', question: 'Can you work with our budget? What do you recommend?', category: 'pricing', priority: 'critical' },
      { id: 'florist-4', question: 'Do you have photos of full weddings you\'ve done?', category: 'experience', priority: 'important' },
      { id: 'florist-5', question: 'How do you weatherproof outdoor arrangements?', category: 'logistics', priority: 'important' },
      { id: 'florist-6', question: 'What time will you deliver and set up on the wedding day?', category: 'logistics', priority: 'critical' },
      { id: 'florist-6a', question: 'Is there a delivery/setup fee? Does it vary by location?', category: 'pricing', priority: 'important' },
      { id: 'florist-7', question: 'Do you provide vases, containers, or stands?', category: 'equipment', priority: 'important' },
      { id: 'florist-8', question: 'What is your policy on flower substitutions if something is unavailable?', category: 'contract', priority: 'important' },
      { id: 'florist-9', question: 'Do you offer teardown service after the reception?', category: 'services', priority: 'important' },
      { id: 'florist-10', question: 'Can guests take centerpieces home?', category: 'services', priority: 'nice-to-know' },
      { id: 'florist-11', question: 'Do you offer bouquet preservation services?', category: 'services', priority: 'nice-to-know' },
      { id: 'florist-12', question: 'Will you be there during the ceremony setup?', category: 'logistics', priority: 'important' },
      { id: 'florist-13', question: 'Do you carry liability insurance in case flowers damage the venue?', category: 'contract', priority: 'important' },
      { id: 'florist-14', question: 'What is your payment schedule and cancellation policy?', category: 'pricing', priority: 'critical' },
    ]
  },
  {
    id: 'venue-ceremony',
    name: 'Ceremony Venue',
    icon: MapPin,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    questions: [
      { id: 'venue-c-1', question: 'What is the maximum capacity?', category: 'logistics', priority: 'critical' },
      { id: 'venue-c-2', question: 'What time can we access the venue for setup?', category: 'logistics', priority: 'critical' },
      { id: 'venue-c-3', question: 'When must we be done with teardown?', category: 'logistics', priority: 'critical' },
      { id: 'venue-c-4', question: 'Are candles or open flames allowed?', category: 'contract', priority: 'important' },
      { id: 'venue-c-5', question: 'Where are power outlets located?', category: 'logistics', priority: 'important' },
      { id: 'venue-c-6', question: 'Do you provide chairs, arch, or other ceremony items?', category: 'equipment', priority: 'critical' },
      { id: 'venue-c-7', question: 'What is your bad weather backup plan?', category: 'logistics', priority: 'critical' },
      { id: 'venue-c-8', question: 'Are there restrictions on decorations (no nails, tape, confetti, etc.)?', category: 'contract', priority: 'important' },
      { id: 'venue-c-9', question: 'Is there a bridal suite or getting-ready space?', category: 'services', priority: 'important' },
      { id: 'venue-c-10', question: 'Do you provide sound system for ceremony music?', category: 'equipment', priority: 'important' },
      { id: 'venue-c-11', question: 'Are there parking accommodations for guests?', category: 'logistics', priority: 'important' },
      { id: 'venue-c-12', question: 'What is your cancellation/postponement policy?', category: 'contract', priority: 'critical' },
      { id: 'venue-c-13', question: 'Is there a security deposit? What could cause us to lose it?', category: 'pricing', priority: 'critical' },
      { id: 'venue-c-14', question: 'Are there noise restrictions or curfews?', category: 'contract', priority: 'important' },
      { id: 'venue-c-15', question: 'What is your payment schedule?', category: 'pricing', priority: 'critical' },
    ]
  },
  {
    id: 'venue-reception',
    name: 'Reception Venue',
    icon: MapPin,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    questions: [
      { id: 'venue-r-1', question: 'What is the maximum capacity?', category: 'logistics', priority: 'critical' },
      { id: 'venue-r-2', question: 'What time can we access the venue for setup?', category: 'logistics', priority: 'critical' },
      { id: 'venue-r-3', question: 'When must we be done with teardown?', category: 'logistics', priority: 'critical' },
      { id: 'venue-r-4', question: 'What is included in the rental (tables, chairs, linens, dinnerware)?', category: 'services', priority: 'critical' },
      { id: 'venue-r-5', question: 'Do you have a preferred vendor list? Are we required to use them?', category: 'contract', priority: 'critical' },
      { id: 'venue-r-6', question: 'Is there a noise ordinance or end time?', category: 'contract', priority: 'critical' },
      { id: 'venue-r-7', question: 'Do you provide a day-of coordinator?', category: 'services', priority: 'important' },
      { id: 'venue-r-8', question: 'Are candles or open flames allowed?', category: 'contract', priority: 'important' },
      { id: 'venue-r-9', question: 'Is there a backup generator in case of power outage?', category: 'equipment', priority: 'important' },
      { id: 'venue-r-10', question: 'Can we bring our own alcohol? Is there a corkage fee?', category: 'pricing', priority: 'important' },
      { id: 'venue-r-11', question: 'Are there getting-ready spaces for bride and groom?', category: 'services', priority: 'important' },
      { id: 'venue-r-12', question: 'What is your cancellation/postponement policy?', category: 'contract', priority: 'critical' },
      { id: 'venue-r-13', question: 'Is there a security deposit? What could cause us to lose it?', category: 'pricing', priority: 'critical' },
      { id: 'venue-r-14', question: 'What is your inclement weather policy?', category: 'contract', priority: 'important' },
      { id: 'venue-r-15', question: 'What is your payment schedule?', category: 'pricing', priority: 'critical' },
    ]
  },
  {
    id: 'hair-makeup',
    name: 'Hair & Makeup',
    icon: Scissors,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    questions: [
      { id: 'hmu-1', question: 'Do you offer both hair and makeup services?', category: 'services', priority: 'critical' },
      { id: 'hmu-2', question: 'Do you offer trial runs? What is the cost?', category: 'services', priority: 'critical' },
      { id: 'hmu-3', question: 'How many people can you accommodate (bridesmaids, mothers)?', category: 'logistics', priority: 'critical' },
      { id: 'hmu-4', question: 'Will you travel to our getting-ready location? Is there a fee?', category: 'pricing', priority: 'critical' },
      { id: 'hmu-5', question: 'How long does each person take?', category: 'logistics', priority: 'important' },
      { id: 'hmu-6', question: 'What time will you arrive on the wedding day?', category: 'logistics', priority: 'critical' },
      { id: 'hmu-7', question: 'Do you provide false lashes, airbrush makeup, or hair extensions?', category: 'services', priority: 'nice-to-know' },
      { id: 'hmu-8', question: 'Do you use long-lasting/waterproof products?', category: 'experience', priority: 'important' },
      { id: 'hmu-9', question: 'Do you bring a makeup kit for touch-ups?', category: 'services', priority: 'nice-to-know' },
      { id: 'hmu-10', question: 'Do you have photos of your work on different hair types and skin tones?', category: 'experience', priority: 'important' },
      { id: 'hmu-11', question: 'Do you carry liability insurance?', category: 'contract', priority: 'important' },
      { id: 'hmu-12', question: 'What is your payment schedule and cancellation policy?', category: 'pricing', priority: 'critical' },
    ]
  },
  {
    id: 'cake',
    name: 'Cake Baker',
    icon: Cake,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    questions: [
      { id: 'cake-1', question: 'Do you offer tastings? How many flavors can we sample?', category: 'services', priority: 'critical' },
      { id: 'cake-2', question: 'Can you create a custom design based on our ideas?', category: 'services', priority: 'important' },
      { id: 'cake-3', question: 'What flavors and fillings do you offer?', category: 'services', priority: 'critical' },
      { id: 'cake-4', question: 'Do you offer gluten-free, vegan, or allergen-free options?', category: 'services', priority: 'important' },
      { id: 'cake-5', question: 'What time will the cake be delivered?', category: 'logistics', priority: 'critical' },
      { id: 'cake-5a', question: 'Is there a delivery fee? Does it vary by distance?', category: 'pricing', priority: 'important' },
      { id: 'cake-6', question: 'Do you provide setup and a cake stand?', category: 'services', priority: 'important' },
      { id: 'cake-7', question: 'How far in advance should we order?', category: 'logistics', priority: 'important' },
      { id: 'cake-8', question: 'What is your pricing (per slice, by tier, by design complexity)?', category: 'pricing', priority: 'critical' },
      { id: 'cake-9', question: 'Do you make groom\'s cakes or dessert tables?', category: 'services', priority: 'nice-to-know' },
      { id: 'cake-10', question: 'What happens if the cake is damaged during delivery?', category: 'contract', priority: 'important' },
      { id: 'cake-11', question: 'Do you carry liability insurance?', category: 'contract', priority: 'important' },
      { id: 'cake-12', question: 'What is your payment schedule and cancellation policy?', category: 'pricing', priority: 'critical' },
    ]
  },
  {
    id: 'officiant',
    name: 'Officiant',
    icon: Users,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    questions: [
      { id: 'off-1', question: 'Are you licensed to perform marriages in our state?', category: 'contract', priority: 'critical' },
      { id: 'off-2', question: 'What is your ceremony style (religious, secular, personalized)?', category: 'services', priority: 'critical' },
      { id: 'off-3', question: 'Can we write our own vows or customize the ceremony?', category: 'services', priority: 'important' },
      { id: 'off-4', question: 'Will you attend our rehearsal? Is there an extra fee?', category: 'pricing', priority: 'important' },
      { id: 'off-5', question: 'What time will you arrive on the wedding day?', category: 'logistics', priority: 'critical' },
      { id: 'off-6', question: 'Do you provide the marriage license or do we?', category: 'contract', priority: 'critical' },
      { id: 'off-7', question: 'How many meetings do we have before the wedding?', category: 'services', priority: 'important' },
      { id: 'off-8', question: 'Do you have experience with interfaith or multicultural ceremonies?', category: 'experience', priority: 'important' },
      { id: 'off-9', question: 'What is your backup plan if you are sick or unable to perform?', category: 'contract', priority: 'critical' },
      { id: 'off-10', question: 'What is your attire for the ceremony?', category: 'experience', priority: 'nice-to-know' },
      { id: 'off-11', question: 'Do you carry liability insurance?', category: 'contract', priority: 'important' },
      { id: 'off-12', question: 'What is your payment schedule?', category: 'pricing', priority: 'critical' },
      { id: 'off-13', question: 'Do you charge travel fees for venues outside your area?', category: 'pricing', priority: 'important' },
    ]
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: Car,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    questions: [
      { id: 'trans-1', question: 'What types of vehicles do you offer?', category: 'services', priority: 'critical' },
      { id: 'trans-2', question: 'How many passengers can each vehicle accommodate?', category: 'logistics', priority: 'critical' },
      { id: 'trans-3', question: 'What is included in your pricing (hours, mileage, gratuity)?', category: 'pricing', priority: 'critical' },
      { id: 'trans-4', question: 'Is there a minimum rental time?', category: 'contract', priority: 'important' },
      { id: 'trans-5', question: 'What time will you arrive for pickup?', category: 'logistics', priority: 'critical' },
      { id: 'trans-6', question: 'Do you provide champagne or refreshments in the vehicle?', category: 'services', priority: 'nice-to-know' },
      { id: 'trans-7', question: 'What is your cancellation policy?', category: 'contract', priority: 'important' },
      { id: 'trans-8', question: 'Do you have backup vehicles in case of breakdown?', category: 'equipment', priority: 'critical' },
      { id: 'trans-9', question: 'Are your drivers licensed and insured?', category: 'contract', priority: 'critical' },
      { id: 'trans-10', question: 'Can we decorate the vehicle (just married sign, cans)?', category: 'services', priority: 'nice-to-know' },
      { id: 'trans-11', question: 'What is your payment schedule and overtime charges?', category: 'pricing', priority: 'critical' },
    ]
  },
  {
    id: 'rentals-general',
    name: 'Rental Company - General',
    icon: Package,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    questions: [
      { id: 'rent-gen-1', question: 'What items do you provide (tables, chairs, linens, tents, etc.)?', category: 'services', priority: 'critical' },
      { id: 'rent-gen-2', question: 'Do you offer delivery and setup? What is the cost?', category: 'pricing', priority: 'critical' },
      { id: 'rent-gen-3', question: 'Do you offer pickup/teardown after the event?', category: 'services', priority: 'critical' },
      { id: 'rent-gen-4', question: 'What time will items be delivered and picked up?', category: 'logistics', priority: 'critical' },
      { id: 'rent-gen-5', question: 'What is your policy on damaged or lost items?', category: 'contract', priority: 'important' },
      { id: 'rent-gen-6', question: 'How should items be packed/prepared for pickup? Any special requirements?', category: 'contract', priority: 'important' },
      { id: 'rent-gen-7', question: 'Do you have photos or samples we can see?', category: 'experience', priority: 'important' },
      { id: 'rent-gen-8', question: 'What is your cancellation/change policy?', category: 'contract', priority: 'important' },
      { id: 'rent-gen-9', question: 'Do you provide weather protection for outdoor events?', category: 'equipment', priority: 'important' },
      { id: 'rent-gen-10', question: 'Is there a minimum order amount?', category: 'pricing', priority: 'important' },
      { id: 'rent-gen-11', question: 'Do you carry liability insurance?', category: 'contract', priority: 'important' },
      { id: 'rent-gen-12', question: 'What is your payment schedule?', category: 'pricing', priority: 'critical' },
      { id: 'rent-gen-13', question: 'What are your overtime charges if delivery/pickup runs late?', category: 'pricing', priority: 'important' },
    ]
  },
  {
    id: 'rentals-linens',
    name: 'Rental - Linens & Tableware',
    icon: Package,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    questions: [
      { id: 'rent-linen-1', question: 'What table linen sizes do you offer (for 60" round, 8ft banquet, cocktail tables)?', category: 'equipment', priority: 'critical' },
      { id: 'rent-linen-2', question: 'Do linens arrive pressed/steamed or wrinkled?', category: 'services', priority: 'important' },
      { id: 'rent-linen-3', question: 'Do you provide table clips to secure linens in wind (for outdoor events)?', category: 'equipment', priority: 'important' },
      { id: 'rent-linen-4', question: 'What napkin colors and folding options are available?', category: 'services', priority: 'important' },
      { id: 'rent-linen-5', question: 'Do you provide charger plates, flatware, and glassware?', category: 'equipment', priority: 'critical' },
      { id: 'rent-linen-6', question: 'Do you offer china or only plastic? What is the pricing difference?', category: 'pricing', priority: 'important' },
      { id: 'rent-linen-7', question: 'What happens if we stain or damage linens?', category: 'contract', priority: 'important' },
      { id: 'rent-linen-8', question: 'Do linens need to be laundered before return or returned as-is?', category: 'contract', priority: 'critical' },
    ]
  },
  {
    id: 'rentals-lighting',
    name: 'Rental - Lighting & Power',
    icon: Package,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    questions: [
      { id: 'rent-light-1', question: 'Do you provide extension cords and power strips?', category: 'equipment', priority: 'critical' },
      { id: 'rent-light-2', question: 'Are your lights indoor/outdoor rated?', category: 'equipment', priority: 'critical' },
      { id: 'rent-light-3', question: 'What is the total wattage? Will it trip circuit breakers?', category: 'logistics', priority: 'critical' },
      { id: 'rent-light-4', question: 'Do you install string lights/fairy lights or do we hang them ourselves?', category: 'services', priority: 'critical' },
      { id: 'rent-light-5', question: 'Do you provide ladders for installation?', category: 'equipment', priority: 'important' },
      { id: 'rent-light-6', question: 'Are battery-powered lighting options available? Who is responsible for changing batteries?', category: 'services', priority: 'important' },
      { id: 'rent-light-7', question: 'Do you provide generators for outdoor events without power access?', category: 'equipment', priority: 'important' },
      { id: 'rent-light-8', question: 'What time do you arrive to set up lighting? How long does installation take?', category: 'logistics', priority: 'critical' },
      { id: 'rent-light-9', question: 'Do you test all lights before leaving the venue?', category: 'services', priority: 'critical' },
      { id: 'rent-light-10', question: 'What is the backup plan if lights fail during the event?', category: 'contract', priority: 'critical' },
    ]
  },
  {
    id: 'rentals-structures',
    name: 'Rental - Structures (Tents/Arbors)',
    icon: Package,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    questions: [
      { id: 'rent-struct-1', question: 'What tent sizes are available and how many guests can each accommodate?', category: 'equipment', priority: 'critical' },
      { id: 'rent-struct-2', question: 'Are tent sides/walls included for weather protection?', category: 'equipment', priority: 'critical' },
      { id: 'rent-struct-3', question: 'Do you provide heating or cooling inside tents?', category: 'equipment', priority: 'important' },
      { id: 'rent-struct-4', question: 'Is the tent free-standing or does it require staking into the ground?', category: 'logistics', priority: 'critical' },
      { id: 'rent-struct-5', question: 'Do we need permits for tent installation? Do you handle that?', category: 'contract', priority: 'critical' },
      { id: 'rent-struct-6', question: 'How is the tent secured (stakes, weights, ballasts)?', category: 'logistics', priority: 'critical' },
      { id: 'rent-struct-7', question: 'Can we hang chandeliers or décor from the tent ceiling?', category: 'services', priority: 'important' },
      { id: 'rent-struct-8', question: 'What is the setup and teardown timeline for tents?', category: 'logistics', priority: 'critical' },
      { id: 'rent-struct-9', question: 'What arbor/arch options do you offer (wood, metal, floral-ready)?', category: 'equipment', priority: 'important' },
      { id: 'rent-struct-10', question: 'Is the arbor free-standing or does it need staking?', category: 'logistics', priority: 'important' },
      { id: 'rent-struct-11', question: 'How do we attach florals to the arbor? Does it have hooks or wire points?', category: 'services', priority: 'important' },
      { id: 'rent-struct-12', question: 'What is the wind tolerance for tents and arbors?', category: 'logistics', priority: 'critical' },
    ]
  },
  {
    id: 'stationer',
    name: 'Stationer / Invitations',
    icon: Mail,
    color: 'text-fuchsia-600',
    bgColor: 'bg-fuchsia-50',
    borderColor: 'border-fuchsia-200',
    questions: [
      { id: 'stat-1', question: 'What is included in your invitation suites (save-the-dates, invites, RSVP cards, envelopes)?', category: 'services', priority: 'critical' },
      { id: 'stat-2', question: 'Can you create custom designs based on our wedding theme?', category: 'services', priority: 'important' },
      { id: 'stat-3', question: 'What printing methods do you offer (letterpress, foil, digital)?', category: 'services', priority: 'important' },
      { id: 'stat-4', question: 'What is your turnaround time?', category: 'logistics', priority: 'critical' },
      { id: 'stat-5', question: 'Do you offer addressing services (printing or calligraphy)?', category: 'services', priority: 'important' },
      { id: 'stat-6', question: 'Do you provide samples before we place our order?', category: 'services', priority: 'important' },
      { id: 'stat-7', question: 'What is your pricing structure (per invitation, flat fee, by complexity)?', category: 'pricing', priority: 'critical' },
      { id: 'stat-8', question: 'Do you offer day-of stationery (menus, programs, place cards, signage)?', category: 'services', priority: 'important' },
      { id: 'stat-9', question: 'How many rounds of revisions are included?', category: 'contract', priority: 'important' },
      { id: 'stat-10', question: 'Do you offer envelope liners or wax seals?', category: 'services', priority: 'nice-to-know' },
      { id: 'stat-11', question: 'What is your payment schedule and cancellation policy?', category: 'pricing', priority: 'critical' },
    ]
  },
  {
    id: 'coordinator',
    name: 'Wedding Planner / Coordinator',
    icon: ClipboardList,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    questions: [
      { id: 'coord-1', question: 'What services do you offer (full planning, partial planning, day-of coordination)?', category: 'services', priority: 'critical' },
      { id: 'coord-2', question: 'How many meetings do we have leading up to the wedding?', category: 'services', priority: 'important' },
      { id: 'coord-3', question: 'Will you attend our rehearsal?', category: 'services', priority: 'critical' },
      { id: 'coord-4', question: 'How many hours do you work on the wedding day?', category: 'logistics', priority: 'critical' },
      { id: 'coord-5', question: 'Do you have assistants on the wedding day? How many?', category: 'logistics', priority: 'important' },
      { id: 'coord-6', question: 'Do you help with vendor selection and contract review?', category: 'services', priority: 'important' },
      { id: 'coord-7', question: 'Do you create and manage the wedding day timeline?', category: 'services', priority: 'critical' },
      { id: 'coord-8', question: 'What is your emergency kit equipped with?', category: 'experience', priority: 'nice-to-know' },
      { id: 'coord-9', question: 'How do you handle vendor issues or emergencies on the wedding day?', category: 'experience', priority: 'important' },
      { id: 'coord-10', question: 'Do you provide setup and teardown services?', category: 'services', priority: 'important' },
      { id: 'coord-11', question: 'Can we see testimonials or references from past couples?', category: 'experience', priority: 'important' },
      { id: 'coord-12', question: 'What is your cancellation/postponement policy?', category: 'contract', priority: 'critical' },
      { id: 'coord-13', question: 'Do you carry liability insurance?', category: 'contract', priority: 'important' },
      { id: 'coord-14', question: 'What is your payment schedule (deposit, installments, final payment)?', category: 'pricing', priority: 'critical' },
      { id: 'coord-15', question: 'What are your overtime charges if we run late?', category: 'pricing', priority: 'important' },
    ]
  },
  {
    id: 'decor-styling',
    name: 'Décor & Event Styling',
    icon: Lightbulb,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    questions: [
      { id: 'decor-1', question: 'Do you provide fairy lights? Are they indoor/outdoor rated?', category: 'equipment', priority: 'critical' },
      { id: 'decor-2', question: 'Do you have lanterns available? Battery-powered or candle-powered?', category: 'equipment', priority: 'critical' },
      { id: 'decor-3', question: 'How do you ensure battery-powered items are fully charged on wedding day?', category: 'logistics', priority: 'critical' },
      { id: 'decor-4', question: 'Do you weatherproof outdoor décor items?', category: 'services', priority: 'important' },
      { id: 'decor-5', question: 'What is included in setup and teardown services?', category: 'services', priority: 'critical' },
      { id: 'decor-6', question: 'Do you offer design consultations to match our theme?', category: 'services', priority: 'important' },
      { id: 'decor-7', question: 'Can you source specialty items (vintage, cultural, themed décor)?', category: 'services', priority: 'important' },
      { id: 'decor-8', question: 'What is your policy on damaged or lost rental décor?', category: 'contract', priority: 'important' },
      { id: 'decor-9', question: 'What time will you arrive for setup? How long does it take?', category: 'logistics', priority: 'critical' },
      { id: 'decor-10', question: 'Do you provide candles? Are they flame or LED?', category: 'equipment', priority: 'important' },
      { id: 'decor-11', question: 'Do you carry liability insurance?', category: 'contract', priority: 'important' },
      { id: 'decor-12', question: 'What is your payment schedule and cancellation policy?', category: 'pricing', priority: 'critical' },
    ]
  },
  {
    id: 'live-music',
    name: 'Live Music / Band',
    icon: Guitar,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    questions: [
      { id: 'music-1', question: 'Do you provide ceremony AND cocktail hour AND reception music?', category: 'services', priority: 'critical' },
      { id: 'music-2', question: 'How many band members will perform?', category: 'logistics', priority: 'critical' },
      { id: 'music-3', question: 'How many breaks do you take? Who provides music during breaks?', category: 'services', priority: 'critical' },
      { id: 'music-4', question: 'Do you take requests from guests?', category: 'services', priority: 'important' },
      { id: 'music-5', question: 'What is your repertoire? Can we hear samples or see setlists?', category: 'experience', priority: 'critical' },
      { id: 'music-6', question: 'Do you provide sound amplification and microphones?', category: 'equipment', priority: 'critical' },
      { id: 'music-7', question: 'What time do you arrive for setup? How much space do you need?', category: 'logistics', priority: 'critical' },
      { id: 'music-8', question: 'Do you have backup musicians if someone is sick?', category: 'contract', priority: 'critical' },
      { id: 'music-9', question: 'What is your attire? Can you match our wedding style?', category: 'experience', priority: 'important' },
      { id: 'music-10', question: 'Do you carry liability insurance?', category: 'contract', priority: 'important' },
      { id: 'music-11', question: 'What is your payment schedule and overtime charges?', category: 'pricing', priority: 'critical' },
      { id: 'music-12', question: 'Do you charge travel fees for venues outside your area?', category: 'pricing', priority: 'important' },
    ]
  },
  {
    id: 'photo-booth',
    name: 'Photo Booth',
    icon: ImagePlus,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    questions: [
      { id: 'booth-1', question: 'What is included (props, backdrops, attendant, prints)?', category: 'services', priority: 'critical' },
      { id: 'booth-2', question: 'Are digital copies provided? How are they delivered?', category: 'services', priority: 'critical' },
      { id: 'booth-3', question: 'Are prints unlimited or capped?', category: 'services', priority: 'critical' },
      { id: 'booth-4', question: 'Do you offer social media sharing capability?', category: 'services', priority: 'important' },
      { id: 'booth-5', question: 'Can we customize photo templates with our names/wedding date?', category: 'services', priority: 'important' },
      { id: 'booth-6', question: 'What time do you need for setup and teardown?', category: 'logistics', priority: 'critical' },
      { id: 'booth-7', question: 'How much space is required for the booth?', category: 'logistics', priority: 'critical' },
      { id: 'booth-8', question: 'Will an attendant be present the entire time?', category: 'services', priority: 'important' },
      { id: 'booth-9', question: 'Do you provide a guestbook or scrapbook option?', category: 'services', priority: 'nice-to-know' },
      { id: 'booth-10', question: 'Do you carry liability insurance?', category: 'contract', priority: 'important' },
      { id: 'booth-11', question: 'What is your cancellation policy and payment schedule?', category: 'pricing', priority: 'critical' },
      { id: 'booth-12', question: 'Do you charge delivery/travel fees for venues outside your area?', category: 'pricing', priority: 'important' },
    ]
  },
  {
    id: 'bridal-shop',
    name: 'Bridal Shop / Alterations',
    icon: Shirt,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    questions: [
      { id: 'bridal-1', question: 'How many fittings are included in the alteration cost?', category: 'pricing', priority: 'critical' },
      { id: 'bridal-2', question: 'What is the alteration timeline? When should I schedule fittings?', category: 'logistics', priority: 'critical' },
      { id: 'bridal-3', question: 'What if I gain or lose weight before the wedding?', category: 'services', priority: 'important' },
      { id: 'bridal-4', question: 'Do you steam or press the dress before final pickup?', category: 'services', priority: 'important' },
      { id: 'bridal-5', question: 'What is your dress preservation/cleaning policy after the wedding?', category: 'services', priority: 'important' },
      { id: 'bridal-6', question: 'Do you offer emergency alterations the day before or day of?', category: 'services', priority: 'critical' },
      { id: 'bridal-7', question: 'Can I store my dress at the shop until closer to the wedding?', category: 'services', priority: 'nice-to-know' },
      { id: 'bridal-8', question: 'What accessories do you recommend (veil, belt, jewelry)?', category: 'experience', priority: 'nice-to-know' },
      { id: 'bridal-9', question: 'Do you offer bustle services? What style?', category: 'services', priority: 'important' },
      { id: 'bridal-10', question: 'What is your payment schedule for the dress and alterations?', category: 'pricing', priority: 'critical' },
    ]
  },
  {
    id: 'bar-service',
    name: 'Bar Service',
    icon: Wine,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    questions: [
      { id: 'bar-1', question: 'What is included (bartenders, mixers, garnishes, ice, cups)?', category: 'services', priority: 'critical' },
      { id: 'bar-2', question: 'Do you provide alcohol or just bartending service?', category: 'services', priority: 'critical' },
      { id: 'bar-3', question: 'Do you carry liquor liability insurance?', category: 'contract', priority: 'critical' },
      { id: 'bar-4', question: 'Do you create signature cocktails for our wedding?', category: 'services', priority: 'important' },
      { id: 'bar-5', question: 'What is your pricing (cash bar, open bar, consumption-based)?', category: 'pricing', priority: 'critical' },
      { id: 'bar-6', question: 'How do you handle intoxicated or underage guests?', category: 'experience', priority: 'critical' },
      { id: 'bar-7', question: 'How many bartenders will be present? What is your guest-to-bartender ratio?', category: 'logistics', priority: 'critical' },
      { id: 'bar-8', question: 'Can we provide our own alcohol? Is there a corkage fee?', category: 'pricing', priority: 'important' },
      { id: 'bar-9', question: 'Do you offer non-alcoholic options (mocktails, specialty sodas)?', category: 'services', priority: 'important' },
      { id: 'bar-10', question: 'What time do you arrive for setup? How much bar space is needed?', category: 'logistics', priority: 'critical' },
      { id: 'bar-11', question: 'What is your payment schedule and overtime charges?', category: 'pricing', priority: 'critical' },
    ]
  },
  {
    id: 'hotel',
    name: 'Hotel / Accommodations',
    icon: Hotel,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    questions: [
      { id: 'hotel-1', question: 'What group rate discount can you offer?', category: 'pricing', priority: 'critical' },
      { id: 'hotel-2', question: 'How many rooms are in the block? Can we add more later?', category: 'logistics', priority: 'critical' },
      { id: 'hotel-3', question: 'What is the cutoff date for guests to book at the group rate?', category: 'contract', priority: 'critical' },
      { id: 'hotel-4', question: 'Is a complimentary suite provided for the couple?', category: 'pricing', priority: 'important' },
      { id: 'hotel-5', question: 'Do you offer shuttle service to/from the venue?', category: 'services', priority: 'important' },
      { id: 'hotel-6', question: 'Can we provide welcome bags or have a hospitality suite?', category: 'services', priority: 'important' },
      { id: 'hotel-7', question: 'What amenities are included (breakfast, parking, Wi-Fi, pool)?', category: 'services', priority: 'important' },
      { id: 'hotel-8', question: 'Are there getting-ready spaces available for the bridal party?', category: 'services', priority: 'important' },
      { id: 'hotel-9', question: 'What is your cancellation policy for room blocks and individual rooms?', category: 'contract', priority: 'critical' },
      { id: 'hotel-10', question: 'How do guests book? Do you provide a booking link or code?', category: 'logistics', priority: 'critical' },
      { id: 'hotel-11', question: 'Are there group dining options or room service available?', category: 'services', priority: 'nice-to-know' },
    ]
  },
];

function VendorQuestionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading } = useAuth();
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  // Preview mode - show only Photography vendor questions
  const previewVendor = VENDOR_QUESTIONS.find(v => v.id === 'photographer');
  const previewContent = previewVendor ? (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          {previewVendor.icon && <previewVendor.icon className={`w-6 h-6 ${previewVendor.color}`} />}
          <h3 className="text-xl font-bold text-gray-900">{previewVendor.name}</h3>
          <span className="ml-auto bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-medium">
            {previewVendor.questions.length} Questions
          </span>
        </div>
        <div className="space-y-2">
          {previewVendor.questions.slice(0, 5).map((q, idx) => (
            <div key={q.id} className="text-sm text-gray-700 flex gap-2">
              <span className="text-gray-400">{idx + 1}.</span>
              <span>{q.question}</span>
            </div>
          ))}
          <p className="text-sm text-gray-500 italic mt-3">
            + {previewVendor.questions.length - 5} more questions...
          </p>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
        <p className="text-sm text-blue-900 font-medium">
          📋 {VENDOR_QUESTIONS.length - 1} more vendor categories with 200+ total questions available
        </p>
      </div>
    </div>
  ) : null;

  if (!isAuthenticated) {
    return <AuthWall featureName="Vendor Questions" previewContent={previewContent} fullLock={false} />;
  }

  // Auto-select vendor from URL parameter
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && VENDOR_QUESTIONS.find(v => v.id === categoryParam)) {
      setSelectedVendor(categoryParam);
    }
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!currentVendor) return;

    const content = `${currentVendor.name} - Vendor Questions\n\n` +
      filteredQuestions.map((q, idx) => `${idx + 1}. [${q.priority.toUpperCase()}] ${q.question}`).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentVendor.name.replace(/\s+/g, '_')}_Questions.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleAsked = (questionId: string) => {
    const newAsked = new Set(askedQuestions);
    if (newAsked.has(questionId)) {
      newAsked.delete(questionId);
    } else {
      newAsked.add(questionId);
    }
    setAskedQuestions(newAsked);
  };

  const currentVendor = VENDOR_QUESTIONS.find(v => v.id === selectedVendor);

  const filteredQuestions = currentVendor
    ? currentVendor.questions.filter(q => {
        if (filterCategory !== 'all' && q.category !== filterCategory) return false;
        if (filterPriority !== 'all' && q.priority !== filterPriority) return false;
        return true;
      })
    : [];

  const progress = currentVendor
    ? Math.round((Array.from(askedQuestions).filter(id => currentVendor.questions.some(q => q.id === id)).length / currentVendor.questions.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-rose-50 to-champagne-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Vendor Questions Database</h1>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-purple-600" />
            <h2 className="text-5xl font-serif font-bold text-gray-900">
              Critical Vendor Questions
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional wedding planner questions to ask every vendor. Don't sign a contract without asking these!
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-100 border-2 border-purple-300 rounded-full">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-bold text-purple-900">
              Our Competitive Advantage - Questions Other Apps Don't Provide
            </span>
          </div>
        </div>

        {!selectedVendor ? (
          // Vendor Category Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VENDOR_QUESTIONS.map(vendor => {
              const Icon = vendor.icon;
              return (
                <button
                  key={vendor.id}
                  onClick={() => setSelectedVendor(vendor.id)}
                  className={`${vendor.bgColor} border-2 ${vendor.borderColor} rounded-2xl p-8 hover:shadow-xl transition transform hover:scale-105 text-left`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Icon className={`w-12 h-12 ${vendor.color}`} />
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${vendor.color}`}>
                        {vendor.questions.length}
                      </div>
                      <div className="text-sm text-gray-600">Questions</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{vendor.name}</h3>
                  <p className="text-sm text-gray-600">
                    Essential questions every couple should ask
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          // Question Detail View
          <div>
            {/* Back Button & Progress */}
            <div className="mb-8">
              <button
                onClick={() => {
                  setSelectedVendor(null);
                  setFilterCategory('all');
                  setFilterPriority('all');
                }}
                className="text-champagne-600 hover:text-champagne-700 font-medium mb-4 flex items-center gap-2"
              >
                ← Back to All Vendors
              </button>

              <div className={`${currentVendor?.bgColor} border-2 ${currentVendor?.borderColor} rounded-2xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {currentVendor && <currentVendor.icon className={`w-10 h-10 ${currentVendor.color}`} />}
                    <div>
                      <h2 className="text-3xl font-serif font-bold text-gray-900">{currentVendor?.name}</h2>
                      <p className="text-gray-600">{currentVendor?.questions.length} critical questions</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-medium"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-gradient-to-r from-champagne-500 to-rose-500 text-white rounded-lg hover:from-champagne-600 hover:to-rose-600 flex items-center gap-2 font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Questions Asked</span>
                    <span className="text-sm font-bold text-gray-900">{progress}%</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-3 border border-gray-200">
                    <div
                      className="bg-gradient-to-r from-champagne-500 to-rose-500 h-3 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-champagne-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="services">Services</option>
                    <option value="equipment">Equipment</option>
                    <option value="logistics">Logistics</option>
                    <option value="pricing">Pricing</option>
                    <option value="experience">Experience</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Priority</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-champagne-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="important">Important</option>
                    <option value="nice-to-know">Nice to Know</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {filteredQuestions.map((question, index) => {
                const isAsked = askedQuestions.has(question.id);
                const priorityColors = {
                  critical: 'border-red-300 bg-red-50',
                  important: 'border-amber-300 bg-amber-50',
                  'nice-to-know': 'border-gray-300 bg-gray-50',
                };
                const priorityBadge = {
                  critical: 'bg-red-100 text-red-800',
                  important: 'bg-amber-100 text-amber-800',
                  'nice-to-know': 'bg-gray-100 text-gray-800',
                };

                return (
                  <div
                    key={question.id}
                    className={`bg-white border-2 rounded-xl p-5 shadow-sm transition ${
                      isAsked ? 'opacity-60' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleAsked(question.id)}
                        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                          isAsked
                            ? 'bg-green-600 border-green-600'
                            : 'border-gray-300 hover:border-champagne-500'
                        }`}
                      >
                        {isAsked && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className={`text-lg font-semibold ${isAsked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {index + 1}. {question.question}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityBadge[question.priority]}`}>
                            {question.priority === 'critical' ? '🔴 Critical' : question.priority === 'important' ? '🟡 Important' : '🟢 Nice to Know'}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {question.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredQuestions.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-200">
                <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No questions match your filters</p>
                <button
                  onClick={() => {
                    setFilterCategory('all');
                    setFilterPriority('all');
                  }}
                  className="mt-4 text-champagne-600 hover:text-champagne-700 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VendorQuestions() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-rose-50 to-champagne-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-champagne-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading vendor questions...</p>
        </div>
      </div>
    }>
      <VendorQuestionsContent />
    </Suspense>
  );
}
