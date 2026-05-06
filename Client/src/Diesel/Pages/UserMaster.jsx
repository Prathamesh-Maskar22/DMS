import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Search, RefreshCw } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function UserMaster() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'operator',
    name: '',
    is_active: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, roleFilter, statusFilter, users]);

  const fetchUsers = async () => {
    const res = await fetch(`${API_BASE_URL}/api/v1/users`);
    const data = await res.json();
    setUsers(data.data || []);
  };

  const applyFilters = () => {
    let data = [...users];

    if (search) {
      data = data.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.name || '').toLowerCase().includes(search.toLowerCase())
      );
    }

    if (roleFilter) {
      data = data.filter(u => u.role === roleFilter);
    }

    if (statusFilter) {
      const isActive = statusFilter === 'active';
      data = data.filter(u => u.is_active === isActive);
    }

    setFilteredUsers(data);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      email: form.email,
      password: form.password,
      role: form.role,
      name: form.name,
      is_active: form.is_active,
    };

    const url = editingUser
      ? `${API_BASE_URL}/api/v1/users/${editingUser.id}`
      : `${API_BASE_URL}/api/v1/users`;

    const method = editingUser ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      fetchUsers();
      setShowModal(false);
      setEditingUser(null);
      setForm({ email: '', password: '', role: 'operator', name: '', is_active: true });
    } else {
      const error = await res.json();
      alert(error.error || 'Failed');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      email: user.email,
      password: '',
      role: user.role,
      name: user.name || '',
      is_active: user.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Deactivate user?')) {
      await fetch(`${API_BASE_URL}/api/v1/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="text-blue-600" /> Users
        </h1>

        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="px-4 py-2 border rounded-xl flex items-center gap-2"
          >
            <RefreshCw size={16} /> Refresh
          </button>

          <button
            onClick={() => { setEditingUser(null); setShowModal(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border flex flex-wrap gap-3 items-center">

        <div className="flex items-center gap-2 border px-3 py-2 rounded-xl w-64">
          <Search size={16} />
          <input
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none w-full text-sm"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border px-3 py-2 rounded-xl text-sm"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="operator">Operator</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded-xl text-sm"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.name || '-'}</td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center flex justify-center gap-3">
                  <button onClick={() => handleEdit(u)} className="text-blue-600">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="text-red-600">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal stays SAME (no change needed) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-lg mx-4 p-8">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? 'Edit User' : 'Add User'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full p-3 border rounded-xl" required />

              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full p-3 border rounded-xl" required={!editingUser} />

              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full p-3 border rounded-xl" />

              <select name="role" value={form.role} onChange={handleChange} className="w-full p-3 border rounded-xl">
                <option value="operator">Operator</option>
                <option value="admin">Admin</option>
              </select>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                Active
              </label>

              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border py-3 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}