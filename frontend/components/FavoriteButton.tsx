'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface Props {
  userId: string;
  vendorId: string;
  initialFavorited?: boolean;
  onToggle?: (favorited: boolean) => void;
}

export function FavoriteButton({ userId, vendorId, initialFavorited = false, onToggle }: Props) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async () => {
    setLoading(true);

    try {
      if (favorited) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?user_id=${userId}&vendor_id=${vendorId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to remove favorite');

        setFavorited(false);
        onToggle?.(false);
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            vendor_id: vendorId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          if (error.error?.includes('Already added')) {
            // Already favorited, just update UI
            setFavorited(true);
            return;
          }
          throw new Error('Failed to add favorite');
        }

        setFavorited(true);
        onToggle?.(true);
      }
    } catch (err) {
      console.error('Toggle favorite error:', err);
      alert('Failed to update favorites');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2 rounded-full transition ${
        favorited
          ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
      } disabled:opacity-50`}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`}
      />
    </button>
  );
}
