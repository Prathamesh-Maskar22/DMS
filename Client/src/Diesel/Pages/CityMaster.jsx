// src/Diesel/Pages/CityMaster.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function CityMaster() {
  const [cities, setCities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);

  const [form, setForm] = useState({ city_name: '' });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/masters/cities`)
      .then(r => r.json())
      .then(res => setCities(res.data || []));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingCity
      ? `${API_BASE_URL}/api/v1/masters/cities/${editingCity.id}`
      : `${API_BASE_URL}/api/v1/masters/cities`;
    const method = editingCity ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const listRes = await fetch(`${API_BASE_URL}/api/v1/masters/cities`);
      const listData = await listRes.json();
      setCities(listData.data || []);
      setShowModal(false);
      setEditingCity(null);
      setForm({ city_name: '' });
    }
  };

  const handleEdit = (city) => {
    setEditingCity(city);
    setForm({ city_name: city.city_name });
    setShowModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MapPin className="text-blue-600" /> City Master
        </h1>
        <button onClick={() => { setEditingCity(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-medium">
          <Plus size={20} /> Add New City
        </button>
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr><th className="px-6 py-4 text-left">City Name</th><th className="px-6 py-4 text-center">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {cities.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{c.city_name}</td>
                <td className="px-6 py-4 text-center flex justify-center gap-4">
                  <button onClick={() => handleEdit(c)} className="text-blue-600"><Edit2 size={18} /></button>
                  <button onClick={() => { if (confirm('Delete?')) fetch(`${API_BASE_URL}/api/v1/masters/cities/${c.id}`, { method: 'DELETE' }).then(() => window.location.reload()); }} className="text-red-600"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-lg mx-4 p-8">
            <h2 className="text-2xl font-bold mb-6">{editingCity ? 'Edit City' : 'Add New City'}</h2>
            <form onSubmit={handleSubmit}>
              <input name="city_name" value={form.city_name} onChange={handleChange} className="w-full px-4 py-3 border rounded-2xl" placeholder="City Name" required />
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 border rounded-2xl">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-semibold">{editingCity ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}