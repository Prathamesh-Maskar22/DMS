import React, { useState, useEffect } from 'react';
import { Search, FileText, Truck, Fuel, Calendar, MapPin, User, CheckCircle, Hash, Filter, X, ChevronDown, RefreshCw, Pencil, Check, Package, AlertTriangle, UserCheck, Weight, DollarSign, Clock } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// --- Helper Components ---

const StatusBadge = ({ status }) => {
  const styles = {
    Loaded: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Empty: 'bg-gray-50 text-gray-600 border-gray-100',
  };
  const styleSet = styles[status] || styles.Empty;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styleSet}`}>
      {status === 'Loaded' && <CheckCircle size={10} />}
      {status}
    </span>
  );
};

const TableCell = ({ children, className = "", align = "left" }) => (
  <td className={`px-2 py-2 text-xs text-gray-600 whitespace-nowrap ${align === 'right' ? 'text-right' : ''} ${className}`}>
    {children}
  </td>
);

// --- Searchable Select ---
const SearchableSelect = ({ label, name, value, options, labelKey, valueKey, onChange, icon: Icon, placeholder = "Select", hideLabel = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const currentLabel = options.find(o => String(o[valueKey]) === String(value))?.[labelKey] || '';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.searchable-select-container')) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option[labelKey]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange({ target: { name, value: option[valueKey] } });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative searchable-select-container ${!hideLabel ? 'mt-1' : ''}`}>
      {!hideLabel && <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5 leading-none">{label}</label>}
      <div onClick={() => setIsOpen(!isOpen)} className={`w-full px-2 py-1 border rounded cursor-pointer bg-white flex items-center justify-between transition-all text-xs ${isOpen ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-blue-300 hover:border-blue-400'}`}>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {Icon && <Icon size={11} className="text-gray-400 flex-shrink-0" />}
          <span className="truncate text-gray-700">{currentLabel || placeholder}</span>
        </div>
        <ChevronDown size={11} className={`transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          <div className="p-1.5 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-2 text-gray-400" />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-7 pr-2 py-1 bg-gray-50 border border-gray-200 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
            </div>
          </div>
          <div className="py-1">
            {filteredOptions.length === 0 ? <div className="px-3 py-2 text-[10px] text-gray-500 text-center">No results found</div> : filteredOptions.map((option) => (
              <div key={option[valueKey]} onClick={() => handleSelect(option)} className="px-2 py-1.5 text-[10px] text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors truncate">{option[labelKey]}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AllEntries = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Masters State
  const [masters, setMasters] = useState({
    vehicles: [], drivers: [], cities: [], pumps: [],
    customers: [], extraRemarks: [], approvers: [], routes: []
  });

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/entries`);
        const json = await res.json();
        if (json.success) {
          setEntries(json.data);
          setVehicles([...new Set(json.data.map(i => i.vehicle?.vehicle_number).filter(Boolean))]);
          setDrivers([...new Set(json.data.map(i => i.driver?.driver_name).filter(Boolean))]);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };

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
        const responses = await Promise.all(endpoints.map(e => fetch(`${API_BASE_URL}${e.url}`)));
        const data = await Promise.all(responses.map(res => res.json()));
        setMasters({
          vehicles: data[0].data || [], drivers: data[1].data || [],
          cities: data[2].data || [], pumps: data[3].data || [],
          customers: data[4].data || [], extraRemarks: data[5].data || [],
          approvers: data[6].data || [], routes: data[7].data || [],
        });
      } catch (err) { console.error(err); }
    };
    fetchEntries();
    fetchMasters();
  }, []);

  const filteredEntries = entries.filter((entry) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      entry.transaction_id?.toLowerCase().includes(term) ||
      entry.vehicle?.vehicle_number?.toLowerCase().includes(term) ||
      entry.invoice_number?.toLowerCase().includes(term) ||
      entry.driver?.driver_name?.toLowerCase().includes(term) ||
      entry.customer?.customer_name?.toLowerCase().includes(term) ||
      entry.fromCity?.city_name?.toLowerCase().includes(term) ||
      entry.toCity?.city_name?.toLowerCase().includes(term);
    
    let matchesDate = true;
    if (fromDate && entry.entry_date) {
      if (new Date(entry.entry_date) < new Date(fromDate)) matchesDate = false;
    }
    if (toDate && entry.entry_date) {
      if (new Date(entry.entry_date) > new Date(toDate)) matchesDate = false;
    }
    return matchesSearch && matchesDate && 
      (!selectedVehicle || entry.vehicle?.vehicle_number === selectedVehicle) &&
      (!selectedDriver || entry.driver?.driver_name === selectedDriver) &&
      (!selectedStatus || entry.trip_status === selectedStatus);
  });

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  // Check if it is a valid date string (e.g., "2026-04-16")
  // If it is already empty string or just "Invalid", don't return it.
  if (dateString.trim() === '' || dateString === 'Invalid Date') return '';

  try {
    // Try to parse it to ensure it's valid
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return dateString.split('T')[0]; 
  } catch (e) {
    return '';
  }
};

const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const d = new Date(timeString);
      return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    } catch { return ''; }
  };

  const resetFilters = () => {
    setSearchTerm(''); setFromDate(''); setToDate('');
    setSelectedVehicle(''); setSelectedDriver(''); setSelectedStatus('');
  };

  const ITEMS_PER_PAGE = 50;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const displayedEntries = filteredEntries.slice(0, visibleCount);
  const hasMoreEntries = filteredEntries.length > visibleCount;

  // --- Edit Logic ---
  const handleEditClick = (entry) => {
    setEditingId(entry.id);
    setEditForm({
      // Basic Info
      id: entry.id,
      transaction_id: entry.transaction_id || '',
      entry_date: formatDate(entry.entry_date),
      invoice_time: formatTime(entry.invoice_time),
      invoice_number: entry.invoice_number || '',
      material_type: entry.material_type || '',
      
      // Relations
      vehicle_number: entry.vehicle?.vehicle_number || '',
      driver_name: entry.driver?.driver_name || '',
      customer_name: entry.customer?.customer_name || '',
      route_code: entry.route?.route_code || '',
      from_city_name: entry.fromCity?.city_name || '',
      to_city_name: entry.toCity?.city_name || '',
      pump_name: entry.pump?.pump_name || '',
      extra_remark_text: entry.extraRemark?.remark_text || '',
      approver_name: entry.approver?.approver_name || '',
      
      // Numbers
      km: entry.km || '',
      loading_weight: entry.loading_weight || '',
      trip_advance_amount: entry.trip_advance_amount || '',
      fooding_amount: entry.fooding_amount || '',
      loading_unloading_amount: entry.loading_unloading_amount || '',
      kata_charges: entry.kata_charges || '',
      border_charges: entry.border_charges || '',
      misc_charges: entry.misc_charges || '',
      diesel_qty: entry.diesel_qty || '',
      extra_diesel_qty: entry.extra_diesel_qty || 0,
      cut_diesel_qty: entry.cut_diesel_qty || 0,
      
      // Status & Remarks
      trip_status: entry.trip_status,
      is_new_trip: entry.is_new_trip,
      remarks: entry.remarks || '',
      created_by: entry.created_by || ''
    });
  };

  const handleCancelEdit = () => { setEditingId(null); setEditForm({}); };
  const handleFieldChange = (e) => { setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value })); };

  const handleSave = async (id) => {
    setSaving(true);
    try {
      const payload = {
        ...editForm,
        // Convert numbers
        km: Number(editForm.km) || 0,
        loading_weight: Number(editForm.loading_weight) || 0,
        trip_advance_amount: Number(editForm.trip_advance_amount) || 0,
        fooding_amount: Number(editForm.fooding_amount) || 0,
        loading_unloading_amount: Number(editForm.loading_unloading_amount) || 0,
        kata_charges: Number(editForm.kata_charges) || 0,
        border_charges: Number(editForm.border_charges) || 0,
        misc_charges: Number(editForm.misc_charges) || 0,
        diesel_qty: Number(editForm.diesel_qty) || 0,
        extra_diesel_qty: Number(editForm.extra_diesel_qty) || 0,
        cut_diesel_qty: Number(editForm.cut_diesel_qty) || 0,
        is_new_trip: editForm.is_new_trip === 'true' || editForm.is_new_trip === true,
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const r = await fetch(`${API_BASE_URL}/api/v1/entries`);
        const j = await r.json();
        if (j.success) setEntries(j.data);
        setEditingId(null);
      } else { alert('Update failed'); }
    } catch (err) { console.error(err); alert('Network error'); } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen  p-2 font-sans text-[11px]">
      <div className="max-w-full mx-auto space-y-2">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Diesel Logs</h1>
            <p className="text-[10px] text-slate-500">Manage and monitor vehicle fuel entries</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg w-full text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-700'}`}>
              <Filter size={14} /> Filters {(fromDate||toDate||selectedVehicle||selectedDriver||selectedStatus) && <span className="bg-blue-500 text-white rounded-full px-1 text-[8px]">!</span>}
            </button>
          </div>
        </header>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white p-3 rounded-lg border border-slate-200 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="px-2 py-1 border rounded text-xs" placeholder="From" />
            <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="px-2 py-1 border rounded text-xs" placeholder="To" />
            <select value={selectedVehicle} onChange={e=>setSelectedVehicle(e.target.value)} className="px-2 py-1 border rounded text-xs"><option value="">All Vehicles</option>{vehicles.map(v=><option key={v} value={v}>{v}</option>)}</select>
            <select value={selectedDriver} onChange={e=>setSelectedDriver(e.target.value)} className="px-2 py-1 border rounded text-xs"><option value="">All Drivers</option>{drivers.map(d=><option key={d} value={d}>{d}</option>)}</select>
            <select value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)} className="px-2 py-1 border rounded text-xs"><option value="">All Status</option>{['Loaded','Empty'].map(s=><option key={s} value={s}>{s}</option>)}</select>
            <button onClick={resetFilters} className="text-red-500 hover:text-red-700 text-center text-xs font-medium flex items-center justify-center gap-1"><X size={12} /> Clear</button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-160px)] custom-scrollbar">
            <table className="min-w-max text-center border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-[9px] font-bold text-slate-600 uppercase tracking-wide">
                <tr>
                  <th className="px-2 py-2 left-0 sticky bg-slate-50 z-20 border-r border-slate-200" style={{width:'60px'}}>Actions</th>
                  <th style={{width:'70px'}}>Txn ID</th>
                  <th style={{width:'80px'}}>Date</th>
                  <th style={{width:'60px'}}>Time</th>
                  <th style={{width:'90px'}}>Invoice</th>
                  <th style={{width:'70px'}}>Material</th>
                  <th style={{width:'100px'}}>Vehicle</th>
                  <th style={{width:'100px'}}>Driver</th>
                  <th style={{width:'100px'}}>Customer</th>
                  <th style={{width:'90px'}}>Route</th>
                  <th style={{width:'80px'}}>From</th>
                  <th style={{width:'80px'}}>To</th>
                  <th style={{width:'50px'}}>KM</th>
                  <th style={{width:'60px'}}>Weight</th>
                  <th style={{width:'60px'}}>Advance</th>
                  <th style={{width:'50px'}}>Food</th>
                  <th style={{width:'50px'}}>L/U</th>
                  <th style={{width:'50px'}}>Kata</th>
                  <th style={{width:'50px'}}>Border</th>
                  <th style={{width:'50px'}}>Misc</th>
                  <th style={{width:'60px'}}>Diesel</th>
                  <th style={{width:'90px'}}>Pump</th>
                  <th style={{width:'50px'}}>Extra</th>
                  <th style={{width:'90px'}}>Reason</th>
                  <th style={{width:'80px'}}>Approver</th>
                  <th style={{width:'50px'}}>Cut</th>
                  <th style={{width:'70px'}}>Status</th>
                  <th style={{width:'60px'}}>Type</th>
                  <th style={{width:'120px'}}>Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan={30} className="p-10 text-center">Loading...</td></tr> : displayedEntries.length === 0 ? <tr><td colSpan={30} className="p-10 text-center text-slate-400">No records found</td></tr> : displayedEntries.map((entry, i) => {
                  const isEditing = editingId === entry.id;
                  return (
                    <tr key={entry.id} className={`group ${isEditing ? 'bg-blue-50/80' : (i%2===0?'bg-white':'bg-slate-50/30')}`}>
                      <td className="px-2 py-2 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-slate-200 group-hover:bg-transparent">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleSave(entry.id)} disabled={saving} className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"><Check size={12}/></button>
                            <button onClick={handleCancelEdit} className="p-1 bg-red-500 text-white rounded hover:bg-red-600"><X size={12}/></button>
                          </div>
                        ) : (
                          <button onClick={() => handleEditClick(entry)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={12}/></button>
                        )}
                      </td>
                      
                      {/* ID / Txn / Date / Time / Invoice / Mat */}
                      {isEditing ? (
                        <>
                          <TableCell><input name="transaction_id" value={editForm.transaction_id} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs"/></TableCell>
                          <TableCell><input type="date" name="entry_date" value={editForm.entry_date} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs"/></TableCell>
                          <TableCell><input type="time" name="invoice_time" value={editForm.invoice_time} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs"/></TableCell>
                          <TableCell><input name="invoice_number" value={editForm.invoice_number} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs"/></TableCell>
                          <TableCell><input name="material_type" value={editForm.material_type} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs"/></TableCell>
                          
                          {/* Relations: Veh, Drv, Cust, Rt, Fr, To */}
                          <TableCell><SearchableSelect name="vehicle_number" value={editForm.vehicle_number} options={masters.vehicles} labelKey="vehicle_number" valueKey="vehicle_number" onChange={handleFieldChange} icon={Truck} placeholder="Veh" hideLabel/></TableCell>
                          <TableCell><SearchableSelect name="driver_name" value={editForm.driver_name} options={masters.drivers} labelKey="driver_name" valueKey="driver_name" onChange={handleFieldChange} icon={User} placeholder="Drv" hideLabel/></TableCell>
                          <TableCell><SearchableSelect name="customer_name" value={editForm.customer_name} options={masters.customers} labelKey="customer_name" valueKey="customer_name" onChange={handleFieldChange} icon={Package} placeholder="Cust" hideLabel/></TableCell>
                          <TableCell><SearchableSelect name="route_code" value={editForm.route_code} options={masters.routes} labelKey="route_code" valueKey="route_code" onChange={handleFieldChange} icon={MapPin} placeholder="Rt" hideLabel/></TableCell>
                          <TableCell><SearchableSelect name="from_city_name" value={editForm.from_city_name} options={masters.cities} labelKey="city_name" valueKey="city_name" onChange={handleFieldChange} icon={MapPin} placeholder="Fr" hideLabel/></TableCell>
                          <TableCell><SearchableSelect name="to_city_name" value={editForm.to_city_name} options={masters.cities} labelKey="city_name" valueKey="city_name" onChange={handleFieldChange} icon={MapPin} placeholder="To" hideLabel/></TableCell>
                          
                          {/* Numbers */}
                          <TableCell><input name="km" type="number" value={editForm.km} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs text-right"/></TableCell>
                          <TableCell><input name="loading_weight" type="number" value={editForm.loading_weight} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs text-right"/></TableCell>
                          <TableCell><input name="trip_advance_amount" type="number" value={editForm.trip_advance_amount} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs text-right"/></TableCell>
                          <TableCell><input name="fooding_amount" type="number" value={editForm.fooding_amount} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs text-right"/></TableCell>
                          <TableCell><input name="loading_unloading_amount" type="number" value={editForm.loading_unloading_amount} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs text-right"/></TableCell>
                          <TableCell><input name="kata_charges" type="number" value={editForm.kata_charges} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs text-right"/></TableCell>
                          <TableCell><input name="border_charges" type="number" value={editForm.border_charges} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs text-right"/></TableCell>
                          <TableCell><input name="misc_charges" type="number" value={editForm.misc_charges} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs text-right"/></TableCell>
                          
                          {/* Diesel */}
                          <TableCell><input name="diesel_qty" type="number" value={editForm.diesel_qty} onChange={handleFieldChange} className="w-full border-blue-300 rounded px-1 text-xs text-right font-bold text-blue-700"/></TableCell>
                          <TableCell><SearchableSelect name="pump_name" value={editForm.pump_name} options={masters.pumps} labelKey="pump_name" valueKey="pump_name" onChange={handleFieldChange} placeholder="Pump" hideLabel/></TableCell>
                          
                          <TableCell><input name="extra_diesel_qty" type="number" value={editForm.extra_diesel_qty} onChange={handleFieldChange} className="w-full border-blue-300 rounded px-1 text-xs text-right text-orange-600"/></TableCell>
                          <TableCell><SearchableSelect name="extra_remark_text" value={editForm.extra_remark_text} options={masters.extraRemarks} labelKey="remark_text" valueKey="remark_text" onChange={handleFieldChange} icon={AlertTriangle} placeholder="Rsn" hideLabel/></TableCell>
                          <TableCell><SearchableSelect name="approver_name" value={editForm.approver_name} options={masters.approvers} labelKey="approver_name" valueKey="approver_name" onChange={handleFieldChange} icon={UserCheck} placeholder="App" hideLabel/></TableCell>
                          
                          <TableCell><input name="cut_diesel_qty" type="number" value={editForm.cut_diesel_qty} onChange={handleFieldChange} className="w-full border-blue-300 rounded px-1 text-xs text-right text-red-600"/></TableCell>
                          
                          {/* Status */}
                          <TableCell>
                            <select name="trip_status" value={editForm.trip_status} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs bg-white">
                              <option value="Loaded">Loaded</option>
                              <option value="Empty">Empty</option>
                            </select>
                          </TableCell>
                          <TableCell>
                             <select name="is_new_trip" value={String(editForm.is_new_trip)} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs bg-white">
                              <option value="true">New</option>
                              <option value="false">Past</option>
                            </select>
                          </TableCell>
                          <TableCell><input name="remarks" value={editForm.remarks} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs"/></TableCell>
                        </>
                      ) : (
                        /* View Mode */
                        <>
                          <TableCell className="font-mono text-blue-600">{entry.transaction_id||'-'}</TableCell>
                          <TableCell>{formatDate(entry.entry_date)}</TableCell>
                          <TableCell className="text-slate-400 font-mono">{formatTime(entry.invoice_time)}</TableCell>
                          <TableCell className="font-medium text-blue-600">{entry.invoice_number||'-'}</TableCell>
                          <TableCell>{entry.material_type||'-'}</TableCell>
                          
                          <TableCell className="font-medium text-slate-700">{entry.vehicle?.vehicle_number}</TableCell>
                          <TableCell>{entry.driver?.driver_name}</TableCell>
                          <TableCell>{entry.customer?.customer_name}</TableCell>
                          <TableCell className="text-slate-400 text-[10px]">{entry.route?.route_code||'-'}</TableCell>
                          <TableCell>{entry.fromCity?.city_name}</TableCell>
                          <TableCell>{entry.toCity?.city_name}</TableCell>
                          
                          <TableCell align="right">{entry.km||'-'}</TableCell>
                          <TableCell align="right">{entry.loading_weight||'-'}</TableCell>
                          <TableCell align="right">{entry.trip_advance_amount||'-'}</TableCell>
                          <TableCell align="right">{entry.fooding_amount||'-'}</TableCell>
                          <TableCell align="right">{entry.loading_unloading_amount||'-'}</TableCell>
                          <TableCell align="right">{entry.kata_charges||'-'}</TableCell>
                          <TableCell align="right">{entry.border_charges||'-'}</TableCell>
                          <TableCell align="right">{entry.misc_charges||'-'}</TableCell>
                          
                          <TableCell align="right" className="font-semibold text-slate-800">{entry.diesel_qty}</TableCell>
                          <TableCell>{entry.pump?.pump_name}</TableCell>
                          
                          <TableCell align="right" className="text-orange-600">{entry.extra_diesel_qty||0}</TableCell>
                          <TableCell className="text-[10px] text-slate-500 truncate max-w-[80px]" title={entry.extraRemark?.remark_text}>{entry.extraRemark?.remark_text||'-'}</TableCell>
                          <TableCell>{entry.approver?.approver_name}</TableCell>
                          
                          <TableCell align="right" className="text-red-600 font-medium">{entry.cut_diesel_qty > 0 ? `-${entry.cut_diesel_qty}` : entry.cut_diesel_qty}</TableCell>
                          
                          <TableCell><StatusBadge status={entry.trip_status}/></TableCell>
                          <TableCell>{entry.is_new_trip ? <span className="text-blue-600">New</span> : <span className="text-gray-400">Past</span>}</TableCell>
                          <TableCell className="truncate italic max-w-[100px]" title={entry.remarks}>{entry.remarks||'-'}</TableCell>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && hasMoreEntries && !editingId && (
            <div className="p-2 border-t border-slate-200 bg-white sticky bottom-0 z-10 text-center">
              <button onClick={() => setVisibleCount(p => p + ITEMS_PER_PAGE)} className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded border border-blue-200 font-medium">Load More</button>
            </div>
          )}
        </div>
      </div>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width:6px; height:6px; } .custom-scrollbar::-webkit-scrollbar-track { background:transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:3px; }`}</style>
    </div>
  );
};

export default AllEntries;

// This code is with pagination and edit-in-place features. It allows users to view, search, filter, and edit diesel log entries in a tabular format. The SearchableSelect component is used for selecting related entities like vehicles, drivers, etc. The StatusBadge component visually indicates the trip status. The table supports loading more entries with pagination and has a responsive design for better usability. The edit functionality allows users to modify entry details directly in the table, with proper handling of related entities and numeric fields. The filters enable users to narrow down entries based on date range, vehicle, driver, and status. 

// import React, { useState, useEffect } from 'react';
// import { Search, FileText, Truck, Fuel, Calendar, MapPin, User, CheckCircle, Hash, Filter, X, ChevronDown, RefreshCw, Pencil, Check, Package, AlertTriangle, UserCheck, Weight, DollarSign, Clock } from 'lucide-react';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// // --- Helper Components ---

// const StatusBadge = ({ status }) => {
//   const styles = {
//     Loaded: 'bg-emerald-50 text-emerald-700 border-emerald-100',
//     Empty: 'bg-gray-50 text-gray-600 border-gray-100',
//   };
//   const styleSet = styles[status] || styles.Empty;
//   return (
//     <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styleSet}`}>
//       {status === 'Loaded' && <CheckCircle size={10} />}
//       {status}
//     </span>
//   );
// };

// const TableCell = ({ children, className = "", align = "left" }) => (
//   <td className={`px-2 py-2 text-xs text-gray-600 whitespace-nowrap ${align === 'right' ? 'text-right' : ''} ${className}`}>
//     {children}
//   </td>
// );

// // --- Searchable Select ---
// const SearchableSelect = ({ label, name, value, options, labelKey, valueKey, onChange, icon: Icon, placeholder = "Select", hideLabel = false }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const currentLabel = options.find(o => String(o[valueKey]) === String(value))?.[labelKey] || '';

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (!event.target.closest('.searchable-select-container')) setIsOpen(false);
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const filteredOptions = options.filter(option =>
//     option[labelKey]?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleSelect = (option) => {
//     onChange({ target: { name, value: option[valueKey] } });
//     setIsOpen(false);
//     setSearchTerm('');
//   };

//   return (
//     <div className={`relative searchable-select-container ${!hideLabel ? 'mt-1' : ''}`}>
//       {!hideLabel && <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5 leading-none">{label}</label>}
//       <div onClick={() => setIsOpen(!isOpen)} className={`w-full px-2 py-1 border rounded cursor-pointer bg-white flex items-center justify-between transition-all text-xs ${isOpen ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-blue-300 hover:border-blue-400'}`}>
//         <div className="flex items-center gap-1.5 flex-1 min-w-0">
//           {Icon && <Icon size={11} className="text-gray-400 flex-shrink-0" />}
//           <span className="truncate text-gray-700">{currentLabel || placeholder}</span>
//         </div>
//         <ChevronDown size={11} className={`transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
//       </div>
//       {isOpen && (
//         <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
//           <div className="p-1.5 border-b border-gray-100 sticky top-0 bg-white z-10">
//             <div className="relative">
//               <Search size={11} className="absolute left-2.5 top-2 text-gray-400" />
//               <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-7 pr-2 py-1 bg-gray-50 border border-gray-200 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500/20" />
//             </div>
//           </div>
//           <div className="py-1">
//             {filteredOptions.length === 0 ? <div className="px-3 py-2 text-[10px] text-gray-500 text-center">No results found</div> : filteredOptions.map((option) => (
//               <div key={option[valueKey]} onClick={() => handleSelect(option)} className="px-2 py-1.5 text-[10px] text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors truncate">{option[labelKey]}</div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const AllEntries = () => {
//   const [entries, setEntries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   // Masters State
//   const [masters, setMasters] = useState({
//     vehicles: [], drivers: [], cities: [], pumps: [],
//     customers: [], extraRemarks: [], approvers: [], routes: []
//   });

//   // Edit State
//   const [editingId, setEditingId] = useState(null);
//   const [editForm, setEditForm] = useState({});
//   const [saving, setSaving] = useState(false);

//   // Filter states
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');
//   const [selectedVehicle, setSelectedVehicle] = useState('');
//   const [selectedDriver, setSelectedDriver] = useState('');
//   const [selectedStatus, setSelectedStatus] = useState('');

//   const [vehicles, setVehicles] = useState([]);
//   const [drivers, setDrivers] = useState([]);

//   useEffect(() => {
//     const fetchEntries = async (pageNumber = 1) => {
//       setLoading(true);
//       try {
//         const res = await fetch(`${API_BASE_URL}/api/v1/entries?page=${pageNumber}&limit=100`);
//         const json = await res.json();

//         if (json.success) {
//           setEntries(json.data);
//           setPage(json.pagination.page);
//           setTotalPages(json.pagination.totalPages);

//           // Filters data
//           setVehicles([...new Set(json.data.map(i => i.vehicle?.vehicle_number).filter(Boolean))]);
//           setDrivers([...new Set(json.data.map(i => i.driver?.driver_name).filter(Boolean))]);
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const fetchMasters = async () => {
//       try {
//         const endpoints = [
//           { key: 'vehicles', url: '/api/v1/masters/vehicles' },
//           { key: 'drivers', url: '/api/v1/masters/drivers' },
//           { key: 'cities', url: '/api/v1/masters/cities' },
//           { key: 'pumps', url: '/api/v1/masters/pumps' },
//           { key: 'customers', url: '/api/v1/masters/customers' },
//           { key: 'extraRemarks', url: '/api/v1/masters/extra-remarks' },
//           { key: 'approvers', url: '/api/v1/masters/approvers' },
//           { key: 'routes', url: '/api/v1/masters/routes' },
//         ];
//         const responses = await Promise.all(endpoints.map(e => fetch(`${API_BASE_URL}${e.url}`)));
//         const data = await Promise.all(responses.map(res => res.json()));
//         setMasters({
//           vehicles: data[0].data || [], drivers: data[1].data || [],
//           cities: data[2].data || [], pumps: data[3].data || [],
//           customers: data[4].data || [], extraRemarks: data[5].data || [],
//           approvers: data[6].data || [], routes: data[7].data || [],
//         });
//       } catch (err) { console.error(err); }
//     };
//     fetchEntries(1);
//     fetchMasters();
//   }, []);

//   const filteredEntries = entries.filter((entry) => {
//     const term = searchTerm.toLowerCase();
//     const matchesSearch =
//       entry.transaction_id?.toLowerCase().includes(term) ||
//       entry.vehicle?.vehicle_number?.toLowerCase().includes(term) ||
//       entry.invoice_number?.toLowerCase().includes(term) ||
//       entry.driver?.driver_name?.toLowerCase().includes(term) ||
//       entry.customer?.customer_name?.toLowerCase().includes(term) ||
//       entry.fromCity?.city_name?.toLowerCase().includes(term) ||
//       entry.toCity?.city_name?.toLowerCase().includes(term);

//     let matchesDate = true;
//     if (fromDate && entry.entry_date) {
//       if (new Date(entry.entry_date) < new Date(fromDate)) matchesDate = false;
//     }
//     if (toDate && entry.entry_date) {
//       if (new Date(entry.entry_date) > new Date(toDate)) matchesDate = false;
//     }
//     return matchesSearch && matchesDate &&
//       (!selectedVehicle || entry.vehicle?.vehicle_number === selectedVehicle) &&
//       (!selectedDriver || entry.driver?.driver_name === selectedDriver) &&
//       (!selectedStatus || entry.trip_status === selectedStatus);
//   });

//   const formatDate = (dateString) => {
//     if (!dateString) return '';

//     // Check if it is a valid date string (e.g., "2026-04-16")
//     // If it is already empty string or just "Invalid", don't return it.
//     if (dateString.trim() === '' || dateString === 'Invalid Date') return '';

//     try {
//       // Try to parse it to ensure it's valid
//       const d = new Date(dateString);
//       if (isNaN(d.getTime())) return '';
//       return dateString.split('T')[0];
//     } catch (e) {
//       return '';
//     }
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return '';
//     try {
//       const d = new Date(timeString);
//       return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
//     } catch { return ''; }
//   };

//   const resetFilters = () => {
//     setSearchTerm(''); setFromDate(''); setToDate('');
//     setSelectedVehicle(''); setSelectedDriver(''); setSelectedStatus('');
//   };

//   const displayedEntries = filteredEntries;
//   // --- Edit Logic ---
//   const handleEditClick = (entry) => {
//     setEditingId(entry.id);
//     setEditForm({
//       // Basic Info
//       id: entry.id,
//       transaction_id: entry.transaction_id || '',
//       entry_date: formatDate(entry.entry_date),
//       invoice_time: formatTime(entry.invoice_time),
//       invoice_number: entry.invoice_number || '',
//       material_type: entry.material_type || '',

//       // Relations
//       vehicle_number: entry.vehicle?.vehicle_number || '',
//       driver_name: entry.driver?.driver_name || '',
//       customer_name: entry.customer?.customer_name || '',
//       route_code: entry.route?.route_code || '',
//       from_city_name: entry.fromCity?.city_name || '',
//       to_city_name: entry.toCity?.city_name || '',
//       pump_name: entry.pump?.pump_name || '',
//       extra_remark_text: entry.extraRemark?.remark_text || '',
//       approver_name: entry.approver?.approver_name || '',

//       // Numbers
//       km: entry.km || '',
//       loading_weight: entry.loading_weight || '',
//       trip_advance_amount: entry.trip_advance_amount || '',
//       fooding_amount: entry.fooding_amount || '',
//       loading_unloading_amount: entry.loading_unloading_amount || '',
//       kata_charges: entry.kata_charges || '',
//       border_charges: entry.border_charges || '',
//       misc_charges: entry.misc_charges || '',
//       diesel_qty: entry.diesel_qty || '',
//       extra_diesel_qty: entry.extra_diesel_qty || 0,
//       cut_diesel_qty: entry.cut_diesel_qty || 0,

//       // Status & Remarks
//       trip_status: entry.trip_status,
//       is_new_trip: entry.is_new_trip,
//       remarks: entry.remarks || '',
//       created_by: entry.created_by || ''
//     });
//   };

//   const handleCancelEdit = () => { setEditingId(null); setEditForm({}); };
//   const handleFieldChange = (e) => { setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value })); };

//   const handleSave = async (id) => {
//     setSaving(true);
//     try {
//       const payload = {
//         ...editForm,
//         // Convert numbers
//         km: Number(editForm.km) || 0,
//         loading_weight: Number(editForm.loading_weight) || 0,
//         trip_advance_amount: Number(editForm.trip_advance_amount) || 0,
//         fooding_amount: Number(editForm.fooding_amount) || 0,
//         loading_unloading_amount: Number(editForm.loading_unloading_amount) || 0,
//         kata_charges: Number(editForm.kata_charges) || 0,
//         border_charges: Number(editForm.border_charges) || 0,
//         misc_charges: Number(editForm.misc_charges) || 0,
//         diesel_qty: Number(editForm.diesel_qty) || 0,
//         extra_diesel_qty: Number(editForm.extra_diesel_qty) || 0,
//         cut_diesel_qty: Number(editForm.cut_diesel_qty) || 0,
//         is_new_trip: editForm.is_new_trip === 'true' || editForm.is_new_trip === true,
//       };

//       const res = await fetch(`${API_BASE_URL}/api/v1/entries/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });

//       if (res.ok) {
//         const r = await fetch(`${API_BASE_URL}/api/v1/entries`);
//         const j = await r.json();
//         if (j.success) setEntries(j.data);
//         setEditingId(null);
//       } else { alert('Update failed'); }
//     } catch (err) { console.error(err); alert('Network error'); } finally { setSaving(false); }
//   };

//   return (
//     <div className="min-h-screen  p-2 font-sans text-[11px]">
//       <div className="max-w-full mx-auto space-y-2">
//         {/* Header */}
//         <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
//           <div>
//             <h1 className="text-lg font-bold text-slate-800">Diesel Logs</h1>
//             <p className="text-[10px] text-slate-500">Manage and monitor vehicle fuel entries</p>
//           </div>
//           <div className="flex gap-2 w-full md:w-auto">
//             <div className="relative flex-1 md:w-64">
//               <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
//               <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg w-full text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
//             </div>
//             <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-700'}`}>
//               <Filter size={14} /> Filters {(fromDate || toDate || selectedVehicle || selectedDriver || selectedStatus) && <span className="bg-blue-500 text-white rounded-full px-1 text-[8px]">!</span>}
//             </button>
//           </div>
//         </header>

//         {/* Filters */}
//         {showFilters && (
//           <div className="bg-white p-3 rounded-lg border border-slate-200 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
//             <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="px-2 py-1 border rounded text-xs" placeholder="From" />
//             <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="px-2 py-1 border rounded text-xs" placeholder="To" />
//             <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} className="px-2 py-1 border rounded text-xs"><option value="">All Vehicles</option>{vehicles.map(v => <option key={v} value={v}>{v}</option>)}</select>
//             <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} className="px-2 py-1 border rounded text-xs"><option value="">All Drivers</option>{drivers.map(d => <option key={d} value={d}>{d}</option>)}</select>
//             <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="px-2 py-1 border rounded text-xs"><option value="">All Status</option>{['Loaded', 'Empty'].map(s => <option key={s} value={s}>{s}</option>)}</select>
//             <button onClick={resetFilters} className="text-red-500 hover:text-red-700 text-center text-xs font-medium flex items-center justify-center gap-1"><X size={12} /> Clear</button>
//           </div>
//         )}

//         {/* Table */}
//         <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
//           <div className="overflow-x-auto max-h-[calc(100vh-160px)] custom-scrollbar">
//             <table className="min-w-max text-center border-collapse">
//               <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-[9px] font-bold text-slate-600 uppercase tracking-wide">
//                 <tr>
//                   <th className="px-2 py-2 left-0 sticky bg-slate-50 z-20 border-r border-slate-200" style={{ width: '60px' }}>Actions</th>
//                   <th style={{ width: '70px' }}>Txn ID</th>
//                   <th style={{ width: '80px' }}>Date</th>
//                   <th style={{ width: '60px' }}>Time</th>
//                   <th style={{ width: '90px' }}>Invoice</th>
//                   <th style={{ width: '70px' }}>Material</th>
//                   <th style={{ width: '100px' }}>Vehicle</th>
//                   <th style={{ width: '100px' }}>Driver</th>
//                   <th style={{ width: '100px' }}>Customer</th>
//                   <th style={{ width: '90px' }}>Route</th>
//                   <th style={{ width: '80px' }}>From</th>
//                   <th style={{ width: '80px' }}>To</th>
//                   <th style={{ width: '50px' }}>KM</th>
//                   <th style={{ width: '60px' }}>Weight</th>
//                   <th style={{ width: '60px' }}>Advance</th>
//                   <th style={{ width: '50px' }}>Food</th>
//                   <th style={{ width: '50px' }}>L/U</th>
//                   <th style={{ width: '50px' }}>Kata</th>
//                   <th style={{ width: '50px' }}>Border</th>
//                   <th style={{ width: '50px' }}>Misc</th>
//                   <th style={{ width: '60px' }}>Diesel</th>
//                   <th style={{ width: '90px' }}>Pump</th>
//                   <th style={{ width: '50px' }}>Extra</th>
//                   <th style={{ width: '90px' }}>Reason</th>
//                   <th style={{ width: '80px' }}>Approver</th>
//                   <th style={{ width: '50px' }}>Cut</th>
//                   <th style={{ width: '70px' }}>Status</th>
//                   <th style={{ width: '60px' }}>Type</th>
//                   <th style={{ width: '120px' }}>Remarks</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {loading ? <tr><td colSpan={30} className="p-10 text-center">Loading...</td></tr> : displayedEntries.length === 0 ? <tr><td colSpan={30} className="p-10 text-center text-slate-400">No records found</td></tr> : displayedEntries.map((entry, i) => {
//                   const isEditing = editingId === entry.id;
//                   return (
//                     <tr key={entry.id} className={`group ${isEditing ? 'bg-blue-50/80' : (i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30')}`}>
//                       <td className="px-2 py-2 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-slate-200 group-hover:bg-transparent">
//                         {isEditing ? (
//                           <div className="flex gap-1">
//                             <button onClick={() => handleSave(entry.id)} disabled={saving} className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"><Check size={12} /></button>
//                             <button onClick={handleCancelEdit} className="p-1 bg-red-500 text-white rounded hover:bg-red-600"><X size={12} /></button>
//                           </div>
//                         ) : (
//                           <button onClick={() => handleEditClick(entry)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={12} /></button>
//                         )}
//                       </td>

//                       {/* ID / Txn / Date / Time / Invoice / Mat */}
//                       {isEditing ? (
//                         <>
//                           <TableCell><input name="transaction_id" value={editForm.transaction_id} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs" /></TableCell>
//                           <TableCell><input type="date" name="entry_date" value={editForm.entry_date} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs" /></TableCell>
//                           <TableCell><input type="time" name="invoice_time" value={editForm.invoice_time} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs" /></TableCell>
//                           <TableCell><input name="invoice_number" value={editForm.invoice_number} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs" /></TableCell>
//                           <TableCell><input name="material_type" value={editForm.material_type} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs" /></TableCell>

//                           {/* Relations: Veh, Drv, Cust, Rt, Fr, To */}
//                           <TableCell><SearchableSelect name="vehicle_number" value={editForm.vehicle_number} options={masters.vehicles} labelKey="vehicle_number" valueKey="vehicle_number" onChange={handleFieldChange} icon={Truck} placeholder="Veh" hideLabel /></TableCell>
//                           <TableCell><SearchableSelect name="driver_name" value={editForm.driver_name} options={masters.drivers} labelKey="driver_name" valueKey="driver_name" onChange={handleFieldChange} icon={User} placeholder="Drv" hideLabel /></TableCell>
//                           <TableCell><SearchableSelect name="customer_name" value={editForm.customer_name} options={masters.customers} labelKey="customer_name" valueKey="customer_name" onChange={handleFieldChange} icon={Package} placeholder="Cust" hideLabel /></TableCell>
//                           <TableCell><SearchableSelect name="route_code" value={editForm.route_code} options={masters.routes} labelKey="route_code" valueKey="route_code" onChange={handleFieldChange} icon={MapPin} placeholder="Rt" hideLabel /></TableCell>
//                           <TableCell><SearchableSelect name="from_city_name" value={editForm.from_city_name} options={masters.cities} labelKey="city_name" valueKey="city_name" onChange={handleFieldChange} icon={MapPin} placeholder="Fr" hideLabel /></TableCell>
//                           <TableCell><SearchableSelect name="to_city_name" value={editForm.to_city_name} options={masters.cities} labelKey="city_name" valueKey="city_name" onChange={handleFieldChange} icon={MapPin} placeholder="To" hideLabel /></TableCell>

//                           {/* Numbers */}
//                           <TableCell><input name="km" type="number" value={editForm.km} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs text-right" /></TableCell>
//                           <TableCell><input name="loading_weight" type="number" value={editForm.loading_weight} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs text-right" /></TableCell>
//                           <TableCell><input name="trip_advance_amount" type="number" value={editForm.trip_advance_amount} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs text-right" /></TableCell>
//                           <TableCell><input name="fooding_amount" type="number" value={editForm.fooding_amount} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs text-right" /></TableCell>
//                           <TableCell><input name="loading_unloading_amount" type="number" value={editForm.loading_unloading_amount} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs text-right" /></TableCell>
//                           <TableCell><input name="kata_charges" type="number" value={editForm.kata_charges} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs text-right" /></TableCell>
//                           <TableCell><input name="border_charges" type="number" value={editForm.border_charges} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs text-right" /></TableCell>
//                           <TableCell><input name="misc_charges" type="number" value={editForm.misc_charges} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs text-right" /></TableCell>

//                           {/* Diesel */}
//                           <TableCell><input name="diesel_qty" type="number" value={editForm.diesel_qty} onChange={handleFieldChange} className="w-full border-blue-300 rounded px-1 text-xs text-right font-bold text-blue-700" /></TableCell>
//                           <TableCell><SearchableSelect name="pump_name" value={editForm.pump_name} options={masters.pumps} labelKey="pump_name" valueKey="pump_name" onChange={handleFieldChange} placeholder="Pump" hideLabel /></TableCell>

//                           <TableCell><input name="extra_diesel_qty" type="number" value={editForm.extra_diesel_qty} onChange={handleFieldChange} className="w-full border-blue-300 rounded px-1 text-xs text-right text-orange-600" /></TableCell>
//                           <TableCell><SearchableSelect name="extra_remark_text" value={editForm.extra_remark_text} options={masters.extraRemarks} labelKey="remark_text" valueKey="remark_text" onChange={handleFieldChange} icon={AlertTriangle} placeholder="Rsn" hideLabel /></TableCell>
//                           <TableCell><SearchableSelect name="approver_name" value={editForm.approver_name} options={masters.approvers} labelKey="approver_name" valueKey="approver_name" onChange={handleFieldChange} icon={UserCheck} placeholder="App" hideLabel /></TableCell>

//                           <TableCell><input name="cut_diesel_qty" type="number" value={editForm.cut_diesel_qty} onChange={handleFieldChange} className="w-full border-blue-300 rounded px-1 text-xs text-right text-red-600" /></TableCell>

//                           {/* Status */}
//                           <TableCell>
//                             <select name="trip_status" value={editForm.trip_status} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs bg-white">
//                               <option value="Loaded">Loaded</option>
//                               <option value="Empty">Empty</option>
//                             </select>
//                           </TableCell>
//                           <TableCell>
//                             <select name="is_new_trip" value={String(editForm.is_new_trip)} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs bg-white">
//                               <option value="true">New</option>
//                               <option value="false">Past</option>
//                             </select>
//                           </TableCell>
//                           <TableCell><input name="remarks" value={editForm.remarks} onChange={handleFieldChange} className="w-full border border-blue-300 rounded px-1 text-xs" /></TableCell>
//                         </>
//                       ) : (
//                         /* View Mode */
//                         <>
//                           <TableCell className="font-mono text-blue-600">{entry.transaction_id || '-'}</TableCell>
//                           <TableCell>{formatDate(entry.entry_date)}</TableCell>
//                           <TableCell className="text-slate-400 font-mono">{formatTime(entry.invoice_time)}</TableCell>
//                           <TableCell className="font-medium text-blue-600">{entry.invoice_number || '-'}</TableCell>
//                           <TableCell>{entry.material_type || '-'}</TableCell>

//                           <TableCell className="font-medium text-slate-700">{entry.vehicle?.vehicle_number}</TableCell>
//                           <TableCell>{entry.driver?.driver_name}</TableCell>
//                           <TableCell>{entry.customer?.customer_name}</TableCell>
//                           <TableCell className="text-slate-400 text-[10px]">{entry.route?.route_code || '-'}</TableCell>
//                           <TableCell>{entry.fromCity?.city_name}</TableCell>
//                           <TableCell>{entry.toCity?.city_name}</TableCell>

//                           <TableCell align="right">{entry.km || '-'}</TableCell>
//                           <TableCell align="right">{entry.loading_weight || '-'}</TableCell>
//                           <TableCell align="right">{entry.trip_advance_amount || '-'}</TableCell>
//                           <TableCell align="right">{entry.fooding_amount || '-'}</TableCell>
//                           <TableCell align="right">{entry.loading_unloading_amount || '-'}</TableCell>
//                           <TableCell align="right">{entry.kata_charges || '-'}</TableCell>
//                           <TableCell align="right">{entry.border_charges || '-'}</TableCell>
//                           <TableCell align="right">{entry.misc_charges || '-'}</TableCell>

//                           <TableCell align="right" className="font-semibold text-slate-800">{entry.diesel_qty}</TableCell>
//                           <TableCell>{entry.pump?.pump_name}</TableCell>

//                           <TableCell align="right" className="text-orange-600">{entry.extra_diesel_qty || 0}</TableCell>
//                           <TableCell className="text-[10px] text-slate-500 truncate max-w-[80px]" title={entry.extraRemark?.remark_text}>{entry.extraRemark?.remark_text || '-'}</TableCell>
//                           <TableCell>{entry.approver?.approver_name}</TableCell>

//                           <TableCell align="right" className="text-red-600 font-medium">{entry.cut_diesel_qty > 0 ? `-${entry.cut_diesel_qty}` : entry.cut_diesel_qty}</TableCell>

//                           <TableCell><StatusBadge status={entry.trip_status} /></TableCell>
//                           <TableCell>{entry.is_new_trip ? <span className="text-blue-600">New</span> : <span className="text-gray-400">Past</span>}</TableCell>
//                           <TableCell className="truncate italic max-w-[100px]" title={entry.remarks}>{entry.remarks || '-'}</TableCell>
//                         </>
//                       )}
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//           {!loading  && !editingId && (
//             <div className="p-2 border-t border-slate-200 bg-white sticky bottom-0 z-10 text-center">
//               <div className="flex justify-between items-center p-3 border-t bg-white">
//                 <button
//                   disabled={page === 1}
//                   onClick={() => fetchEntries(page - 1)}
//                   className="px-3 py-1 text-xs border rounded disabled:opacity-50"
//                 >
//                   Previous
//                 </button>

//                 <span className="text-xs text-gray-600">
//                   Page {page} of {totalPages}
//                 </span>

//                 <button
//                   disabled={page === totalPages}
//                   onClick={() => fetchEntries(page + 1)}
//                   className="px-3 py-1 text-xs border rounded disabled:opacity-50"
//                 >
//                   Next
//                 </button>
//               </div>            </div>
//           )}
//         </div>
//       </div>
//       <style>{`.custom-scrollbar::-webkit-scrollbar { width:6px; height:6px; } .custom-scrollbar::-webkit-scrollbar-track { background:transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:3px; }`}</style>
//     </div>
//   );
// };

// export default AllEntries;

