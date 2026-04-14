// src/Diesel/Pages/VehicleMaster.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Truck } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function VehicleMaster() {
  const [vehicles, setVehicles] = useState([]);
  const [modelTypes, setModelTypes] = useState([]);
  const [verticals, setVerticals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [form, setForm] = useState({
    vehicle_number: '',
    vehicle_short_code: '',
    model_type_id: '',
    vertical_id: '',
    ownership_type: 'Own',
    owner_name: '',
    loaded_mileage: '',
    empty_mileage: '',
  });

  // Fetch data
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/v1/masters/vehicles`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/v1/masters/vehicle-model-types`).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/v1/masters/vehicle-verticals`).then(r => r.json()),
    ]).then(([vehRes, modelRes, vertRes]) => {
      setVehicles(vehRes.data || []);
      setModelTypes(modelRes.data || []);
      setVerticals(vertRes.data || []);
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.model_type_id || !form.vertical_id) {
      alert('Please select Model Type and Vertical');
      return;
    }

    const payload = {
      vehicle_number: form.vehicle_number,
      vehicle_short_code: form.vehicle_short_code || null,
      model_type_id: Number(form.model_type_id),
      vertical_id: Number(form.vertical_id),
      ownership_type: form.ownership_type,
      owner_name: form.owner_name,
      loaded_mileage: form.loaded_mileage ? Number(form.loaded_mileage) : null,
      empty_mileage: form.empty_mileage ? Number(form.empty_mileage) : null,
    };

    const url = editingVehicle
      ? `${API_BASE_URL}/api/v1/masters/vehicles/${editingVehicle.id}`
      : `${API_BASE_URL}/api/v1/masters/vehicles`;

    const method = editingVehicle ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      // Refresh list
      const listRes = await fetch(`${API_BASE_URL}/api/v1/masters/vehicles`);
      const listData = await listRes.json();
      setVehicles(listData.data || []);

      // Close modal and reset form
      setShowModal(false);
      setEditingVehicle(null);
      setForm({
        vehicle_number: '', vehicle_short_code: '', model_type_id: '', vertical_id: '',
        ownership_type: 'Own', owner_name: '', loaded_mileage: '', empty_mileage: ''
      });
    } else {
      const error = await res.json();
      alert(error.error || 'Failed to save vehicle');
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setForm({
      vehicle_number: vehicle.vehicle_number,
      vehicle_short_code: vehicle.vehicle_short_code || '',
      model_type_id: vehicle.model_type_id,
      vertical_id: vehicle.vertical_id,
      ownership_type: vehicle.ownership_type,
      owner_name: vehicle.owner_name,
      loaded_mileage: vehicle.loaded_mileage || '',
      empty_mileage: vehicle.empty_mileage || '',
    });
    setShowModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Truck className="text-blue-600" /> Vehicle Master
        </h1>
        <button
          onClick={() => { setEditingVehicle(null); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-medium"
        >
          <Plus size={20} /> Add New Vehicle
        </button>
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">Vehicle Number</th>
              <th className="px-6 py-4 text-left">Short Code</th>
              <th className="px-6 py-4 text-left">Model Type</th>
              <th className="px-6 py-4 text-left">Vertical</th>
              <th className="px-6 py-4 text-left">Owner</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {vehicles.map(v => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{v.vehicle_number}</td>
                <td className="px-6 py-4">{v.vehicle_short_code || '-'}</td>
                <td className="px-6 py-4">{v.modelType?.model_name}</td>
                <td className="px-6 py-4">{v.vertical?.vertical_name}</td>
                <td className="px-6 py-4">{v.owner_name}</td>
                <td className="px-6 py-4 text-center flex justify-center gap-4">
                  <button onClick={() => handleEdit(v)} className="text-blue-600 hover:text-blue-700">
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Soft delete this vehicle?')) {
                        fetch(`${API_BASE_URL}/api/v1/masters/vehicles/${v.id}`, { method: 'DELETE' })
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
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle Number *</label>
                <input 
                  name="vehicle_number" 
                  value={form.vehicle_number} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border rounded-2xl" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Short Code</label>
                  <input 
                    name="vehicle_short_code" 
                    value={form.vehicle_short_code} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border rounded-2xl" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Owner Name *</label>
                  <input 
                    name="owner_name" 
                    value={form.owner_name} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border rounded-2xl" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Model Type *</label>
                  <select 
                    name="model_type_id" 
                    value={form.model_type_id} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border rounded-2xl" 
                    required
                  >
                    <option value="">Select Model Type</option>
                    {modelTypes.map(m => (
                      <option key={m.id} value={m.id}>{m.model_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vertical *</label>
                  <select 
                    name="vertical_id" 
                    value={form.vertical_id} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border rounded-2xl" 
                    required
                  >
                    <option value="">Select Vertical</option>
                    {verticals.map(v => (
                      <option key={v.id} value={v.id}>{v.vertical_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ownership</label>
                  <select 
                    name="ownership_type" 
                    value={form.ownership_type} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border rounded-2xl"
                  >
                    <option value="Own">Own</option>
                    <option value="Attached">Attached</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Loaded Mileage (km/l)</label>
                  <input 
                    name="loaded_mileage" 
                    type="number" 
                    step="0.01" 
                    value={form.loaded_mileage} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border rounded-2xl" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Empty Mileage (km/l)</label>
                  <input 
                    name="empty_mileage" 
                    type="number" 
                    step="0.01" 
                    value={form.empty_mileage} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border rounded-2xl" 
                  />
                </div>
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
                  {editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}