// src/Diesel/Pages/ApproverMaster.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserCheck } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function ApproverMaster() {
  const [approvers, setApprovers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({ approver_name: '' });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/masters/approvers`).then(r => r.json()).then(res => setApprovers(res.data || []));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editing ? `${API_BASE_URL}/api/v1/masters/approvers/${editing.id}` : `${API_BASE_URL}/api/v1/masters/approvers`;
    const method = editing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const listRes = await fetch(`${API_BASE_URL}/api/v1/masters/approvers`);
      const listData = await listRes.json();
      setApprovers(listData.data || []);
      setShowModal(false);
      setEditing(null);
      setForm({ approver_name: '' });
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({ approver_name: item.approver_name });
    setShowModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <UserCheck className="text-blue-600" /> Extra Diesel Approvers
        </h1>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-medium">
          <Plus size={20} /> Add New Approver
        </button>
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50"><tr><th className="px-6 py-4 text-left">Approver Name</th><th className="px-6 py-4 text-center">Actions</th></tr></thead>
          <tbody className="divide-y">
            {approvers.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{a.approver_name}</td>
                <td className="px-6 py-4 text-center flex justify-center gap-4">
                  <button onClick={() => handleEdit(a)} className="text-blue-600"><Edit2 size={18} /></button>
                  <button onClick={() => { if (confirm('Delete?')) fetch(`${API_BASE_URL}/api/v1/masters/approvers/${a.id}`, { method: 'DELETE' }).then(() => window.location.reload()); }} className="text-red-600"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-lg mx-4 p-8">
            <h2 className="text-2xl font-bold mb-6">{editing ? 'Edit Approver' : 'Add New Approver'}</h2>
            <form onSubmit={handleSubmit}>
              <input name="approver_name" value={form.approver_name} onChange={handleChange} className="w-full px-4 py-3 border rounded-2xl" placeholder="Approver Name" required />
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 border rounded-2xl">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-semibold">{editing ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}