'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Calendar, ChevronDown, ChevronUp, CheckCircle, Circle } from 'lucide-react';

const TIMELINE_PHASES = [
  {
    id: '12-months',
    title: '12+ Months Before',
    icon: '🎯',
    tasks: [
      'Set your wedding date',
      'Determine your budget',
      'Create guest list draft',
      'Start researching venues',
      'Hire a wedding planner (optional)',
      'Choose wedding party members',
    ]
  },
  {
    id: '9-11-months',
    title: '9-11 Months Before',
    icon: '📍',
    tasks: [
      'Book your venue',
      'Hire photographer',
      'Hire videographer',
      'Book caterer',
      'Choose color scheme',
      'Register for gifts',
      'Order save-the-dates',
    ]
  },
  {
    id: '6-8-months',
    title: '6-8 Months Before',
    icon: '💍',
    tasks: [
      'Shop for wedding dress',
      'Book florist',
      'Book DJ or band',
      'Book hair & makeup artist',
      'Order wedding invitations',
      'Plan honeymoon',
      'Book hotel room blocks',
    ]
  },
  {
    id: '4-5-months',
    title: '4-5 Months Before',
    icon: '🎨',
    tasks: [
      'Finalize menu with caterer',
      'Order wedding cake',
      'Shop for wedding rings',
      'Book transportation',
      'Plan ceremony details',
      'Choose wedding favors',
    ]
  },
  {
    id: '2-3-months',
    title: '2-3 Months Before',
    icon: '📋',
    tasks: [
      'Send invitations',
      'Purchase groomsmen attire',
      'Order bridesmaid dresses',
      'Finalize ceremony readings',
      'Create seating chart',
      'Schedule dress fittings',
      'Apply for marriage license',
    ]
  },
  {
    id: '1-month',
    title: '1 Month Before',
    icon: '⚡',
    tasks: [
      'Final venue walkthrough',
      'Confirm all vendor details',
      'Break in wedding shoes',
      'Write vows (if applicable)',
      'Finalize seating chart',
      'Confirm RSVPs',
      'Schedule rehearsal dinner',
    ]
  },
  {
    id: '1-week',
    title: '1 Week Before',
    icon: '✨',
    tasks: [
      'Pack for honeymoon',
      'Give final headcount to caterer',
      'Prepare vendor tip envelopes',
      'Rehearsal and rehearsal dinner',
      'Get manicure/pedicure',
      'Confirm transportation',
      'Prepare emergency kit',
    ]
  },
  {
    id: 'day-of',
    title: 'Wedding Day',
    icon: '💒',
    tasks: [
      'Eat a good breakfast',
      'Get hair and makeup done',
      'Take photos with bridal party',
      'Enjoy your ceremony',
      'Have fun at reception',
      'Say goodbye to guests',
      'Head to honeymoon!',
    ]
  },
];

export default function Timeline() {
  const router = useRouter();
  const [expandedPhases, setExpandedPhases] = useState<string[]>(['12-months', '9-11-months']);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId)
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const toggleTask = (phaseId: string, taskIndex: number) => {
    const taskId = `${phaseId}-${taskIndex}`;
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getPhaseProgress = (phase: typeof TIMELINE_PHASES[0]) => {
    const completed = phase.tasks.filter((_, idx) =>
      completedTasks.has(`${phase.id}-${idx}`)
    ).length;
    return Math.round((completed / phase.tasks.length) * 100);
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
            <h1 className="text-xl font-serif font-bold text-gray-900">Wedding Timeline</h1>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-serif font-bold text-gray-900 mb-4">
            Your Wedding Timeline
          </h2>
          <p className="text-xl text-gray-600">
            Stay organized with our month-by-month planning guide
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {TIMELINE_PHASES.map((phase, phaseIndex) => {
            const progress = getPhaseProgress(phase);
            const isExpanded = expandedPhases.includes(phase.id);

            return (
              <div
                key={phase.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200"
              >
                {/* Phase Header */}
                <button
                  onClick={() => togglePhase(phase.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{phase.icon}</span>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-900">{phase.title}</h3>
                      <p className="text-sm text-gray-600">
                        {phase.tasks.filter((_, idx) => completedTasks.has(`${phase.id}-${idx}`)).length} of {phase.tasks.length} tasks completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Progress Circle */}
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#e5e7eb"
                          strokeWidth="6"
                          fill="none"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#d97706"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-900">{progress}%</span>
                      </div>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Tasks */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 bg-gray-50">
                    <div className="space-y-2">
                      {phase.tasks.map((task, taskIndex) => {
                        const taskId = `${phase.id}-${taskIndex}`;
                        const isCompleted = completedTasks.has(taskId);

                        return (
                          <label
                            key={taskIndex}
                            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() => toggleTask(phase.id, taskIndex)}
                              className="w-5 h-5 rounded border-gray-300 text-champagne-600 focus:ring-champagne-500 cursor-pointer"
                            />
                            <span className={`flex-1 ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                              {task}
                            </span>
                            {isCompleted && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overall Progress */}
        <div className="mt-12 bg-white rounded-2xl shadow-md p-8 border border-champagne-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-champagne-600" />
            Overall Progress
          </h3>
          <div className="space-y-4">
            {TIMELINE_PHASES.map(phase => {
              const progress = getPhaseProgress(phase);
              return (
                <div key={phase.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{phase.title}</span>
                    <span className="text-sm font-bold text-champagne-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-champagne-500 to-rose-500 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
