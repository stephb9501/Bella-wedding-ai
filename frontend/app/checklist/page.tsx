'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, CheckCircle, Circle, Filter, Plus, X } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

const INITIAL_TASKS: Task[] = [
  // Venue
  { id: '1', title: 'Research and visit potential venues', category: 'Venue', priority: 'high', completed: false },
  { id: '2', title: 'Book ceremony venue', category: 'Venue', priority: 'high', completed: false },
  { id: '3', title: 'Book reception venue', category: 'Venue', priority: 'high', completed: false },
  { id: '4', title: 'Confirm venue contract details', category: 'Venue', priority: 'high', completed: false },

  // Photography/Video
  { id: '5', title: 'Research photographers', category: 'Photography', priority: 'high', completed: false },
  { id: '6', title: 'Book photographer', category: 'Photography', priority: 'high', completed: false },
  { id: '7', title: 'Book videographer', category: 'Photography', priority: 'medium', completed: false },
  { id: '8', title: 'Schedule engagement photo session', category: 'Photography', priority: 'medium', completed: false },

  // Catering
  { id: '9', title: 'Research catering options', category: 'Catering', priority: 'high', completed: false },
  { id: '10', title: 'Schedule tastings', category: 'Catering', priority: 'high', completed: false },
  { id: '11', title: 'Finalize menu selections', category: 'Catering', priority: 'high', completed: false },
  { id: '12', title: 'Confirm dietary restrictions', category: 'Catering', priority: 'medium', completed: false },

  // Attire
  { id: '13', title: 'Shop for wedding dress', category: 'Attire', priority: 'high', completed: false },
  { id: '14', title: 'Purchase/rent groom attire', category: 'Attire', priority: 'high', completed: false },
  { id: '15', title: 'Order bridesmaid dresses', category: 'Attire', priority: 'medium', completed: false },
  { id: '16', title: 'Schedule dress fittings', category: 'Attire', priority: 'medium', completed: false },

  // Music/Entertainment
  { id: '17', title: 'Book DJ or band', category: 'Music', priority: 'high', completed: false },
  { id: '18', title: 'Create ceremony music playlist', category: 'Music', priority: 'medium', completed: false },
  { id: '19', title: 'Choose first dance song', category: 'Music', priority: 'medium', completed: false },
  { id: '20', title: 'Plan cocktail hour music', category: 'Music', priority: 'low', completed: false },

  // Flowers/Decor
  { id: '21', title: 'Book florist', category: 'Flowers', priority: 'high', completed: false },
  { id: '22', title: 'Choose bouquet style', category: 'Flowers', priority: 'medium', completed: false },
  { id: '23', title: 'Select centerpieces', category: 'Flowers', priority: 'medium', completed: false },
  { id: '24', title: 'Plan ceremony decorations', category: 'Flowers', priority: 'medium', completed: false },

  // Invitations
  { id: '25', title: 'Design save-the-dates', category: 'Invitations', priority: 'high', completed: false },
  { id: '26', title: 'Send save-the-dates', category: 'Invitations', priority: 'high', completed: false },
  { id: '27', title: 'Design wedding invitations', category: 'Invitations', priority: 'high', completed: false },
  { id: '28', title: 'Mail invitations', category: 'Invitations', priority: 'high', completed: false },

  // Beauty
  { id: '29', title: 'Book hair stylist', category: 'Beauty', priority: 'high', completed: false },
  { id: '30', title: 'Book makeup artist', category: 'Beauty', priority: 'high', completed: false },
  { id: '31', title: 'Schedule trial sessions', category: 'Beauty', priority: 'medium', completed: false },
  { id: '32', title: 'Plan skincare routine', category: 'Beauty', priority: 'low', completed: false },

  // Cake
  { id: '33', title: 'Research bakeries', category: 'Cake', priority: 'medium', completed: false },
  { id: '34', title: 'Schedule cake tastings', category: 'Cake', priority: 'medium', completed: false },
  { id: '35', title: 'Order wedding cake', category: 'Cake', priority: 'medium', completed: false },
  { id: '36', title: 'Confirm delivery details', category: 'Cake', priority: 'medium', completed: false },

  // Legal
  { id: '37', title: 'Apply for marriage license', category: 'Legal', priority: 'high', completed: false },
  { id: '38', title: 'Discuss name change', category: 'Legal', priority: 'medium', completed: false },
  { id: '39', title: 'Update documents after marriage', category: 'Legal', priority: 'low', completed: false },

  // Transportation
  { id: '40', title: 'Book wedding day transportation', category: 'Transportation', priority: 'medium', completed: false },
  { id: '41', title: 'Arrange guest shuttle service', category: 'Transportation', priority: 'low', completed: false },
];

const CATEGORIES = ['All', 'Venue', 'Photography', 'Catering', 'Attire', 'Music', 'Flowers', 'Invitations', 'Beauty', 'Cake', 'Legal', 'Transportation'];

export default function Checklist() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState('All');
  const [showCompleted, setShowCompleted] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      category: filter === 'All' ? 'Other' : filter,
      priority: 'medium',
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter !== 'All' && task.category !== filter) return false;
    if (!showCompleted && task.completed) return false;
    return true;
  });

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

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className="text-5xl font-serif font-bold text-gray-900 mb-4">
            Your Wedding Checklist
          </h2>
          <p className="text-xl text-gray-600">
            {stats.completed} of {stats.total} tasks completed
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
            <div className="text-sm text-gray-600">Remaining</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-red-600 mb-1">{stats.highPriority}</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Filter by Category</span>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-champagne-600 focus:ring-champagne-500"
                />
                <span className="text-sm text-gray-700">Show completed</span>
              </label>

              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-2 px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white rounded-lg transition text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === cat
                    ? 'bg-champagne-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Add Task Modal */}
        {showAddTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add New Task</h3>
                <button onClick={() => setShowAddTask(false)}>
                  <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500 mb-4"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={addTask}
                  className="flex-1 px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No tasks found</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center gap-4 group hover:shadow-md transition ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-5 h-5 rounded border-gray-300 text-champagne-600 focus:ring-champagne-500 cursor-pointer flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {task.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : task.priority === 'medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-red-600" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
