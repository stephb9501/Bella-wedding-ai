'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, CheckCircle, Filter, Plus, X, ChevronDown, ChevronUp, AlertCircle, Sparkles } from 'lucide-react';

interface ChecklistTask {
  id: string;
  title: string;
  phase: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  vendorQuestions?: string[];
  notes?: string;
  completed: boolean;
}

const PHASES = [
  '12+ Months Out',
  '9-11 Months Out',
  '6-8 Months Out',
  '4-5 Months Out',
  '2-3 Months Out',
  '1 Month Out',
  '2 Weeks Out',
  '1 Week Out',
  'Day Before',
  'Wedding Day Morning',
  'Post-Wedding'
];

const CATEGORIES = [
  'Planning & Budget',
  'Venue',
  'Vendors',
  'Attire',
  'Décor & Flowers',
  'Invitations',
  'Ceremony',
  'Reception',
  'Guest Experience',
  'Personal',
  'Legal',
  'Post-Wedding'
];

const CHECKLIST_TASKS: ChecklistTask[] = [
  // 12+ MONTHS OUT
  { id: '1', phase: '12+ Months Out', category: 'Planning & Budget', priority: 'high', title: 'Determine your total wedding budget', notes: 'Include buffer for unexpected costs (10-15%)', completed: false },
  { id: '2', phase: '12+ Months Out', category: 'Planning & Budget', priority: 'high', title: 'Create preliminary guest list (bride & groom sides)', completed: false },
  { id: '3', phase: '12+ Months Out', category: 'Planning & Budget', priority: 'high', title: 'Set your wedding date', notes: 'Check family availability, holiday conflicts', completed: false },
  { id: '4', phase: '12+ Months Out', category: 'Planning & Budget', priority: 'high', title: 'Decide on wedding style and theme', completed: false },
  { id: '5', phase: '12+ Months Out', category: 'Planning & Budget', priority: 'medium', title: 'Choose color palette (2-4 colors)', completed: false },
  { id: '6', phase: '12+ Months Out', category: 'Planning & Budget', priority: 'medium', title: 'Hire wedding planner/coordinator (if desired)', notes: 'Full service vs day-of coordinator', completed: false },
  { id: '7', phase: '12+ Months Out', category: 'Personal', priority: 'high', title: 'Announce engagement to family & close friends', completed: false },
  { id: '8', phase: '12+ Months Out', category: 'Personal', priority: 'medium', title: 'Choose wedding party (bridesmaids, groomsmen)', completed: false },
  { id: '9', phase: '12+ Months Out', category: 'Venue', priority: 'high', title: 'Research ceremony and reception venues', notes: 'Visit 3-5 venues before deciding', completed: false },

  // 9-11 MONTHS OUT
  { id: '10', phase: '9-11 Months Out', category: 'Venue', priority: 'high', title: 'Book ceremony venue', vendorQuestions: ['What is your rain backup plan?', 'Are candles/open flames allowed?', 'What time can vendors load in?', 'Are there noise restrictions?', 'What is included (chairs, arch, sound system)?'], completed: false },
  { id: '11', phase: '9-11 Months Out', category: 'Venue', priority: 'high', title: 'Book reception venue', vendorQuestions: ['What is the end time/curfew?', 'Is alcohol permitted? Any restrictions?', 'Where are power outlets located?', 'Can we bring in outside vendors?', 'What décor restrictions exist?'], completed: false },
  { id: '12', phase: '9-11 Months Out', category: 'Vendors', priority: 'high', title: 'Book photographer', vendorQuestions: ['How many hours are included?', 'Do you include a second shooter?', 'What is the turnaround time for photos?', 'Do you have backup camera equipment?', 'Can we get raw/unedited images?', 'What are print rights?'], completed: false },
  { id: '13', phase: '9-11 Months Out', category: 'Vendors', priority: 'high', title: 'Book videographer', vendorQuestions: ['Is drone footage included?', 'How is audio captured (wireless mics)?', 'Multi-angle ceremony setup?', 'Highlight reel vs full ceremony video?', 'Turnaround time?'], completed: false },
  { id: '14', phase: '9-11 Months Out', category: 'Vendors', priority: 'high', title: 'Book caterer', vendorQuestions: ['Buffet or plated service?', 'How many staff included?', 'Allergy/dietary accommodation?', 'Cake cutting fee?', 'Can we take home leftovers?'], completed: false },
  { id: '15', phase: '9-11 Months Out', category: 'Vendors', priority: 'high', title: 'Book florist', vendorQuestions: ['How early do you arrive for setup?', 'Is cleanup included?', 'Do we purchase or rent vases?', 'Flower substitutions policy?', 'How do you weatherproof outdoor arrangements?'], completed: false },
  { id: '16', phase: '9-11 Months Out', category: 'Vendors', priority: 'high', title: 'Book DJ or live band', vendorQuestions: ['Do you provide ceremony AND reception audio?', 'Wireless mics included?', 'Do you offer music planning/consultation?', 'How many setup locations (ceremony/reception)?', 'Do you need power at both locations?', 'Do you have backup equipment?', 'Do you accept playlist/do-not-play lists?', 'Do you MC/host announcements?'], completed: false },
  { id: '17', phase: '9-11 Months Out', category: 'Invitations', priority: 'medium', title: 'Order save-the-dates', notes: 'Send 6-8 months before wedding', completed: false },
  { id: '18', phase: '9-11 Months Out', category: 'Personal', priority: 'medium', title: 'Create wedding registry', completed: false },
  { id: '19', phase: '9-11 Months Out', category: 'Personal', priority: 'medium', title: 'Book honeymoon travel and accommodations', completed: false },

  // 6-8 MONTHS OUT
  { id: '20', phase: '6-8 Months Out', category: 'Attire', priority: 'high', title: 'Shop for and order wedding dress', notes: 'Allow 6+ months for alterations', completed: false },
  { id: '21', phase: '6-8 Months Out', category: 'Attire', priority: 'high', title: 'Order bridesmaid dresses', completed: false },
  { id: '22', phase: '6-8 Months Out', category: 'Attire', priority: 'medium', title: 'Shop for groom and groomsmen attire', completed: false },
  { id: '23', phase: '6-8 Months Out', category: 'Vendors', priority: 'high', title: 'Book hair stylist', vendorQuestions: ['Do you do trial runs?', 'Do you travel to venue?', 'How many people can you style?', 'Backup stylist available?'], completed: false },
  { id: '24', phase: '6-8 Months Out', category: 'Vendors', priority: 'high', title: 'Book makeup artist', vendorQuestions: ['Trial session included?', 'Travel to venue?', 'Touch-up kit provided?', 'Airbrush or traditional?'], completed: false },
  { id: '25', phase: '6-8 Months Out', category: 'Vendors', priority: 'medium', title: 'Book cake baker', vendorQuestions: ['Delivery and setup included?', 'What table/stand is needed?', 'Cutting instructions for caterer?', 'Can we freeze top tier?'], completed: false },
  { id: '26', phase: '6-8 Months Out', category: 'Invitations', priority: 'high', title: 'Order wedding invitations', notes: 'Mail 8-10 weeks before wedding', completed: false },
  { id: '27', phase: '6-8 Months Out', category: 'Guest Experience', priority: 'medium', title: 'Reserve hotel room blocks for guests', completed: false },
  { id: '28', phase: '6-8 Months Out', category: 'Vendors', priority: 'medium', title: 'Book transportation (limo, shuttle, etc.)', vendorQuestions: ['Shuttle route planned?', 'Load capacity and timing?', 'ADA accessibility?'], completed: false },

  // 4-5 MONTHS OUT
  { id: '29', phase: '4-5 Months Out', category: 'Reception', priority: 'high', title: 'Finalize menu with caterer', notes: 'Submit final headcount later', completed: false },
  { id: '30', phase: '4-5 Months Out', category: 'Attire', priority: 'high', title: 'Purchase wedding rings', completed: false },
  { id: '31', phase: '4-5 Months Out', category: 'Attire', priority: 'medium', title: 'Order wedding shoes and accessories', completed: false },
  { id: '32', phase: '4-5 Months Out', category: 'Ceremony', priority: 'high', title: 'Book officiant', vendorQuestions: ['Do you customize the ceremony script?', 'Will you attend the rehearsal?', 'What are your amplification needs?'], completed: false },
  { id: '33', phase: '4-5 Months Out', category: 'Ceremony', priority: 'medium', title: 'Plan ceremony details (readings, vows, music)', completed: false },
  { id: '34', phase: '4-5 Months Out', category: 'Décor & Flowers', priority: 'medium', title: 'Choose wedding favors', completed: false },
  { id: '35', phase: '4-5 Months Out', category: 'Décor & Flowers', priority: 'medium', title: 'Order rentals (tables, chairs, linens, etc.)', completed: false },

  // 2-3 MONTHS OUT
  { id: '36', phase: '2-3 Months Out', category: 'Invitations', priority: 'high', title: 'Mail wedding invitations (8-10 weeks before)', completed: false },
  { id: '37', phase: '2-3 Months Out', category: 'Legal', priority: 'high', title: 'Apply for marriage license', notes: 'Check state requirements for timing', completed: false },
  { id: '38', phase: '2-3 Months Out', category: 'Attire', priority: 'high', title: 'Schedule dress fittings/alterations', notes: 'Plan 2-3 fittings', completed: false },
  { id: '39', phase: '2-3 Months Out', category: 'Décor & Flowers', priority: 'high', title: 'Finalize floral order (bouquets, boutonnieres, centerpieces)', completed: false },
  { id: '40', phase: '2-3 Months Out', category: 'Décor & Flowers', priority: 'medium', title: 'Order ceremony décor (arch, aisle runner, pew markers)', completed: false },
  { id: '41', phase: '2-3 Months Out', category: 'Reception', priority: 'high', title: 'Create detailed timeline with coordinator/planner', notes: 'Share with all vendors', completed: false },
  { id: '42', phase: '2-3 Months Out', category: 'Reception', priority: 'medium', title: 'Finalize music playlist with DJ/band', notes: 'Include must-play and do-not-play songs', completed: false },
  { id: '43', phase: '2-3 Months Out', category: 'Ceremony', priority: 'medium', title: 'Write personal vows (if applicable)', completed: false },
  { id: '43a', phase: '2-3 Months Out', category: 'Vendors', priority: 'medium', title: 'Ask vendors about liability insurance (optional)', notes: 'Recommended for: venue, caterer, florist, décor, DJ, photographer, videographer, transportation, bar service, rentals. REQUIRED: liquor liability for caterer/bar service.', completed: false },
  { id: '44', phase: '2-3 Months Out', category: 'Guest Experience', priority: 'medium', title: 'Plan rehearsal dinner', completed: false },

  // 1 MONTH OUT
  { id: '45', phase: '1 Month Out', category: 'Reception', priority: 'high', title: 'Create seating chart', notes: 'Update as RSVPs finalize', completed: false },
  { id: '46', phase: '1 Month Out', category: 'Guest Experience', priority: 'high', title: 'Submit final headcount to caterer', notes: 'Usually due 1-2 weeks before', completed: false },
  { id: '47', phase: '1 Month Out', category: 'Vendors', priority: 'high', title: 'Confirm all vendor details (times, addresses, contacts)', completed: false },
  { id: '48', phase: '1 Month Out', category: 'Attire', priority: 'high', title: 'Final dress fitting and pick up', notes: 'Keep on padded hanger, store safely', completed: false },
  { id: '49', phase: '1 Month Out', category: 'Personal', priority: 'medium', title: 'Break in wedding shoes', notes: 'Wear around the house to soften', completed: false },
  { id: '50', phase: '1 Month Out', category: 'Vendors', priority: 'medium', title: 'Schedule hair and makeup trial', completed: false },
  { id: '51', phase: '1 Month Out', category: 'Décor & Flowers', priority: 'medium', title: 'Order table numbers, place cards, escort cards', completed: false },
  { id: '52', phase: '1 Month Out', category: 'Décor & Flowers', priority: 'medium', title: 'Finalize ceremony and reception signage', notes: 'Welcome sign, seating chart, bar menu, etc.', completed: false },
  { id: '53', phase: '1 Month Out', category: 'Personal', priority: 'low', title: 'Purchase gifts for parents and wedding party', completed: false },

  // 2 WEEKS OUT
  { id: '54', phase: '2 Weeks Out', category: 'Guest Experience', priority: 'high', title: 'Confirm final guest count from RSVPs', completed: false },
  { id: '55', phase: '2 Weeks Out', category: 'Reception', priority: 'high', title: 'Finalize seating chart and print escort cards', completed: false },
  { id: '56', phase: '2 Weeks Out', category: 'Vendors', priority: 'high', title: 'Send final timeline to all vendors', completed: false },
  { id: '57', phase: '2 Weeks Out', category: 'Vendors', priority: 'high', title: 'Create vendor contact list with phone numbers', completed: false },
  { id: '58', phase: '2 Weeks Out', category: 'Vendors', priority: 'medium', title: 'Prepare final payments and tip envelopes for vendors', notes: 'Cash in labeled envelopes, assign distributor', completed: false },
  { id: '59', phase: '2 Weeks Out', category: 'Ceremony', priority: 'medium', title: 'Finalize ceremony readings and reader assignments', completed: false },
  { id: '60', phase: '2 Weeks Out', category: 'Personal', priority: 'medium', title: 'Pack for honeymoon', completed: false },
  { id: '61', phase: '2 Weeks Out', category: 'Personal', priority: 'low', title: 'Get manicure and pedicure', notes: 'Schedule 1-2 days before wedding', completed: false },

  // 1 WEEK OUT
  { id: '62', phase: '1 Week Out', category: 'Venue', priority: 'high', title: 'Final venue walkthrough with coordinator', notes: 'Confirm setup locations, power, restrictions', completed: false },
  { id: '63', phase: '1 Week Out', category: 'Vendors', priority: 'high', title: 'Reconfirm all vendors (call or email)', completed: false },
  { id: '64', phase: '1 Week Out', category: 'Décor & Flowers', priority: 'high', title: 'Prepare décor items for setup', notes: 'Lanterns, fairy lights, battery checks, signage', completed: false },
  { id: '65', phase: '1 Week Out', category: 'Décor & Flowers', priority: 'medium', title: 'Check batteries on all battery-powered lights', notes: 'Fairy lights, lanterns, candles - replace as needed', completed: false },
  { id: '66', phase: '1 Week Out', category: 'Personal', priority: 'medium', title: 'Create emergency kit', notes: 'Safety pins, stain remover, tissues, bobby pins, band-aids, pain reliever, deodorant', completed: false },
  { id: '67', phase: '1 Week Out', category: 'Ceremony', priority: 'medium', title: 'Attend rehearsal at ceremony site', completed: false },
  { id: '68', phase: '1 Week Out', category: 'Guest Experience', priority: 'medium', title: 'Host rehearsal dinner', completed: false },
  { id: '69', phase: '1 Week Out', category: 'Personal', priority: 'low', title: 'Get final haircut/trim', completed: false },

  // DAY BEFORE
  { id: '70', phase: 'Day Before', category: 'Personal', priority: 'high', title: 'Steam wedding dress', notes: 'Hang in bathroom during shower, or use steamer', completed: false },
  { id: '71', phase: 'Day Before', category: 'Vendors', priority: 'high', title: 'Distribute vendor tip envelopes to coordinator/best man', completed: false },
  { id: '72', phase: 'Day Before', category: 'Décor & Flowers', priority: 'medium', title: 'Drop off décor items at venue (if allowed)', notes: 'Table numbers, signage, guest book, card box, etc.', completed: false },
  { id: '73', phase: 'Day Before', category: 'Personal', priority: 'medium', title: 'Prepare getting-ready outfits (robes, PJs, etc.)', completed: false },
  { id: '74', phase: 'Day Before', category: 'Personal', priority: 'medium', title: 'Pack bridal suite snacks and drinks', notes: 'Light, non-messy foods; use straws', completed: false },
  { id: '75', phase: 'Day Before', category: 'Reception', priority: 'medium', title: 'Prep toasting glasses, cake knife/server', completed: false },
  { id: '76', phase: 'Day Before', category: 'Personal', priority: 'low', title: 'Get good sleep - go to bed early!', completed: false },

  // WEDDING DAY MORNING
  { id: '77', phase: 'Wedding Day Morning', category: 'Personal', priority: 'high', title: 'Eat a nutritious breakfast', notes: 'Do not skip! You need energy.', completed: false },
  { id: '78', phase: 'Wedding Day Morning', category: 'Personal', priority: 'high', title: 'Stay hydrated throughout the day', completed: false },
  { id: '79', phase: 'Wedding Day Morning', category: 'Personal', priority: 'medium', title: 'Arrive on time for hair and makeup', completed: false },
  { id: '80', phase: 'Wedding Day Morning', category: 'Personal', priority: 'medium', title: "Put on dress with help (don't rush!)", completed: false },
  { id: '81', phase: 'Wedding Day Morning', category: 'Personal', priority: 'low', title: 'Take a moment for yourself - breathe and enjoy', completed: false },
  { id: '82', phase: 'Wedding Day Morning', category: 'Personal', priority: 'low', title: 'Have fun and relax - your coordinator handles the rest!', completed: false },

  // POST-WEDDING
  { id: '83', phase: 'Post-Wedding', category: 'Post-Wedding', priority: 'high', title: 'Return rental items (tux, décor, etc.)', completed: false },
  { id: '84', phase: 'Post-Wedding', category: 'Post-Wedding', priority: 'high', title: 'Preserve wedding bouquet', completed: false },
  { id: '85', phase: 'Post-Wedding', category: 'Post-Wedding', priority: 'high', title: "Send thank-you cards", notes: 'Within 2-3 months', completed: false },
  { id: '86', phase: 'Post-Wedding', category: 'Post-Wedding', priority: 'medium', title: 'Clean and preserve wedding dress', completed: false },
  { id: '87', phase: 'Post-Wedding', category: 'Post-Wedding', priority: 'medium', title: 'Update name on legal documents (if applicable)', notes: "Social Security, driver's license, passport, bank accounts", completed: false },
  { id: '88', phase: 'Post-Wedding', category: 'Post-Wedding', priority: 'medium', title: 'Review and tip vendors (online reviews)', completed: false },
  { id: '89', phase: 'Post-Wedding', category: 'Post-Wedding', priority: 'low', title: 'Order photo prints and albums', completed: false },
  { id: '90', phase: 'Post-Wedding', category: 'Post-Wedding', priority: 'low', title: 'Frame favorite wedding photos', completed: false },
];

export default function Checklist() {
  const router = useRouter();
  const [tasks, setTasks] = useState<ChecklistTask[]>(CHECKLIST_TASKS);
  const [selectedPhase, setSelectedPhase] = useState<string>('All Phases');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [showCompleted, setShowCompleted] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['12+ Months Out', '9-11 Months Out']));

  const togglePhase = (phase: string) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phase)) {
        newSet.delete(phase);
      } else {
        newSet.add(phase);
      }
      return newSet;
    });
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedPhase !== 'All Phases' && task.phase !== selectedPhase) return false;
    if (selectedCategory !== 'All Categories' && task.category !== selectedCategory) return false;
    if (!showCompleted && task.completed) return false;
    return true;
  });

  const groupedByPhase = PHASES.map(phase => ({
    phase,
    tasks: filteredTasks.filter(t => t.phase === phase)
  })).filter(group => group.tasks.length > 0);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    highPriority: tasks.filter(t => !t.completed && t.priority === 'high').length,
  };

  const progress = Math.round((stats.completed / stats.total) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-rose-50 to-champagne-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Wedding Checklist</h1>
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
        <div className="text-center mb-8">
          <h2 className="text-5xl font-serif font-bold text-gray-900 mb-4">
            Professional Wedding Checklist
          </h2>
          <p className="text-xl text-gray-600">
            Complete planner-grade checklist with vendor questions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-champagne-600 mb-1">{progress}%</div>
            <div className="text-sm text-gray-600">Complete</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-gradient-to-r from-champagne-500 to-rose-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-blue-600 mb-1">{stats.total - stats.completed}</div>
            <div className="text-sm text-gray-600">Remaining Tasks</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-red-600 mb-1">{stats.highPriority}</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Filter Tasks</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-champagne-500"
            >
              <option>All Phases</option>
              {PHASES.map(phase => (
                <option key={phase}>{phase}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-champagne-500"
            >
              <option>All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-champagne-600 focus:ring-champagne-500"
            />
            <span className="text-sm text-gray-700">Show completed tasks</span>
          </label>
        </div>

        {/* Grouped Tasks by Phase */}
        <div className="space-y-4">
          {groupedByPhase.map(group => {
            const isExpanded = expandedPhases.has(group.phase);
            const phaseProgress = Math.round((group.tasks.filter(t => t.completed).length / group.tasks.length) * 100);

            return (
              <div key={group.phase} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => togglePhase(group.phase)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={isExpanded ? 'transform rotate-180 transition' : 'transition'}>
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-900">{group.phase}</h3>
                      <p className="text-sm text-gray-600">
                        {group.tasks.filter(t => t.completed).length} of {group.tasks.length} completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#d97706"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - phaseProgress / 100)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-900">{phaseProgress}%</span>
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 space-y-2 bg-gray-50">
                    {group.tasks.map(task => {
                      const priorityColors = {
                        high: 'bg-red-100 text-red-700',
                        medium: 'bg-amber-100 text-amber-700',
                        low: 'bg-blue-100 text-blue-700',
                      };

                      return (
                        <div
                          key={task.id}
                          className={`bg-white rounded-xl p-4 border border-gray-200 ${
                            task.completed ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTask(task.id)}
                              className="w-5 h-5 mt-0.5 rounded border-gray-300 text-champagne-600 focus:ring-champagne-500 cursor-pointer flex-shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                  {task.title}
                                </p>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className={`text-xs px-2 py-1 rounded ${priorityColors[task.priority]}`}>
                                    {task.priority}
                                  </span>
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {task.category}
                                  </span>
                                </div>
                              </div>

                              {task.notes && (
                                <div className="flex items-start gap-2 text-xs bg-amber-50 text-amber-800 px-3 py-2 rounded-lg mb-2">
                                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                  <span>{task.notes}</span>
                                </div>
                              )}

                              {task.vendorQuestions && task.vendorQuestions.length > 0 && (
                                <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    <span className="text-xs font-bold text-purple-900">CRITICAL VENDOR QUESTIONS:</span>
                                  </div>
                                  <ul className="space-y-1">
                                    {task.vendorQuestions.map((q, i) => (
                                      <li key={i} className="text-xs text-purple-800 flex items-start gap-2">
                                        <span className="text-purple-400">•</span>
                                        <span>{q}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tasks found with current filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
