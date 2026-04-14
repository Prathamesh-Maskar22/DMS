// src/Diesel/Pages/DriverMaster.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function DriverMaster() {
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [form, setForm] = useState({
    driver_name: '',
    driver_code: '',
  });

  // Fetch drivers
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/masters/drivers`)
      .then(r => r.json())
      .then(res => setDrivers(res.data || []));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      driver_name: form.driver_name,
      driver_code: form.driver_code,
    };

    const url = editingDriver
      ? `${API_BASE_URL}/api/v1/masters/drivers/${editingDriver.id}`
      : `${API_BASE_URL}/api/v1/masters/drivers`;

    const method = editingDriver ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      // Refresh list
      const listRes = await fetch(`${API_BASE_URL}/api/v1/masters/drivers`);
      const listData = await listRes.json();
      setDrivers(listData.data || []);

      // Close modal & reset
      setShowModal(false);
      setEditingDriver(null);
      setForm({ driver_name: '', driver_code: '' });
    } else {
      const error = await res.json();
      alert(error.error || 'Failed to save driver');
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setForm({
      driver_name: driver.driver_name,
      driver_code: driver.driver_code,
    });
    setShowModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="text-blue-600" /> Driver Master
        </h1>
        <button
          onClick={() => { setEditingDriver(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-medium"
        >
          <Plus size={20} /> Add New Driver
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">Driver Name</th>
              <th className="px-6 py-4 text-left">Driver Code</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {drivers.map(d => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{d.driver_name}</td>
                <td className="px-6 py-4 font-mono text-gray-700">{d.driver_code}</td>
                <td className="px-6 py-4 text-center flex justify-center gap-4">
                  <button
                    onClick={() => handleEdit(d)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Soft delete this driver?')) {
                        fetch(`${API_BASE_URL}/api/v1/masters/drivers/${d.id}`, { method: 'DELETE' })
                          .then(() => window.location.reload());
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
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
            <h2 className="text-2xl font-bold mb-6">
              {editingDriver ? 'Edit Driver' : 'Add New Driver'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Driver Name *</label>
                <input
                  name="driver_name"
                  value={form.driver_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-2xl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Driver Code *</label>
                <input
                  name="driver_code"
                  value={form.driver_code}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-2xl font-mono"
                  placeholder="DR_001"
                  required
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 border rounded-2xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-semibold"
                >
                  {editingDriver ? 'Update Driver' : 'Save Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}