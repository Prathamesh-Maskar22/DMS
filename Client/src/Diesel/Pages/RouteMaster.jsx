// src/Diesel/Pages/RouteMaster.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Route as RouteIcon } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function RouteMaster() {
  const [routes, setRoutes] = useState([]);
  const [cities, setCities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  const [form, setForm] = useState({
    route_code: '',
    route_description: '',
    from_city_id: '',
    to_city_id: '',
    standard_diesel_qty: '',
    standard_advance: '',
  });

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/v1/masters/routes`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/v1/masters/cities`).then(r => r.json()),
    ]).then(([routeRes, cityRes]) => {
      setRoutes(routeRes.data || []);
      setCities(cityRes.data || []);
    });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      route_code: form.route_code,
      route_description: form.route_description,
      from_city_id: form.from_city_id ? Number(form.from_city_id) : null,
      to_city_id: form.to_city_id ? Number(form.to_city_id) : null,
      standard_diesel_qty: form.standard_diesel_qty ? Number(form.standard_diesel_qty) : null,
      standard_advance: form.standard_advance ? Number(form.standard_advance) : null,
    };

    const url = editingRoute ? `${API_BASE_URL}/api/v1/masters/routes/${editingRoute.id}` : `${API_BASE_URL}/api/v1/masters/routes`;
    const method = editingRoute ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const listRes = await fetch(`${API_BASE_URL}/api/v1/masters/routes`);
      const listData = await listRes.json();
      setRoutes(listData.data || []);
      setShowModal(false);
      setEditingRoute(null);
      setForm({ route_code: '', route_description: '', from_city_id: '', to_city_id: '', standard_diesel_qty: '', standard_advance: '' });
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setForm({
      route_code: route.route_code,
      route_description: route.route_description || '',
      from_city_id: route.from_city_id || '',
      to_city_id: route.to_city_id || '',
      standard_diesel_qty: route.standard_diesel_qty || '',
      standard_advance: route.standard_advance || '',
    });
    setShowModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <RouteIcon className="text-blue-600" /> Route Master
        </h1>
        <button onClick={() => { setEditingRoute(null); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-medium">
          <Plus size={20} /> Add New Route
        </button>
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">Route Code</th>
              <th className="px-6 py-4 text-left">From → To</th>
              <th className="px-6 py-4 text-left">Standard Diesel (L)</th>
              <th className="px-6 py-4 text-left">Advance (₹)</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {routes.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{r.route_code}</td>
                <td className="px-6 py-4">{r.fromCity?.city_name} → {r.toCity?.city_name}</td>
                <td className="px-6 py-4">{r.standard_diesel_qty}</td>
                <td className="px-6 py-4">{r.standard_advance}</td>
                <td className="px-6 py-4 text-center flex justify-center gap-4">
                  <button onClick={() => handleEdit(r)} className="text-blue-600"><Edit2 size={18} /></button>
                  <button onClick={() => { if (confirm('Delete?')) fetch(`${API_BASE_URL}/api/v1/masters/routes/${r.id}`, { method: 'DELETE' }).then(() => window.location.reload()); }} className="text-red-600"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-2xl mx-4 p-8">
            <h2 className="text-2xl font-bold mb-6">{editingRoute ? 'Edit Route' : 'Add New Route'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Route Code *</label>
                <input name="route_code" value={form.route_code} onChange={handleChange} className="w-full px-4 py-3 border rounded-2xl" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">From City</label>
                <select name="from_city_id" value={form.from_city_id} onChange={handleChange} className="w-full px-4 py-3 border rounded-2xl">
                  <option value="">Select From</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.city_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">To City</label>
                <select name="to_city_id" value={form.to_city_id} onChange={handleChange} className="w-full px-4 py-3 border rounded-2xl">
                  <option value="">Select To</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.city_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Standard Diesel Qty (L)</label>
                <input name="standard_diesel_qty" type="number" step="0.01" value={form.standard_diesel_qty} onChange={handleChange} className="w-full px-4 py-3 border rounded-2xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Standard Advance (₹)</label>
                <input name="standard_advance" type="number" value={form.standard_advance} onChange={handleChange} className="w-full px-4 py-3 border rounded-2xl" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Route Description</label>
                <textarea name="route_description" value={form.route_description} onChange={handleChange} className="w-full px-4 py-3 border rounded-2xl h-24" />
              </div>

              <div className="col-span-2 flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 border rounded-2xl">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-semibold">{editingRoute ? 'Update Route' : 'Save Route'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}