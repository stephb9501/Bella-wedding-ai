'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Calendar, Clock, Users, Camera, Music, Utensils, Truck, Sparkles, CheckCircle, AlertCircle, MapPin } from 'lucide-react';

type TimelineView = 'master' | 'bride' | 'groom' | 'vendors' | 'coordinator';

interface TimelineItem {
  time: string;
  title: string;
  description: string;
  category: 'ceremony' | 'reception' | 'vendor' | 'coordinator' | 'prep' | 'transport';
  assignedTo?: string[];
  notes?: string;
  musicCue?: string;
  completed?: boolean;
}

const MASTER_TIMELINE: TimelineItem[] = [
  // PRE-CEREMONY - MORNING
  { time: '8:00 AM', title: 'Hair & Makeup Begins', description: 'Hair stylist and makeup artist arrive at bridal suite', category: 'prep', assignedTo: ['Bride', 'Bridesmaids'], notes: 'Bride goes last for freshest look' },
  { time: '8:30 AM', title: 'Groom & Groomsmen Arrival', description: 'Arrive at getting-ready location', category: 'prep', assignedTo: ['Groom', 'Groomsmen'] },
  { time: '9:00 AM', title: 'Light Breakfast Service', description: 'Bridal suite snacks and beverages', category: 'prep', assignedTo: ['Bride', 'Bridesmaids'], notes: 'Avoid messy foods, provide straws' },
  { time: '10:00 AM', title: 'Florist Delivery', description: 'Bouquets, boutonnieres, and personal flowers delivered', category: 'vendor', assignedTo: ['Florist'], notes: 'Refrigerate until use' },
  { time: '10:30 AM', title: 'Photographer Arrival', description: 'Detail shots: rings, shoes, dress, invitations, perfume', category: 'vendor', assignedTo: ['Photographer'], notes: 'Prepare detail items in advance' },
  { time: '11:00 AM', title: 'Bride Hair & Makeup Complete', description: 'Final touch-ups, hair spray set', category: 'prep', assignedTo: ['Bride'], notes: 'Keep makeup artist on standby for touch-ups' },
  { time: '11:15 AM', title: 'Steam Wedding Dress', description: 'Final steaming and dress assistance', category: 'coordinator', assignedTo: ['Coordinator'], notes: 'Check bustle, buttons, zippers' },
  { time: '11:30 AM', title: 'Bride Gets Dressed', description: 'Coordinator assists with dress, veil, jewelry', category: 'prep', assignedTo: ['Bride', 'Coordinator'] },
  { time: '11:45 AM', title: 'Bridal Party Photos', description: 'Group shots in robes, getting ready candids', category: 'prep', assignedTo: ['Photographer', 'Bridesmaids'], notes: 'Matching robes, champagne props' },
  { time: '12:00 PM', title: 'First Look (Optional)', description: 'Private first look with groom', category: 'prep', assignedTo: ['Bride', 'Groom', 'Photographer'], musicCue: 'Soft instrumental background' },
  { time: '12:30 PM', title: 'Family Portraits', description: 'Organized family photos before ceremony', category: 'prep', assignedTo: ['Photographer'], notes: 'Use family photo list - bride & groom sides separately' },

  // VENDOR ARRIVALS
  { time: '1:00 PM', title: 'Venue Setup Begins', description: 'Florist, rentals, and décor team arrive', category: 'vendor', assignedTo: ['Florist', 'Rentals', 'Venue Staff'], notes: 'Power outlets confirmed, load-in path clear' },
  { time: '1:30 PM', title: 'Caterer Arrival', description: 'Kitchen setup and food prep begins', category: 'vendor', assignedTo: ['Caterer'], notes: 'Confirm headcount, dietary restrictions' },
  { time: '2:00 PM', title: 'Coordinator Setup Walkthrough', description: 'Place table numbers, guestbook, signage, candles', category: 'coordinator', assignedTo: ['Coordinator'], notes: 'Check seating chart, emergency kit, timeline printed' },
  { time: '2:15 PM', title: 'DJ/Band Sound Check', description: 'Audio setup for ceremony and reception', category: 'vendor', assignedTo: ['DJ/Band'], notes: 'Wireless mic check, backup batteries, ceremony playlist ready' },
  { time: '2:30 PM', title: 'Videographer Arrival', description: 'Setup cameras, drone check (if applicable)', category: 'vendor', assignedTo: ['Videographer'], notes: 'Multi-angle ceremony coverage, audio backup' },
  { time: '2:45 PM', title: 'Officiant Arrival', description: 'Review ceremony script, coordinate with couple', category: 'vendor', assignedTo: ['Officiant'], notes: 'Wireless mic setup, stand at altar' },
  { time: '3:00 PM', title: 'Light Fairy Lights & Candles', description: 'Turn on all ambient lighting, light candles', category: 'coordinator', assignedTo: ['Coordinator'], notes: 'Check batteries, flame safety with venue' },

  // CEREMONY SETUP
  { time: '3:15 PM', title: 'Guest Arrival Begins', description: 'Ushers guide guests to seats', category: 'ceremony', assignedTo: ['Ushers'], notes: 'Bride side left, groom side right (or mixed)' },
  { time: '3:30 PM', title: 'Bridal Party Lineup', description: 'Coordinator organizes processional order backstage', category: 'coordinator', assignedTo: ['Coordinator'], notes: 'Bouquets distributed, boutonnieres checked, spacing rehearsed' },
  { time: '3:45 PM', title: 'Reserved Seating for Family', description: 'Ushers seat immediate family in front rows', category: 'ceremony', assignedTo: ['Ushers'], notes: 'Confirm who sits where, save seats' },

  // CEREMONY PROCESSIONAL (4:00 PM START)
  { time: '3:58 PM', title: 'Officiant Takes Position', description: 'Officiant and groom walk to altar', category: 'ceremony', assignedTo: ['Officiant', 'Groom'], musicCue: 'Prelude music fades' },
  { time: '4:00 PM', title: 'Processional Music Begins', description: 'DJ cues processional song', category: 'ceremony', assignedTo: ['DJ'], musicCue: 'PROCESSIONAL SONG - confirmed with couple' },
  { time: '4:01 PM', title: 'Grandparents Seated', description: 'Ushers escort grandparents down aisle', category: 'ceremony', assignedTo: ['Ushers'], notes: '30 second spacing between each pair' },
  { time: '4:03 PM', title: "Groom's Parents Seated", description: "Groom's mother escorted down aisle", category: 'ceremony', assignedTo: ['Ushers'] },
  { time: '4:04 PM', title: "Bride's Mother Seated", description: 'Last person seated before bridal party', category: 'ceremony', assignedTo: ['Usher'], notes: 'Signals ceremony about to begin' },
  { time: '4:05 PM', title: 'Officiant Signals Start', description: 'Guests asked to stand', category: 'ceremony', assignedTo: ['Officiant'] },
  { time: '4:06 PM', title: 'Groomsmen Enter', description: 'Groomsmen walk down aisle (solo or paired)', category: 'ceremony', assignedTo: ['Groomsmen'], notes: 'Spacing: 15 seconds apart' },
  { time: '4:08 PM', title: 'Bridesmaids Enter', description: 'Bridesmaids walk down aisle', category: 'ceremony', assignedTo: ['Bridesmaids'], notes: 'Spacing: 15 seconds apart, bouquets in left hand' },
  { time: '4:10 PM', title: 'Maid/Matron of Honor', description: 'MOH walks down aisle', category: 'ceremony', assignedTo: ['Maid of Honor'] },
  { time: '4:11 PM', title: 'Ring Bearer & Flower Girl', description: 'Children walk down aisle', category: 'ceremony', assignedTo: ['Ring Bearer', 'Flower Girl'], notes: 'Parents nearby to redirect if needed' },
  { time: '4:12 PM', title: "Bride's Entrance Music Change", description: 'DJ switches to bridal entrance song', category: 'ceremony', assignedTo: ['DJ'], musicCue: 'BRIDAL ENTRANCE SONG - fade in smoothly' },
  { time: '4:13 PM', title: "Bride's Entrance", description: 'Bride walks down aisle with father/escort', category: 'ceremony', assignedTo: ['Bride', 'Father'], notes: 'Slow, steady pace - enjoy the moment' },

  // CEREMONY (30 min)
  { time: '4:15 PM', title: 'Ceremony Begins', description: 'Welcome, readings, vows, ring exchange', category: 'ceremony', assignedTo: ['Officiant', 'Bride', 'Groom'], notes: 'Photographer/videographer capture close-ups' },
  { time: '4:20 PM', title: 'Unity Ceremony (Optional)', description: 'Candle lighting, sand ceremony, etc.', category: 'ceremony', assignedTo: ['Bride', 'Groom'], notes: 'Coordinator has lighter ready' },
  { time: '4:30 PM', title: 'Ring Exchange', description: 'Exchange of wedding rings and vows', category: 'ceremony', assignedTo: ['Bride', 'Groom', 'Ring Bearer'] },
  { time: '4:44 PM', title: 'Pronouncement', description: 'Officiant declares couple married', category: 'ceremony', assignedTo: ['Officiant'] },
  { time: '4:45 PM', title: 'First Kiss & Recessional', description: 'Couple kisses, recessional music begins', category: 'ceremony', assignedTo: ['Bride', 'Groom', 'DJ'], musicCue: 'RECESSIONAL SONG - upbeat, celebratory' },

  // POST-CEREMONY
  { time: '4:50 PM', title: 'Receiving Line (Optional)', description: 'Couple greets guests after ceremony', category: 'ceremony', assignedTo: ['Bride', 'Groom'], notes: 'Keep it moving - 10-15 min max' },
  { time: '5:00 PM', title: 'Cocktail Hour Begins', description: 'Guests move to cocktail area, appetizers served', category: 'reception', assignedTo: ['Caterer', 'Bar Staff'], notes: 'Background music, drinks flowing' },
  { time: '5:00 PM', title: 'Family Formal Photos', description: 'Immediate family portraits', category: 'prep', assignedTo: ['Photographer', 'Coordinator'], notes: 'Use shot list, keep families organized' },
  { time: '5:30 PM', title: 'Couple Portraits', description: 'Romantic portraits, sunset photos (if applicable)', category: 'prep', assignedTo: ['Photographer', 'Bride', 'Groom'], notes: 'Golden hour timing' },
  { time: '5:45 PM', title: 'Reception Room Flip', description: 'Move ceremony chairs, set reception tables', category: 'coordinator', assignedTo: ['Venue Staff', 'Coordinator'], notes: 'Quick turnaround, confirm table settings' },

  // RECEPTION
  { time: '6:00 PM', title: 'Guests Invited to Reception', description: 'Doors open, guests find seats', category: 'reception', assignedTo: ['Venue Staff'], notes: 'Escort cards/seating chart visible' },
  { time: '6:15 PM', title: 'Grand Entrance', description: 'Bridal party and couple introduced', category: 'reception', assignedTo: ['DJ', 'Bridal Party'], musicCue: 'High-energy entrance song', notes: 'Introduce in pairs, couple last' },
  { time: '6:20 PM', title: 'First Dance', description: "Couple's first dance as married", category: 'reception', assignedTo: ['Bride', 'Groom', 'DJ'], musicCue: 'FIRST DANCE SONG' },
  { time: '6:24 PM', title: 'Welcome Toast', description: 'Best man and/or maid of honor toast', category: 'reception', assignedTo: ['Best Man', 'Maid of Honor'], notes: '3-5 minutes each, DJ provides mic' },
  { time: '6:30 PM', title: 'Blessing & Dinner Service', description: 'Blessing (if applicable), dinner begins', category: 'reception', assignedTo: ['Officiant', 'Caterer'], notes: 'Buffet or plated - head table served first' },
  { time: '6:35 PM', title: 'Table Dismissal', description: 'Tables called to buffet by number', category: 'reception', assignedTo: ['DJ'], notes: 'Head table, then family tables, then guests' },
  { time: '7:15 PM', title: 'Dinner Music', description: 'Background music during meal', category: 'reception', assignedTo: ['DJ'], musicCue: 'Soft dinner playlist' },
  { time: '7:30 PM', title: 'Cake Cutting', description: 'Couple cuts wedding cake', category: 'reception', assignedTo: ['Bride', 'Groom', 'Caterer'], notes: 'Photographer ready, coordinator provides knife and plates' },
  { time: '7:35 PM', title: 'Parent Dances', description: 'Father-daughter, mother-son dances', category: 'reception', assignedTo: ['Bride', 'Groom', 'Parents', 'DJ'], musicCue: 'FATHER-DAUGHTER & MOTHER-SON SONGS' },
  { time: '7:42 PM', title: 'Anniversary Dance', description: 'All married couples dance, last standing wins', category: 'reception', assignedTo: ['DJ'], notes: 'Give married couple small gift/flowers' },
  { time: '7:50 PM', title: 'Open Dance Floor', description: 'DJ invites all guests to dance', category: 'reception', assignedTo: ['DJ'], musicCue: 'Upbeat playlist begins' },
  { time: '8:00 PM', title: 'Bouquet Toss (Optional)', description: 'Bride tosses bouquet to single ladies', category: 'reception', assignedTo: ['Bride', 'DJ'], notes: 'Alternative: anniversary dance, pass bouquet to longest married' },
  { time: '8:05 PM', title: 'Garter Toss (Optional)', description: 'Groom tosses garter to single men', category: 'reception', assignedTo: ['Groom', 'DJ'], notes: 'Can skip if not desired' },
  { time: '8:30 PM', title: 'Sunset Photos', description: 'Golden hour outdoor portraits', category: 'prep', assignedTo: ['Photographer', 'Bride', 'Groom'], notes: 'Quick 10-minute session' },
  { time: '9:00 PM', title: 'Cake & Dessert Service', description: 'Cake slices served to guests', category: 'reception', assignedTo: ['Caterer'] },
  { time: '9:30 PM', title: 'Last Call Announced', description: 'Bar announces final drink service', category: 'reception', assignedTo: ['Bar Staff'], notes: '30 min before end' },
  { time: '9:45 PM', title: 'Last Dance', description: 'Final slow song, couple invites all guests', category: 'reception', assignedTo: ['DJ', 'Bride', 'Groom'], musicCue: 'LAST DANCE SONG' },
  { time: '9:55 PM', title: 'Grand Exit', description: 'Sparkler sendoff, confetti, bubbles (venue permitting)', category: 'reception', assignedTo: ['Coordinator', 'Guests'], notes: 'Line guests up, distribute sparklers/confetti' },
  { time: '10:00 PM', title: 'Reception Ends', description: 'Guests depart, couple exits', category: 'reception', assignedTo: ['All'] },

  // POST-RECEPTION
  { time: '10:15 PM', title: 'Vendor Breakdown', description: 'DJ, florist, rentals pack up', category: 'vendor', assignedTo: ['All Vendors'], notes: 'Coordinator oversees, confirms nothing left behind' },
  { time: '10:30 PM', title: 'Gift Table Secured', description: 'Cards and gifts loaded into secure vehicle', category: 'coordinator', assignedTo: ['Coordinator'], notes: 'Assign trusted person to transport' },
  { time: '10:45 PM', title: 'Décor Takedown', description: 'Personal items collected (signs, photos, centerpieces)', category: 'coordinator', assignedTo: ['Coordinator', 'Family'], notes: 'Use checklist to ensure nothing forgotten' },
  { time: '11:00 PM', title: 'Venue Departure', description: 'Final walkthrough, all items removed', category: 'coordinator', assignedTo: ['Coordinator', 'Venue Staff'] },
];

export default function Timeline() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<TimelineView>('master');
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const toggleComplete = (time: string) => {
    setCompletedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(time)) {
        newSet.delete(time);
      } else {
        newSet.add(time);
      }
      return newSet;
    });
  };

  const filterByView = (timeline: TimelineItem[]) => {
    switch (activeView) {
      case 'bride':
        return timeline.filter(item =>
          item.assignedTo?.includes('Bride') ||
          item.assignedTo?.includes('Bridesmaids') ||
          item.category === 'prep'
        );
      case 'groom':
        return timeline.filter(item =>
          item.assignedTo?.includes('Groom') ||
          item.assignedTo?.includes('Groomsmen')
        );
      case 'vendors':
        return timeline.filter(item => item.category === 'vendor');
      case 'coordinator':
        return timeline.filter(item =>
          item.category === 'coordinator' ||
          item.assignedTo?.includes('Coordinator')
        );
      default:
        return timeline;
    }
  };

  const filteredTimeline = filterByView(MASTER_TIMELINE);
  const completionPercentage = Math.round((completedItems.size / MASTER_TIMELINE.length) * 100);

  const categoryIcons = {
    ceremony: Calendar,
    reception: Users,
    vendor: Truck,
    coordinator: Sparkles,
    prep: Camera,
    transport: MapPin,
  };

  const categoryColors = {
    ceremony: 'bg-purple-50 border-purple-200 text-purple-700',
    reception: 'bg-rose-50 border-rose-200 text-rose-700',
    vendor: 'bg-blue-50 border-blue-200 text-blue-700',
    coordinator: 'bg-amber-50 border-amber-200 text-amber-700',
    prep: 'bg-green-50 border-green-200 text-green-700',
    transport: 'bg-cyan-50 border-cyan-200 text-cyan-700',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-rose-50 to-champagne-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Wedding Day Timeline</h1>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className="text-5xl font-serif font-bold text-gray-900 mb-4">
            Professional Day-Of Timeline
          </h2>
          <p className="text-xl text-gray-600">
            Minute-by-minute coordinator-grade schedule
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-900">Timeline Progress</span>
            <span className="font-bold text-champagne-600">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-champagne-500 to-rose-500 h-3 rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {completedItems.size} of {MASTER_TIMELINE.length} items completed
          </p>
        </div>

        {/* View Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            {[
              { id: 'master', label: 'Master Timeline', icon: Calendar },
              { id: 'bride', label: 'Bride View', icon: Heart },
              { id: 'groom', label: 'Groom View', icon: Users },
              { id: 'vendors', label: 'Vendor Schedule', icon: Truck },
              { id: 'coordinator', label: 'Coordinator Tasks', icon: Sparkles },
            ].map(view => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as TimelineView)}
                  className={`flex-1 px-6 py-4 font-medium transition border-b-2 ${
                    activeView === view.id
                      ? 'border-champagne-600 text-champagne-600 bg-champagne-50'
                      : 'border-transparent text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{view.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline Items */}
        <div className="space-y-3">
          {filteredTimeline.map((item, index) => {
            const isCompleted = completedItems.has(item.time);
            const Icon = categoryIcons[item.category];
            const colorClass = categoryColors[item.category];

            return (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition ${
                  isCompleted ? 'opacity-60 border-green-300' : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4 p-4">
                  {/* Time */}
                  <div className="flex-shrink-0 w-24 text-right">
                    <div className="font-bold text-lg text-gray-900">{item.time}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {item.time}
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleComplete(item.time)}
                      className="w-5 h-5 rounded border-gray-300 text-champagne-600 focus:ring-champagne-500 cursor-pointer"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className={`text-lg font-bold ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {item.title}
                      </h3>
                      <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
                        <Icon className="w-3 h-3 inline mr-1" />
                        {item.category}
                      </span>
                    </div>

                    <p className={`text-sm mb-2 ${isCompleted ? 'text-gray-400' : 'text-gray-700'}`}>
                      {item.description}
                    </p>

                    {item.assignedTo && item.assignedTo.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                        <Users className="w-4 h-4" />
                        <span>{item.assignedTo.join(', ')}</span>
                      </div>
                    )}

                    {item.musicCue && (
                      <div className="flex items-center gap-2 text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-lg mb-2 inline-flex">
                        <Music className="w-4 h-4" />
                        <span className="font-medium">{item.musicCue}</span>
                      </div>
                    )}

                    {item.notes && (
                      <div className="flex items-start gap-2 text-xs bg-amber-50 text-amber-800 px-3 py-2 rounded-lg mt-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{item.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTimeline.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No items for this view</p>
          </div>
        )}
      </div>
    </div>
  );
}
