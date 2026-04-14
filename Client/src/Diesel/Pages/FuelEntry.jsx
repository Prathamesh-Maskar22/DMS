import React, { useState, useEffect } from 'react';
import { Save, Fuel, Truck, User, MapPin, FileText, Clock, Weight, Scissors } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const FuelEntry = () => {
  const [masters, setMasters] = useState({
    vehicles: [],
    drivers: [],
    cities: [],
    pumps: [],
    customers: [],
    extraRemarks: [],
    approvers: [],
    routes: [],
  });

  const [form, setForm] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    vehicle_id: '',
    driver_id: '',
    from_city_id: '',
    to_city_id: '',
    pump_id: '',
    customer_id: '',
    route_id: '',
    invoice_number: '',
    invoice_time: '',
    material_type: '',
    km: '',
    diesel_qty: '',
    trip_advance_amount: '',
    fooding_amount: '',
    loading_unloading_amount: '',
    extra_diesel_qty: 0,
    extra_diesel_remark_id: '',
    approved_by_id: '',
    cut_diesel_qty: 0,
    loading_weight: '',           // ← New Field
    remarks: '',
    is_new_trip: true,
    trip_status: 'Loaded',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch all masters (unchanged)
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const endpoints = [
          { key: 'vehicles', url: '/api/v1/masters/vehicles' },
          { key: 'drivers', url: '/api/v1/masters/drivers' },
          { key: 'cities', url: '/api/v1/masters/cities' },
          { key: 'pumps', url: '/api/v1/masters/pumps' },
          { key: 'customers', url: '/api/v1/masters/customers' },
          { key: 'extraRemarks', url: '/api/v1/masters/extra-remarks' },
          { key: 'approvers', url: '/api/v1/masters/approvers' },
          { key: 'routes', url: '/api/v1/masters/routes' },
        ];

        const responses = await Promise.all(
          endpoints.map(e => fetch(`${API_BASE_URL}${e.url}`))
        );
        const data = await Promise.all(responses.map(res => res.json()));

        setMasters({
          vehicles: data[0].data || [],
          drivers: data[1].data || [],
          cities: data[2].data || [],
          pumps: data[3].data || [],
          customers: data[4].data || [],
          extraRemarks: data[5].data || [],
          approvers: data[6].data || [],
          routes: data[7].data || [],
        });
      } catch (err) {
        console.error('Failed to load masters', err);
        setMessage({ type: 'error', text: 'Failed to load master data.' });
      }
    };

    fetchMasters();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Computed Pending to Cut
  const pendingToCut = Number(form.extra_diesel_qty || 0) - Number(form.cut_diesel_qty || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        ...form,
        vehicle_id: Number(form.vehicle_id),
        driver_id: Number(form.driver_id),
        route_id: form.route_id ? Number(form.route_id) : undefined,
        customer_id: form.customer_id ? Number(form.customer_id) : undefined,
        from_city_id: form.from_city_id ? Number(form.from_city_id) : undefined,
        to_city_id: form.to_city_id ? Number(form.to_city_id) : undefined,
        pump_id: form.pump_id ? Number(form.pump_id) : undefined,
        extra_diesel_remark_id: form.extra_diesel_remark_id ? Number(form.extra_diesel_remark_id) : undefined,
        approved_by_id: form.approved_by_id ? Number(form.approved_by_id) : undefined,

        km: form.km ? Number(form.km) : undefined,
        diesel_qty: Number(form.diesel_qty),
        trip_advance_amount: Number(form.trip_advance_amount) || 0,
        fooding_amount: Number(form.fooding_amount) || 0,
        loading_unloading_amount: Number(form.loading_unloading_amount) || 0,
        extra_diesel_qty: Number(form.extra_diesel_qty) || 0,
        cut_diesel_qty: Number(form.cut_diesel_qty) || 0,
        loading_weight: form.loading_weight ? Number(form.loading_weight) : undefined,   // ← New
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Diesel entry saved successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save entry' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Helper to get selected names
  const selectedCustomer = masters.customers.find(c => String(c.id) === form.customer_id);
  const selectedApprover = masters.approvers.find(a => String(a.id) === form.approved_by_id);

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      <div className="px-6 py-4 bg-gray-100 border-b border-gray-100">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Fuel className="text-blue-600" /> Vehicle Refueling & Trip Tracking
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN - Existing Fields Kept */}
          <div className="space-y-4 lg:col-span-2">

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button type="button" onClick={() => setForm(p => ({ ...p, is_new_trip: true }))}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${form.is_new_trip ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
                  New Trip
                </button>
                <button type="button" onClick={() => setForm(p => ({ ...p, is_new_trip: false }))}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!form.is_new_trip ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
                  Past Trip
                </button>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button type="button" onClick={() => setForm(p => ({ ...p, trip_status: 'Loaded' }))}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${form.trip_status === 'Loaded' ? 'bg-emerald-600 text-white shadow' : 'text-gray-500'}`}>
                  Loaded
                </button>
                <button type="button" onClick={() => setForm(p => ({ ...p, trip_status: 'Empty' }))}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${form.trip_status === 'Empty' ? 'bg-emerald-600 text-white shadow' : 'text-gray-500'}`}>
                  Empty
                </button>
              </div>
            </div>


            {/* Customer - Made Visible */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer Name</label>
              <select name="customer_id" value={form.customer_id} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500">
                <option value="">Select Customer</option>
                {masters.customers.map(c => (
                  <option key={c.id} value={c.id}>{c.customer_name}</option>
                ))}
              </select>
              {selectedCustomer && (
                <p className="mt-1 text-sm text-emerald-700 font-medium">Selected: {selectedCustomer.customer_name}</p>
              )}
            </div>

            {/* Vehicle & Driver - Existing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vehicle Number</label>
                <div className="relative">
                  <Truck size={18} className="absolute left-3 top-3 text-gray-400" />
                  <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Select Vehicle</option>
                    {masters.vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.vehicle_number} ({v.vehicle_short_code})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Driver</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3 text-gray-400" />
                  <select name="driver_id" value={form.driver_id} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Select Driver</option>
                    {masters.drivers.map(d => <option key={d.id} value={d.id}>{d.driver_name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Cities, Invoice Details, Diesel & KM - All Existing Fields Kept */}
            {/* (Your original cities, invoice, diesel qty, km sections remain exactly as they were) */}
            {/* Cities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">From City</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                  <select name="from_city_id" value={form.from_city_id} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl 
focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
transition-all duration-200 focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                    <option value="">Select From</option>
                    {masters.cities.map(c => <option key={c.id} value={c.id}>{c.city_name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">To City</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                  <select name="to_city_id" value={form.to_city_id} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl 
focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
transition-all duration-200 focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                    <option value="">Select To</option>
                    {masters.cities.map(c => <option key={c.id} value={c.id}>{c.city_name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* === FIX: Invoice Details Section === */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Invoice No <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <FileText size={18} className="absolute left-3 top-2.5 text-gray-400" />
                    <input name="invoice_number" type="text" value={form.invoice_number} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-xl 
focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
transition-all duration-200 focus:ring-2 focus:ring-blue-500" placeholder="INV-001" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time</label>
                  <div className="relative">
                    <Clock size={18} className="absolute left-3 top-2.5 text-gray-400" />
                    <input name="invoice_time" type="time" value={form.invoice_time} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-50 rounded-xl 
focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
transition-all duration-200 focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Material</label>
                  <input name="material_type" type="text" value={form.material_type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl 
focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
transition-all duration-200 focus:ring-2 focus:ring-blue-500" placeholder="e.g. Cement" />
                </div>
              </div>
            </div>

            {/* Diesel & KM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Diesel Qty (L)</label>
                <div className="relative">
                  <Fuel size={18} className="absolute left-3 top-3 text-blue-500" />
                  <input name="diesel_qty" type="number" step="0.01" value={form.diesel_qty} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-blue-200 bg-blue-50 rounded-xl 
focus:ring-2 focus:ring-blue-500 font-semibold text-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-blue-700" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">KM</label>
                <input name="km" type="number" value={form.km} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl 
focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
transition-all duration-200 focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            {/* NEW: Loading Weight */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-2">
                <Weight size={16} className="text-gray-500" /> Loading Weight (Kg / Ton)
              </label>
              <input
                name="loading_weight"
                type="number"
                step="0.01"
                value={form.loading_weight}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 25.50"
              />
            </div>
          </div>

          {/* RIGHT COLUMN - Existing + New Fields */}
          <div className="space-y-4">

            {/* Route, Pump, Financials - Existing (kept as-is) */}

            {/* Route & Pump */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Route</label>
              <select name="route_id" value={form.route_id} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl 
focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select Route</option>
                {masters.routes.map(r => (
                  <option key={r.id} value={r.id}>{r.route_code} - {r.fromCity?.city_name} to {r.toCity?.city_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pump</label>
              <select name="pump_id" value={form.pump_id} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl 
focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select Pump</option>
                {masters.pumps.map(p => <option key={p.id} value={p.id}>{p.pump_name}</option>)}
              </select>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Financials</label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600">Trip Advance (₹)</label>
                  <input name="trip_advance_amount" type="number" value={form.trip_advance_amount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl 
focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
transition-all duration-200" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600">Fooding</label>
                    <input name="fooding_amount" type="number" value={form.fooding_amount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl 
focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
transition-all duration-200" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">L/U</label>
                    <input name="loading_unloading_amount" type="number" value={form.loading_unloading_amount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl 
focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
transition-all duration-200" />
                  </div>
                </div>
              </div>
            </div>
            {/* Extra Diesel - Existing + Approver Name Display */}
            <div className="border-t border-gray-100 pt-4">
              <label className="block text-xs font-bold text-orange-600 uppercase mb-2">Extra Diesel</label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600">Extra Qty (L)</label>
                  <input name="extra_diesel_qty" type="number" step="0.01" value={form.extra_diesel_qty}
                    onChange={handleChange} className="w-full px-3 py-2 border border-orange-200 rounded-xl focus:ring-orange-500" />
                </div>

                {Number(form.extra_diesel_qty) > 0 && (
                  <div className="mt-3 space-y-2">
                    <select name="extra_diesel_remark_id" value={form.extra_diesel_remark_id} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl text-sm">
                      <option value="">Select Reason</option>
                      {masters.extraRemarks.map(r => <option key={r.id} value={r.id}>{r.remark_text}</option>)}
                    </select>

                    <select name="approved_by_id" value={form.approved_by_id} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl text-sm">
                      <option value="">Select Approver</option>
                      {masters.approvers.map(a => <option key={a.id} value={a.id}>{a.approver_name}</option>)}
                    </select>

                    {/* Extra DSL Approver Name - Display Only */}
                    {selectedApprover && (
                      <div className="text-sm bg-orange-50 border border-orange-100 p-3 rounded-xl">
                        <span className="font-medium text-orange-700">Approved By: </span>
                        <span className="font-semibold">{selectedApprover.approver_name}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* NEW: Cutting Diesel Section */}
            <div className="border-t border-gray-100 pt-4">
              <label className="block text-xs font-bold text-red-600 uppercase mb-2 flex items-center gap-2">
                <Scissors size={16} /> Cutting Diesel
              </label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600">Cutting DSL Qty (L)</label>
                  <input name="cut_diesel_qty" type="number" step="0.01" value={form.cut_diesel_qty}
                    onChange={handleChange} className="w-full px-3 py-2 border border-red-200 rounded-xl focus:ring-red-500" />
                </div>

                {/* Pending DSL to Cut - Disabled Field */}
                <div>
                  <label className="text-xs text-gray-600">Pending DSL Qty to Cut (L)</label>
                  <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-700 font-semibold text-lg">
                    {pendingToCut.toFixed(2)} L
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks - Existing */}
            <div className="border-t border-gray-100 pt-4">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Remarks</label>
              <textarea name="remarks" value={form.remarks} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl h-20 text-sm resize-none"
                placeholder="Add notes..." />
            </div>
          </div>
        </div>

        {/* Footer - Existing */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            {message.text && (
              <div className={`px-4 py-2 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message.text}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-white font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md flex items-center gap-2 disabled:opacity-50">
              <Save size={18} /> {loading ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FuelEntry;
