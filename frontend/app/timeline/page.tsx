'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Calendar, Clock, Users, Camera, Music, Utensils, Truck, Sparkles, CheckCircle, AlertCircle, MapPin, Plus, ChevronUp, ChevronDown, Trash2, Edit } from 'lucide-react';

type TimelineView = 'master' | 'bride' | 'groom' | 'vendors' | 'coordinator' | 'ceremony';

interface TimelineItem {
  time: string;
  title: string;
  description: string;
  category: 'ceremony' | 'reception' | 'vendor' | 'coordinator' | 'prep' | 'transport';
  assignedTo?: string[];
  notes?: string;
  musicCue?: string;
  completed?: boolean;
  enabled?: boolean;
}

interface CeremonyEvent {
  id: string;
  order: number;
  title: string;
  description?: string;
  musicCue?: string;
  notes?: string;
}

const INITIAL_CEREMONY_EVENTS: CeremonyEvent[] = [
  { id: '1', order: 1, title: 'Officiant and Groom Take Position', description: 'Officiant and groom walk to altar', musicCue: 'Prelude music fades' },
  { id: '2', order: 2, title: 'Processional Music Begins', musicCue: 'Your chosen processional song' },
  { id: '3', order: 3, title: 'Grandparents Seated', description: 'Ushers escort grandparents down aisle', notes: '30 second spacing between each pair' },
  { id: '4', order: 4, title: "Groom's Parents Seated", description: "Groom's mother escorted down aisle" },
  { id: '5', order: 5, title: "Bride's Mother Seated", description: 'Last person seated before bridal party', notes: 'Signals ceremony about to begin' },
  { id: '6', order: 6, title: 'Guests Asked to Stand', description: 'Officiant signals start' },
  { id: '7', order: 7, title: 'Groomsmen Enter', description: 'Walk down aisle (solo or paired)', notes: 'Spacing: 15 seconds apart' },
  { id: '8', order: 8, title: 'Bridesmaids Enter', description: 'Walk down aisle', notes: 'Spacing: 15 seconds apart, bouquets in left hand' },
  { id: '9', order: 9, title: 'Maid/Matron of Honor Enters', description: 'MOH walks down aisle' },
  { id: '10', order: 10, title: 'Ring Bearer & Flower Girl', description: 'Children walk down aisle', notes: 'Parents nearby to redirect if needed' },
  { id: '11', order: 11, title: "Bride's Entrance Music Change", musicCue: 'Your bridal entrance song - fade in smoothly' },
  { id: '12', order: 12, title: "Bride's Entrance", description: 'Bride walks down aisle with father/escort', notes: 'Slow, steady pace - enjoy the moment' },
  { id: '13', order: 13, title: 'Welcome & Opening Remarks', description: 'Officiant welcomes guests and begins ceremony' },
  { id: '14', order: 14, title: 'Readings', description: 'Selected readings (optional)' },
  { id: '15', order: 15, title: 'Vows', description: 'Exchange of wedding vows' },
  { id: '16', order: 16, title: 'Ring Exchange', description: 'Exchange of wedding rings' },
  { id: '17', order: 17, title: 'Unity Ceremony (Optional)', description: 'Candle lighting, sand ceremony, etc.', notes: 'Coordinator has lighter ready' },
  { id: '18', order: 18, title: 'Pronouncement', description: 'Officiant declares couple married' },
  { id: '19', order: 19, title: 'First Kiss', description: 'You may kiss!' },
  { id: '20', order: 20, title: 'Recessional', description: 'Couple exits down aisle', musicCue: 'Your recessional song - upbeat, celebratory' },
];

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
  { time: '3:15 PM', title: 'Guest Arrival Begins', description: 'Ushers guide guests to seats', category: 'prep', assignedTo: ['Ushers'], notes: 'Bride side left, groom side right (or mixed)' },
  { time: '3:30 PM', title: 'Bridal Party Lineup', description: 'Coordinator organizes processional order backstage', category: 'coordinator', assignedTo: ['Coordinator'], notes: 'Bouquets distributed, boutonnieres checked, spacing rehearsed' },
  { time: '3:45 PM', title: 'Reserved Seating for Family', description: 'Ushers seat immediate family in front rows', category: 'prep', assignedTo: ['Ushers'], notes: 'Confirm who sits where, save seats' },

  // CEREMONY (See Ceremony Order tab for detailed event sequence)
  { time: '4:00 PM', title: 'Ceremony Begins', description: 'Processional through recessional (see Ceremony Order tab)', category: 'ceremony', assignedTo: ['All'], notes: 'Use Ceremony Order tab to customize event sequence' },

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
  const [ceremonyEvents, setCeremonyEvents] = useState<CeremonyEvent[]>(INITIAL_CEREMONY_EVENTS);
  const [enabledItems, setEnabledItems] = useState<Set<string>>(new Set(MASTER_TIMELINE.map(item => item.time)));
  const [customTimes, setCustomTimes] = useState<Map<string, string>>(new Map());
  const [editingTime, setEditingTime] = useState<string | null>(null);

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

  const toggleEnabled = (time: string) => {
    setEnabledItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(time)) {
        newSet.delete(time);
      } else {
        newSet.add(time);
      }
      return newSet;
    });
  };

  const updateTime = (originalTime: string, newTime: string) => {
    setCustomTimes(prev => {
      const newMap = new Map(prev);
      newMap.set(originalTime, newTime);
      return newMap;
    });
    setEditingTime(null);
  };

  const getDisplayTime = (originalTime: string) => {
    return customTimes.get(originalTime) || originalTime;
  };

  // Ceremony event management functions
  const moveCeremonyEvent = (index: number, direction: 'up' | 'down') => {
    const newEvents = [...ceremonyEvents];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newEvents.length) return;

    [newEvents[index], newEvents[targetIndex]] = [newEvents[targetIndex], newEvents[index]];

    // Update order numbers
    newEvents.forEach((event, idx) => {
      event.order = idx + 1;
    });

    setCeremonyEvents(newEvents);
  };

  const deleteCeremonyEvent = (id: string) => {
    const newEvents = ceremonyEvents.filter(e => e.id !== id);
    // Update order numbers
    newEvents.forEach((event, idx) => {
      event.order = idx + 1;
    });
    setCeremonyEvents(newEvents);
  };

  const addCeremonyEvent = () => {
    const newEvent: CeremonyEvent = {
      id: Date.now().toString(),
      order: ceremonyEvents.length + 1,
      title: 'New Event',
      description: '',
    };
    setCeremonyEvents([...ceremonyEvents, newEvent]);
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Professional Day-Of Timeline
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">
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
              className="bg-gradient-to-r from-champagne-400 to-rose-400 h-3 rounded-full transition-all"
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
              { id: 'ceremony', label: 'Ceremony Order', icon: Heart },
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

        {/* Ceremony Order View */}
        {activeView === 'ceremony' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-purple-50 to-rose-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ceremony Event Order</h3>
              <p className="text-gray-700 mb-4">
                Customize the order of events for your ceremony. Add, remove, or reorder events as needed. No specific times required - just the sequence!
              </p>
              <button
                onClick={addCeremonyEvent}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Event
              </button>
            </div>

            {ceremonyEvents.map((event, index) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-sm border-2 border-purple-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="flex items-start gap-4 p-4">
                  {/* Order Number */}
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className="bg-purple-100 text-purple-700 rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
                      {event.order}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-sm text-gray-700 mb-2">
                        {event.description}
                      </p>
                    )}

                    {event.musicCue && (
                      <div className="flex items-center gap-2 text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-lg mb-2 inline-flex">
                        <Music className="w-4 h-4" />
                        <span className="font-medium">{event.musicCue}</span>
                      </div>
                    )}

                    {event.notes && (
                      <div className="flex items-start gap-2 text-xs bg-amber-50 text-amber-800 px-3 py-2 rounded-lg mt-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{event.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    <button
                      onClick={() => moveCeremonyEvent(index, 'up')}
                      disabled={index === 0}
                      className={`p-2 rounded-lg transition ${
                        index === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                      title="Move up"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => moveCeremonyEvent(index, 'down')}
                      disabled={index === ceremonyEvents.length - 1}
                      className={`p-2 rounded-lg transition ${
                        index === ceremonyEvents.length - 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                      title="Move down"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteCeremonyEvent(event.id)}
                      className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                      title="Delete event"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {ceremonyEvents.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No ceremony events yet</p>
                <button
                  onClick={addCeremonyEvent}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Event
                </button>
              </div>
            )}
          </div>
        )}

        {/* Timeline Items */}
        {activeView !== 'ceremony' && (
          <div className="space-y-3">
            {filteredTimeline.map((item, index) => {
            const isCompleted = completedItems.has(item.time);
            const isEnabled = enabledItems.has(item.time);
            const Icon = categoryIcons[item.category];
            const colorClass = categoryColors[item.category];
            const displayTime = getDisplayTime(item.time);
            const isEditingThisTime = editingTime === item.time;

            return (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition ${
                  !isEnabled ? 'opacity-40 bg-gray-50 border-gray-300' :
                  isCompleted ? 'opacity-60 border-green-300' : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4 p-4">
                  {/* Time */}
                  <div className="flex-shrink-0 w-32">
                    {isEditingThisTime ? (
                      <input
                        type="text"
                        defaultValue={displayTime}
                        onBlur={(e) => updateTime(item.time, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateTime(item.time, e.currentTarget.value);
                          }
                        }}
                        className="w-full px-2 py-1 text-sm border border-champagne-500 rounded focus:outline-none focus:ring-2 focus:ring-champagne-500"
                        autoFocus
                      />
                    ) : (
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-900">{displayTime}</div>
                        <button
                          onClick={() => setEditingTime(item.time)}
                          className="text-xs text-champagne-600 hover:text-champagne-700 mt-1 flex items-center justify-end gap-1 w-full"
                        >
                          <Edit className="w-3 h-3" />
                          Edit time
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Checkboxes */}
                  <div className="flex-shrink-0 pt-1 flex flex-col gap-2">
                    <label className="flex items-center cursor-pointer" title="Applies to me">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => toggleEnabled(item.time)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="ml-1 text-xs text-gray-600">Apply</span>
                    </label>
                    {isEnabled && (
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => toggleComplete(item.time)}
                        className="w-5 h-5 rounded border-gray-300 text-champagne-600 focus:ring-champagne-500 cursor-pointer"
                        title="Mark as completed"
                      />
                    )}
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

          {filteredTimeline.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No items for this view</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
