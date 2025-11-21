'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Image as ImageIcon, Palette, Type, Save, Eye, EyeOff, Download, Upload } from 'lucide-react';

interface MoodboardItem {
  id?: string;
  moodboard_id?: string;
  item_type: 'image' | 'color' | 'note';
  image_url?: string;
  note?: string;
  color_value?: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  z_index: number;
}

interface Moodboard {
  id?: string;
  wedding_id: string;
  name: string;
  description: string;
  color_palette: string[];
  is_public: boolean;
  created_at?: string;
  items?: MoodboardItem[];
}

interface MoodboardsProps {
  weddingId: string;
  userRole: string;
}

export function Moodboards({ weddingId, userRole }: MoodboardsProps) {
  const [moodboards, setMoodboards] = useState<Moodboard[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Moodboard | null>(null);
  const [items, setItems] = useState<MoodboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [newBoard, setNewBoard] = useState<Moodboard>({
    wedding_id: weddingId,
    name: '',
    description: '',
    color_palette: [],
    is_public: true,
  });
  const [selectedTool, setSelectedTool] = useState<'select' | 'image' | 'color' | 'note'>('select');
  const [newColor, setNewColor] = useState('#FFFFFF');
  const [newNote, setNewNote] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMoodboards();
  }, [weddingId]);

  useEffect(() => {
    if (selectedBoard?.id) {
      fetchMoodboardItems(selectedBoard.id);
    }
  }, [selectedBoard]);

  const fetchMoodboards = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/moodboards?wedding_id=${weddingId}`);
      if (!response.ok) throw new Error('Failed to fetch moodboards');
      const data = await response.json();
      setMoodboards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchMoodboardItems = async (moodboardId: string) => {
    try {
      const response = await fetch(`/api/moodboards/items?moodboard_id=${moodboardId}`);
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const createMoodboard = async () => {
    if (!newBoard.name.trim()) {
      setError('Please enter a moodboard name');
      return;
    }

    try {
      const response = await fetch('/api/moodboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBoard),
      });

      if (!response.ok) throw new Error('Failed to create moodboard');
      const created = await response.json();
      setMoodboards([...moodboards, created]);
      setSelectedBoard(created);
      setShowNewBoard(false);
      setNewBoard({
        wedding_id: weddingId,
        name: '',
        description: '',
        color_palette: [],
        is_public: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteMoodboard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this moodboard?')) return;

    try {
      const response = await fetch(`/api/moodboards?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete moodboard');
      setMoodboards(moodboards.filter(b => b.id !== id));
      if (selectedBoard?.id === id) {
        setSelectedBoard(null);
        setItems([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedTool === 'select' || !selectedBoard?.id) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === 'color') {
      addColorSwatch(x, y);
    } else if (selectedTool === 'note') {
      addNote(x, y);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBoard?.id) return;

    // In production, upload to Supabase Storage or similar
    // For now, we'll use a placeholder URL
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageUrl = event.target?.result as string;
      await addImage(imageUrl, 100, 100);
    };
    reader.readAsDataURL(file);
  };

  const addImage = async (imageUrl: string, x: number, y: number) => {
    if (!selectedBoard?.id) return;

    const newItem: MoodboardItem = {
      moodboard_id: selectedBoard.id,
      item_type: 'image',
      image_url: imageUrl,
      position_x: x,
      position_y: y,
      width: 200,
      height: 200,
      z_index: items.length,
    };

    try {
      const response = await fetch('/api/moodboards/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) throw new Error('Failed to add image');
      const created = await response.json();
      setItems([...items, created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const addColorSwatch = async (x: number, y: number) => {
    if (!selectedBoard?.id) return;

    const newItem: MoodboardItem = {
      moodboard_id: selectedBoard.id,
      item_type: 'color',
      color_value: newColor,
      position_x: x,
      position_y: y,
      width: 100,
      height: 100,
      z_index: items.length,
    };

    try {
      const response = await fetch('/api/moodboards/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) throw new Error('Failed to add color');
      const created = await response.json();
      setItems([...items, created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const addNote = async (x: number, y: number) => {
    if (!selectedBoard?.id || !newNote.trim()) {
      setError('Please enter a note');
      return;
    }

    const newItem: MoodboardItem = {
      moodboard_id: selectedBoard.id,
      item_type: 'note',
      note: newNote,
      position_x: x,
      position_y: y,
      width: 200,
      height: 100,
      z_index: items.length,
    };

    try {
      const response = await fetch('/api/moodboards/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) throw new Error('Failed to add note');
      const created = await response.json();
      setItems([...items, created]);
      setNewNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/moodboards/items?id=${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');
      setItems(items.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const item = items.find(i => i.id === draggedItem);
    if (!item?.id) return;

    try {
      const response = await fetch('/api/moodboards/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          position_x: x,
          position_y: y,
        }),
      });

      if (!response.ok) throw new Error('Failed to update position');
      const updated = await response.json();
      setItems(items.map(i => i.id === updated.id ? updated : i));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }

    setDraggedItem(null);
  };

  const addColorToPalette = () => {
    if (!selectedBoard) return;
    const updatedBoard = {
      ...selectedBoard,
      color_palette: [...selectedBoard.color_palette, newColor],
    };
    setSelectedBoard(updatedBoard);
  };

  const saveMoodboard = async () => {
    if (!selectedBoard?.id) return;

    try {
      const response = await fetch('/api/moodboards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedBoard.id,
          name: selectedBoard.name,
          description: selectedBoard.description,
          color_palette: selectedBoard.color_palette,
          is_public: selectedBoard.is_public,
        }),
      });

      if (!response.ok) throw new Error('Failed to save moodboard');
      alert('Moodboard saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="w-12 h-12 border-4 border-champagne-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading moodboards...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Moodboards</h2>
            <p className="text-gray-600 mt-1">Create visual inspiration boards for your wedding</p>
          </div>
          <button
            onClick={() => setShowNewBoard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            New Moodboard
          </button>
        </div>

        {/* Moodboard List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {moodboards.map((board) => (
            <div
              key={board.id}
              onClick={() => setSelectedBoard(board)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition ${
                selectedBoard?.id === board.id
                  ? 'border-champagne-500 bg-champagne-50'
                  : 'border-gray-200 hover:border-champagne-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{board.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{board.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {board.is_public ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-500">
                      {board.is_public ? 'Shared' : 'Private'}
                    </span>
                  </div>
                  {/* Color Palette Preview */}
                  {board.color_palette.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {board.color_palette.slice(0, 5).map((color, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMoodboard(board.id!);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* New Moodboard Modal */}
      {showNewBoard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Moodboard</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newBoard.name}
                  onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  placeholder="e.g., Romantic Garden Theme"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newBoard.description}
                  onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  placeholder="Describe your vision..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={newBoard.is_public}
                  onChange={(e) => setNewBoard({ ...newBoard, is_public: e.target.checked })}
                  className="w-4 h-4 text-champagne-600 rounded focus:ring-champagne-500"
                />
                <label htmlFor="is_public" className="text-sm text-gray-700">
                  Share with vendors
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNewBoard(false);
                    setNewBoard({
                      wedding_id: weddingId,
                      name: '',
                      description: '',
                      color_palette: [],
                      is_public: true,
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createMoodboard}
                  className="flex-1 px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Editor */}
      {selectedBoard && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">{selectedBoard.name}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={saveMoodboard}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTool('select')}
                className={`p-2 rounded-lg transition ${
                  selectedTool === 'select' ? 'bg-champagne-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Select
              </button>
              <button
                onClick={() => {
                  setSelectedTool('image');
                  fileInputRef.current?.click();
                }}
                className={`flex items-center gap-2 p-2 rounded-lg transition ${
                  selectedTool === 'image' ? 'bg-champagne-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => setSelectedTool('color')}
                className={`flex items-center gap-2 p-2 rounded-lg transition ${
                  selectedTool === 'color' ? 'bg-champagne-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Palette className="w-4 h-4" />
                Color
              </button>
              <button
                onClick={() => setSelectedTool('note')}
                className={`flex items-center gap-2 p-2 rounded-lg transition ${
                  selectedTool === 'note' ? 'bg-champagne-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Type className="w-4 h-4" />
                Note
              </button>
            </div>

            {selectedTool === 'color' && (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <button
                  onClick={addColorToPalette}
                  className="px-3 py-1 text-sm bg-champagne-600 hover:bg-champagne-700 text-white rounded-lg"
                >
                  Add to Palette
                </button>
              </div>
            )}

            {selectedTool === 'note' && (
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter note text..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            )}
          </div>

          {/* Color Palette */}
          {selectedBoard.color_palette.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Color Palette</h4>
              <div className="flex flex-wrap gap-2">
                {selectedBoard.color_palette.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 rounded-lg border-2 border-white shadow-md cursor-pointer hover:scale-110 transition"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Canvas */}
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative w-full h-[600px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-crosshair"
          >
            {items.map((item) => (
              <div
                key={item.id}
                draggable={selectedTool === 'select'}
                onDragStart={() => handleDragStart(item.id!)}
                className="absolute group cursor-move"
                style={{
                  left: item.position_x,
                  top: item.position_y,
                  width: item.width,
                  height: item.height,
                  zIndex: item.z_index,
                }}
              >
                {item.item_type === 'image' && (
                  <img
                    src={item.image_url}
                    alt="Moodboard item"
                    className="w-full h-full object-cover rounded-lg shadow-md border-2 border-white"
                  />
                )}
                {item.item_type === 'color' && (
                  <div
                    className="w-full h-full rounded-lg shadow-md border-2 border-white"
                    style={{ backgroundColor: item.color_value }}
                  />
                )}
                {item.item_type === 'note' && (
                  <div className="w-full h-full p-3 bg-yellow-100 rounded-lg shadow-md border-2 border-yellow-200">
                    <p className="text-sm text-gray-800">{item.note}</p>
                  </div>
                )}
                <button
                  onClick={() => deleteItem(item.id!)}
                  className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {items.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Palette className="w-16 h-16 mx-auto mb-2" />
                  <p>Click the tools above to add images, colors, or notes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
