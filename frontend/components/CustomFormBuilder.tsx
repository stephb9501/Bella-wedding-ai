'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Eye, Edit2, Copy, Send, CheckSquare, Type, Calendar, Hash, Mail, Phone, List } from 'lucide-react';

interface FormField {
  id?: string;
  field_type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  field_order: number;
}

interface CustomForm {
  id?: string;
  wedding_id?: string;
  vendor_id: string;
  form_name: string;
  description: string;
  fields: FormField[];
  is_published: boolean;
  created_at?: string;
}

interface FormResponse {
  id?: string;
  form_id: string;
  respondent_email?: string;
  response_data: Record<string, any>;
  submitted_at?: string;
}

interface CustomFormBuilderProps {
  vendorId: string;
  weddingId?: string;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text', icon: Type },
  { value: 'textarea', label: 'Long Text', icon: Type },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'select', label: 'Dropdown', icon: List },
  { value: 'checkbox', label: 'Checkboxes', icon: CheckSquare },
  { value: 'radio', label: 'Multiple Choice', icon: CheckSquare },
];

export function CustomFormBuilder({ vendorId, weddingId }: CustomFormBuilderProps) {
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<CustomForm | null>(null);
  const [editingForm, setEditingForm] = useState<CustomForm | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'builder' | 'responses'>('builder');
  const [showNewForm, setShowNewForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchForms();
  }, [vendorId]);

  useEffect(() => {
    if (selectedForm?.id) {
      fetchResponses(selectedForm.id);
    }
  }, [selectedForm]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/custom-forms?vendor_id=${vendorId}`);
      if (!response.ok) throw new Error('Failed to fetch forms');
      const data = await response.json();
      setForms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async (formId: string) => {
    try {
      const response = await fetch(`/api/custom-forms/responses?form_id=${formId}`);
      if (!response.ok) throw new Error('Failed to fetch responses');
      const data = await response.json();
      setResponses(data);
    } catch (err) {
      console.error('Error fetching responses:', err);
    }
  };

  const createNewForm = () => {
    const newForm: CustomForm = {
      vendor_id: vendorId,
      wedding_id: weddingId,
      form_name: 'Untitled Form',
      description: '',
      fields: [],
      is_published: false,
    };
    setEditingForm(newForm);
    setShowNewForm(true);
  };

  const saveForm = async () => {
    if (!editingForm) return;

    if (!editingForm.form_name.trim()) {
      setError('Please enter a form name');
      return;
    }

    try {
      const method = editingForm.id ? 'PUT' : 'POST';
      const response = await fetch('/api/custom-forms', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingForm),
      });

      if (!response.ok) throw new Error('Failed to save form');
      const saved = await response.json();

      if (editingForm.id) {
        setForms(forms.map(f => f.id === saved.id ? saved : f));
      } else {
        setForms([...forms, saved]);
      }

      setSelectedForm(saved);
      setEditingForm(null);
      setShowNewForm(false);
      alert('Form saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;

    try {
      const response = await fetch(`/api/custom-forms?id=${formId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete form');
      setForms(forms.filter(f => f.id !== formId));
      if (selectedForm?.id === formId) {
        setSelectedForm(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const addField = () => {
    if (!editingForm) return;

    const newField: FormField = {
      field_type: 'text',
      label: 'New Field',
      placeholder: '',
      required: false,
      field_order: editingForm.fields.length,
    };

    setEditingForm({
      ...editingForm,
      fields: [...editingForm.fields, newField],
    });
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    if (!editingForm) return;

    const updatedFields = [...editingForm.fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };

    setEditingForm({
      ...editingForm,
      fields: updatedFields,
    });
  };

  const removeField = (index: number) => {
    if (!editingForm) return;

    setEditingForm({
      ...editingForm,
      fields: editingForm.fields.filter((_, i) => i !== index),
    });
  };

  const togglePublish = async (form: CustomForm) => {
    try {
      const response = await fetch('/api/custom-forms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          is_published: !form.is_published,
        }),
      });

      if (!response.ok) throw new Error('Failed to update form');
      const updated = await response.json();
      setForms(forms.map(f => f.id === updated.id ? updated : f));
      if (selectedForm?.id === updated.id) {
        setSelectedForm(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const duplicateForm = async (form: CustomForm) => {
    // Deep copy fields array to prevent mutation
    const duplicate: CustomForm = {
      vendor_id: vendorId,
      wedding_id: weddingId,
      form_name: `${form.form_name} (Copy)`,
      description: form.description,
      fields: JSON.parse(JSON.stringify(form.fields)), // Deep copy
      is_published: false,
    };

    try {
      const response = await fetch('/api/custom-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicate),
      });

      if (!response.ok) throw new Error('Failed to duplicate form');
      const created = await response.json();
      setForms([...forms, created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getFieldIcon = (type: string) => {
    const fieldType = FIELD_TYPES.find(ft => ft.value === type);
    return fieldType ? fieldType.icon : Type;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="w-12 h-12 border-4 border-champagne-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading forms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Custom Form Builder</h2>
            <p className="text-gray-600 mt-1">Create custom questionnaires for your clients</p>
          </div>
          <button
            onClick={createNewForm}
            className="flex items-center gap-2 px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            New Form
          </button>
        </div>

        {/* Form List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {forms.map((form) => (
            <div
              key={form.id}
              className={`p-4 border-2 rounded-xl cursor-pointer transition ${
                selectedForm?.id === form.id
                  ? 'border-champagne-500 bg-champagne-50'
                  : 'border-gray-200 hover:border-champagne-300'
              }`}
              onClick={() => setSelectedForm(form)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-900">{form.form_name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${
                  form.is_published
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {form.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{form.description || 'No description'}</p>
              <div className="text-xs text-gray-500 mb-3">
                {form.fields.length} fields • {responses.filter(r => r.form_id === form.id).length} responses
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingForm(form);
                    setShowNewForm(true);
                  }}
                  className="flex-1 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                >
                  <Edit2 className="w-3 h-3 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateForm(form);
                  }}
                  className="flex-1 px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition"
                >
                  <Copy className="w-3 h-3 inline mr-1" />
                  Duplicate
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteForm(form.id!);
                  }}
                  className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {forms.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-400">
              <CheckSquare className="w-16 h-16 mx-auto mb-4" />
              <p>No forms yet. Create your first form to get started!</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Form Builder/Editor Modal */}
      {showNewForm && editingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingForm.id ? 'Edit Form' : 'Create New Form'}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  <Eye className="w-4 h-4 inline mr-2" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </button>
                <button
                  onClick={saveForm}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowNewForm(false);
                    setEditingForm(null);
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Form Name</label>
                  <input
                    type="text"
                    value={editingForm.form_name}
                    onChange={(e) => setEditingForm({ ...editingForm, form_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    placeholder="e.g., Photography Client Questionnaire"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingForm.description}
                    onChange={(e) => setEditingForm({ ...editingForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    placeholder="Describe the purpose of this form..."
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">Form Fields</h4>
                    <button
                      onClick={addField}
                      className="flex items-center gap-2 px-3 py-1 bg-champagne-600 hover:bg-champagne-700 text-white text-sm rounded-lg transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Field
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {editingForm.fields.map((field, index) => {
                      const Icon = getFieldIcon(field.field_type);
                      return (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-start gap-3">
                            <Icon className="w-5 h-5 text-gray-600 mt-2" />
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) => updateField(index, { label: e.target.value })}
                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500"
                                placeholder="Field label"
                              />

                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={field.field_type}
                                  onChange={(e) => updateField(index, { field_type: e.target.value as any })}
                                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500"
                                >
                                  {FIELD_TYPES.map(ft => (
                                    <option key={ft.value} value={ft.value}>{ft.label}</option>
                                  ))}
                                </select>

                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => updateField(index, { required: e.target.checked })}
                                    className="w-4 h-4 text-champagne-600 rounded focus:ring-champagne-500"
                                  />
                                  Required
                                </label>
                              </div>

                              {(field.field_type === 'select' || field.field_type === 'radio' || field.field_type === 'checkbox') && (
                                <input
                                  type="text"
                                  value={(field.options || []).join(', ')}
                                  onChange={(e) => updateField(index, { options: e.target.value.split(',').map(o => o.trim()) })}
                                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500"
                                  placeholder="Options (comma-separated)"
                                />
                              )}
                            </div>
                            <button
                              onClick={() => removeField(index)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-2">{editingForm.form_name}</h4>
                  <p className="text-sm text-gray-600 mb-6">{editingForm.description}</p>

                  <div className="space-y-4">
                    {editingForm.fields.map((field, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                          {field.required && <span className="text-red-600 ml-1">*</span>}
                        </label>

                        {field.field_type === 'text' && (
                          <input
                            type="text"
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            disabled
                          />
                        )}

                        {field.field_type === 'textarea' && (
                          <textarea
                            placeholder={field.placeholder}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            disabled
                          />
                        )}

                        {field.field_type === 'number' && (
                          <input
                            type="number"
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            disabled
                          />
                        )}

                        {field.field_type === 'email' && (
                          <input
                            type="email"
                            placeholder={field.placeholder || 'email@example.com'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            disabled
                          />
                        )}

                        {field.field_type === 'phone' && (
                          <input
                            type="tel"
                            placeholder={field.placeholder || '(555) 123-4567'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            disabled
                          />
                        )}

                        {field.field_type === 'date' && (
                          <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            disabled
                          />
                        )}

                        {field.field_type === 'select' && (
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>
                            <option>Select an option...</option>
                            {(field.options || []).map((option, i) => (
                              <option key={i}>{option}</option>
                            ))}
                          </select>
                        )}

                        {field.field_type === 'checkbox' && (
                          <div className="space-y-2">
                            {(field.options || []).map((option, i) => (
                              <label key={i} className="flex items-center gap-2">
                                <input type="checkbox" disabled className="w-4 h-4" />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {field.field_type === 'radio' && (
                          <div className="space-y-2">
                            {(field.options || []).map((option, i) => (
                              <label key={i} className="flex items-center gap-2">
                                <input type="radio" name={`field-${index}`} disabled className="w-4 h-4" />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    <button className="w-full px-4 py-2 bg-champagne-600 text-white rounded-lg" disabled>
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Details & Responses */}
      {selectedForm && !showNewForm && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{selectedForm.form_name}</h3>
              <p className="text-gray-600">{selectedForm.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => togglePublish(selectedForm)}
                className={`px-4 py-2 font-medium rounded-lg transition ${
                  selectedForm.is_published
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {selectedForm.is_published ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'builder'
                  ? 'text-champagne-600 border-b-2 border-champagne-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Form Fields ({selectedForm.fields.length})
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'responses'
                  ? 'text-champagne-600 border-b-2 border-champagne-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Responses ({responses.length})
            </button>
          </div>

          {/* Builder Tab */}
          {activeTab === 'builder' && (
            <div className="space-y-3">
              {selectedForm.fields.map((field, index) => {
                const Icon = getFieldIcon(field.field_type);
                return (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{field.label}</div>
                      <div className="text-sm text-gray-600">
                        Type: {FIELD_TYPES.find(ft => ft.value === field.field_type)?.label}
                        {field.required && <span className="ml-2 text-red-600">Required</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Responses Tab */}
          {activeTab === 'responses' && (
            <div className="space-y-4">
              {responses.map((response) => (
                <div key={response.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-gray-900">
                      {response.respondent_email || 'Anonymous'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {response.submitted_at ? new Date(response.submitted_at).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(response.response_data).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-sm font-medium text-gray-700">{key}</div>
                        <div className="text-sm text-gray-900">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {responses.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Send className="w-16 h-16 mx-auto mb-4" />
                  <p>No responses yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
