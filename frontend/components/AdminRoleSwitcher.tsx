'use client';

import { useState, useEffect } from 'react';
import { UserCircle, Settings, ChevronDown, Heart } from 'lucide-react';

export type ViewMode = 'bride' | 'vendor' | 'admin';

export interface AdminViewSettings {
  mode: ViewMode;
  vendorRole?: string;
}

const VENDOR_ROLES = [
  'planner',
  'dj',
  'florist',
  'photographer',
  'videographer',
  'caterer',
  'venue',
  'hair-makeup',
  'transportation',
  'other'
];

export function AdminRoleSwitcher() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [settings, setSettings] = useState<AdminViewSettings>({
    mode: 'admin',
    vendorRole: undefined,
  });

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('admin_view_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse admin view settings');
      }
    }
  }, []);

  const updateSettings = (newSettings: AdminViewSettings) => {
    setSettings(newSettings);
    localStorage.setItem('admin_view_settings', JSON.stringify(newSettings));
    // Trigger a page reload to apply new view mode
    window.location.reload();
  };

  const getModeLabel = () => {
    if (settings.mode === 'bride') return 'Viewing as Bride';
    if (settings.mode === 'vendor') return `Viewing as ${settings.vendorRole || 'Vendor'}`;
    return 'Admin Mode';
  };

  const getModeIcon = () => {
    if (settings.mode === 'bride') return <Heart className="w-4 h-4" />;
    if (settings.mode === 'vendor') return <UserCircle className="w-4 h-4" />;
    return <Settings className="w-4 h-4" />;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-300 rounded-lg transition"
      >
        {getModeIcon()}
        <span className="text-sm font-medium">{getModeLabel()}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200 bg-purple-50">
            <p className="text-xs font-semibold text-purple-900 uppercase">Admin View Switcher</p>
            <p className="text-xs text-purple-700 mt-1">Testing different user perspectives</p>
          </div>

          <div className="p-2">
            {/* Admin Mode */}
            <button
              onClick={() => {
                updateSettings({ mode: 'admin' });
                setShowDropdown(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition ${
                settings.mode === 'admin' ? 'bg-purple-100 text-purple-900' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="font-medium">Admin Mode</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Full access to all features</p>
            </button>

            {/* Bride View */}
            <button
              onClick={() => {
                updateSettings({ mode: 'bride' });
                setShowDropdown(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition mt-1 ${
                settings.mode === 'bride' ? 'bg-purple-100 text-purple-900' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span className="font-medium">Bride Dashboard</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">See app from bride perspective</p>
            </button>

            {/* Vendor View */}
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-700 px-3 mb-2">Vendor Roles</p>
              <div className="max-h-64 overflow-y-auto">
                {VENDOR_ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      updateSettings({ mode: 'vendor', vendorRole: role });
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition ${
                      settings.mode === 'vendor' && settings.vendorRole === role
                        ? 'bg-purple-100 text-purple-900'
                        : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4" />
                      <span className="text-sm capitalize">{role.replace('-', ' ')}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-600">
              💡 Page will reload when you change view mode
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper hook to get current admin view settings
export function useAdminViewSettings(): AdminViewSettings {
  const [settings, setSettings] = useState<AdminViewSettings>({
    mode: 'admin',
    vendorRole: undefined,
  });

  useEffect(() => {
    const saved = localStorage.getItem('admin_view_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        setSettings({ mode: 'admin' });
      }
    }
  }, []);

  return settings;
}
