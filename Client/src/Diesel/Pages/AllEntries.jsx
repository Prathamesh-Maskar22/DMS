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

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};  const formatTime = (timeString) => {
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

// import React, { useState, useEffect } from 'react';
// import { Search, FileText, Truck, Fuel, Calendar, MapPin, User, AlertCircle, CheckCircle, Hash, Filter, X, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// // --- Helper Components ---

// const StatusBadge = ({ status, type = 'trip' }) => {
//   const styles = {
//     trip: {
//       Loaded: 'bg-emerald-50 text-emerald-700 border-emerald-100',
//       Empty: 'bg-gray-50 text-gray-600 border-gray-100',
//       default: 'bg-gray-50 text-gray-600 border-gray-100'
//     },
//     isNew: {
//       true: 'bg-blue-50 text-blue-700 border-blue-100',
//       false: 'bg-gray-50 text-gray-500 border-gray-100'
//     }
//   };

//   const styleSet = type === 'trip' ? styles.trip[status] || styles.trip.default : styles.isNew[status];

//   return (
//     <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styleSet}`}>
//       {type === 'trip' && status === 'Loaded' && <CheckCircle size={10} />}
//       {status}
//     </span>
//   );
// };

// const TableCell = ({ children, className = "", align = "left" }) => (
//   <td className={`px-3 py-2 text-xs text-gray-600 whitespace-nowrap ${align === 'right' ? 'text-right' : ''} ${className}`}>
//     {children}
//   </td>
// );

// const AllEntries = () => {
//   const [entries, setEntries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
  
//   // Lazy Loading State
//   const ITEMS_PER_PAGE = 50;
//   const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

//   // Filter states
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');
//   const [selectedVehicle, setSelectedVehicle] = useState('');
//   const [selectedDriver, setSelectedDriver] = useState('');
//   const [selectedPump, setSelectedPump] = useState('');
//   const [selectedStatus, setSelectedStatus] = useState('');
  
//   // Unique values for filters
//   const [vehicles, setVehicles] = useState([]);
//   const [drivers, setDrivers] = useState([]);
//   const [pumps, setPumps] = useState([]);

//   useEffect(() => {
//     const fetchEntries = async () => {
//       try {
//         const res = await fetch(`${API_BASE_URL}/api/v1/entries`);
//         const json = await res.json();
//         if (json.success) {
//           setEntries(json.data);
          
//           // Extract unique values for filters
//           const uniqueVehicles = [...new Set(json.data.map(item => item.vehicle?.vehicle_number).filter(Boolean))];
//           const uniqueDrivers = [...new Set(json.data.map(item => item.driver?.driver_name).filter(Boolean))];
//           const uniquePumps = [...new Set(json.data.map(item => item.pump?.pump_name).filter(Boolean))];
          
//           setVehicles(uniqueVehicles);
//           setDrivers(uniqueDrivers);
//           setPumps(uniquePumps);
//         }
//       } catch (err) {
//         console.error('Failed to fetch entries', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchEntries();
//   }, []);

//   const filteredEntries = entries.filter((entry) => {
//     const term = searchTerm.toLowerCase();
//     const matchesSearch = 
//       entry.transaction_id?.toLowerCase().includes(term) ||
//       entry.vehicle?.vehicle_number?.toLowerCase().includes(term) ||
//       entry.invoice_number?.toLowerCase().includes(term) ||
//       entry.driver?.driver_name?.toLowerCase().includes(term) ||
//       entry.fromCity?.city_name?.toLowerCase().includes(term) ||
//       entry.toCity?.city_name?.toLowerCase().includes(term);

//     // Date range filter
//     let matchesDate = true;
//     if (fromDate && entry.entry_date) {
//       const entryDate = new Date(entry.entry_date);
//       const startDate = new Date(fromDate);
//       startDate.setHours(0, 0, 0);
//       if (entryDate < startDate) matchesDate = false;
//     }
//     if (toDate && entry.entry_date) {
//       const entryDate = new Date(entry.entry_date);
//       const endDate = new Date(toDate);
//       endDate.setHours(23, 59, 59);
//       if (entryDate > endDate) matchesDate = false;
//     }

//     // Vehicle filter
//     const matchesVehicle = !selectedVehicle || entry.vehicle?.vehicle_number === selectedVehicle;
    
//     // Driver filter
//     const matchesDriver = !selectedDriver || entry.driver?.driver_name === selectedDriver;
    
//     // Pump filter
//     const matchesPump = !selectedPump || entry.pump?.pump_name === selectedPump;
    
//     // Status filter
//     const matchesStatus = !selectedStatus || entry.trip_status === selectedStatus;

//     return matchesSearch && matchesDate && matchesVehicle && matchesDriver && matchesPump && matchesStatus;
//   });

//   // Updated: Date format to include Year (e.g., 21 Apr 25)
//   const formatDate = (dateString) => {
//     if (!dateString) return '-';
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: '2-digit' // Added Year
//     });
//   };

//   // Updated: Time format to handle Date strings (1970-01-01T...)
//   const formatTime = (timeString) => {
//     if (!timeString) return '-';
//     try {
//       const date = new Date(timeString);
//       if (isNaN(date.getTime())) return '-';
      
//       const hours = date.getHours().toString().padStart(2, '0');
//       const minutes = date.getMinutes().toString().padStart(2, '0');
//       return `${hours}:${minutes}`;
//     } catch (e) {
//       return '-';
//     }
//   };

//   const resetFilters = () => {
//     setSearchTerm('');
//     setFromDate('');
//     setToDate('');
//     setSelectedVehicle('');
//     setSelectedDriver('');
//     setSelectedPump('');
//     setSelectedStatus('');
//     setVisibleCount(ITEMS_PER_PAGE); // Reset pagination
//   };

//   const getActiveFilterCount = () => {
//     let count = 0;
//     if (fromDate) count++;
//     if (toDate) count++;
//     if (selectedVehicle) count++;
//     if (selectedDriver) count++;
//     if (selectedPump) count++;
//     if (selectedStatus) count++;
//     return count;
//   };

//   const displayedEntries = filteredEntries.slice(0, visibleCount);
//   const hasMoreEntries = filteredEntries.length > visibleCount;

//   const loadMore = () => {
//     setVisibleCount(prev => prev + ITEMS_PER_PAGE);
//   };

//   return (
//     <div className="min-h-screen bg-slate-50/50 py-3 px-3 font-sans">
      
//       <div className="max-w-full mx-auto space-y-4">
        
//         {/* Header Section */}
//         <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
//           <div>
//             <h1 className="text-xl font-bold text-slate-800 tracking-tight">Diesel Logs</h1>
//             <p className="text-xs text-slate-500 mt-0.5">Manage and monitor vehicle fuel entries</p>
//           </div>

//           <div className="flex gap-2 w-full md:w-auto">
//             <div className="relative flex-1 md:w-72">
//               <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
//                 <Search className="h-3.5 w-3.5 text-slate-400" />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search by Transaction ID, Vehicle, Invoice, Driver..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="block w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
//               />
//             </div>
            
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm transition-all ${
//                 showFilters 
//                   ? 'bg-blue-50 border-blue-200 text-blue-700' 
//                   : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
//               }`}
//             >
//               <Filter size={14} />
//               Filters
//               {getActiveFilterCount() > 0 && (
//                 <span className="ml-1 bg-blue-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
//                   {getActiveFilterCount()}
//                 </span>
//               )}
//             </button>
//           </div>
//         </header>

//         {/* Filters Panel */}
//         {showFilters && (
//           <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
//             <div className="p-4">
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
//                 {/* From Date */}
//                 <div>
//                   <label className="block text-xs font-medium text-slate-600 mb-1">From Date</label>
//                   <input
//                     type="date"
//                     value={fromDate}
//                     onChange={(e) => setFromDate(e.target.value)}
//                     className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                   />
//                 </div>
                
//                 {/* To Date */}
//                 <div>
//                   <label className="block text-xs font-medium text-slate-600 mb-1">To Date</label>
//                   <input
//                     type="date"
//                     value={toDate}
//                     onChange={(e) => setToDate(e.target.value)}
//                     className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
//                   />
//                 </div>
                
//                 {/* Vehicle Filter */}
//                 <div>
//                   <label className="block text-xs font-medium text-slate-600 mb-1">Vehicle</label>
//                   <select
//                     value={selectedVehicle}
//                     onChange={(e) => setSelectedVehicle(e.target.value)}
//                     className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
//                   >
//                     <option value="">All Vehicles</option>
//                     {vehicles.map(vehicle => (
//                       <option key={vehicle} value={vehicle}>{vehicle}</option>
//                     ))}
//                   </select>
//                 </div>
                
//                 {/* Driver Filter */}
//                 <div>
//                   <label className="block text-xs font-medium text-slate-600 mb-1">Driver</label>
//                   <select
//                     value={selectedDriver}
//                     onChange={(e) => setSelectedDriver(e.target.value)}
//                     className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
//                   >
//                     <option value="">All Drivers</option>
//                     {drivers.map(driver => (
//                       <option key={driver} value={driver}>{driver}</option>
//                     ))}
//                   </select>
//                 </div>
                
//                 {/* Pump Filter */}
//                 <div>
//                   <label className="block text-xs font-medium text-slate-600 mb-1">Pump</label>
//                   <select
//                     value={selectedPump}
//                     onChange={(e) => setSelectedPump(e.target.value)}
//                     className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
//                   >
//                     <option value="">All Pumps</option>
//                     {pumps.map(pump => (
//                       <option key={pump} value={pump}>{pump}</option>
//                     ))}
//                   </select>
//                 </div>
                
//                 {/* Status Filter */}
//                 <div>
//                   <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
//                   <select
//                     value={selectedStatus}
//                     onChange={(e) => setSelectedStatus(e.target.value)}
//                     className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
//                   >
//                     <option value="">All Status</option>
//                     <option value="Loaded">Loaded</option>
//                     <option value="Empty">Empty</option>
//                   </select>
//                 </div>
//               </div>
              
//               {/* Filter Actions */}
//               {(fromDate || toDate || selectedVehicle || selectedDriver || selectedPump || selectedStatus) && (
//                 <div className="mt-3 flex justify-end">
//                   <button
//                     onClick={resetFilters}
//                     className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-red-600 transition-colors"
//                   >
//                     <X size={12} />
//                     Clear all filters
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Main Data Table Container */}
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          
//           {/* Table Header + Scrollable Body */}
//           <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar relative">
            
//             <table className="min-w-max text-left border-collapse">
//               {/* Sticky Header */}
//               <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
//                 <tr>
//                   {[
//                     { icon: Hash, label: "Txn ID", width: "100px" },
//                     { icon: Calendar, label: "Date", width: "70px" },
//                     { label: "Time", width: "60px" },
//                     { icon: FileText, label: "Invoice", width: "90px" },
//                     { label: "Material", width: "80px" },
//                     { icon: Truck, label: "Vehicle", width: "90px" },
//                     { icon: User, label: "Driver", width: "90px" },
//                     { icon: MapPin, label: "From", width: "80px" },
//                     { icon: MapPin, label: "To", width: "80px" },
//                     { label: "KM", width: "50px", align: "right" },
//                     { label: "Route", width: "60px" },
//                     { icon: Fuel, label: "Diesel (L)", width: "80px", align: "right" },
//                     { label: "Pump", width: "80px" },
//                     { label: "Extra", width: "60px", align: "right" },
//                     { label: "Reason", width: "80px" },
//                     { label: "Approved By", width: "85px" },
//                     { label: "Advance", width: "70px", align: "right" },
//                     { label: "Food", width: "60px", align: "right" },
//                     { label: "Load", width: "60px", align: "right" },
//                     { label: "Cut", width: "50px", align: "right" },
//                     { label: "Status", width: "70px" },
//                     // REMOVED: { label: "Type", width: "60px" }
//                     { label: "Remarks", width: "150px" }
//                   ].map((col, i) => (
//                     <th
//                       key={i}
//                       className={`px-2 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap`}
//                       style={{ width: col.width }}
//                     >
//                       <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
//                         {col.icon && <col.icon size={10} className="opacity-70" />}
//                         {col.label}
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-slate-100">
//                 {loading ? (
//                   // Skeleton Loading
//                   Array.from({ length: 8 }).map((_, i) => (
//                     <tr key={i} className="hover:bg-slate-50/50 transition-colors">
//                       {/* Updated to 22 columns */}
//                       {Array.from({ length: 22 }).map((_, j) => (
//                         <td key={j} className="px-2 py-2">
//                           <div className="h-3.5 bg-slate-100 rounded animate-pulse w-3/4"></div>
//                          </td>
//                       ))}
//                     </tr>
//                   ))
//                 ) : displayedEntries.length === 0 ? (
//                   <tr>
//                     {/* Updated to 22 columns */}
//                     <td colSpan="22" className="h-64 text-center">
//                       <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
//                         <div className="p-2 bg-slate-100 rounded-full">
//                           <Search size={20} />
//                         </div>
//                         <p className="font-medium text-slate-600 text-sm">No records found</p>
//                         <p className="text-xs">Try adjusting your search filters</p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   displayedEntries.map((entry, index) => (
//                     <tr
//                       key={entry.id}
//                       className={`group hover:bg-blue-50/30 transition-colors duration-150 ${
//                         index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
//                       }`}
//                     >
//                       {/* Transaction ID */}
//                       <TableCell className="font-mono text-xs text-blue-600 font-medium">
//                         {entry.transaction_id || '-'}
//                       </TableCell>
                      
//                       {/* Trip Details */}
//                       <TableCell className="font-medium text-slate-700 text-xs">{formatDate(entry.entry_date)}</TableCell>
//                       <TableCell className="text-slate-500 font-mono text-[11px]">{formatTime(entry.invoice_time)}</TableCell>
//                       <TableCell className="font-medium text-blue-600 text-xs">{entry.invoice_number}</TableCell>
//                       <TableCell className="text-slate-600 text-xs">{entry.material_type || '-'}</TableCell>

//                       {/* Route */}
//                       <TableCell className="font-medium text-slate-700 text-xs">{entry.vehicle?.vehicle_number}</TableCell>
//                       <TableCell className="text-slate-500 text-xs">{entry.driver?.driver_name}</TableCell>
//                       <TableCell className="text-slate-600 text-xs">{entry.fromCity?.city_name}</TableCell>
//                       <TableCell className="text-slate-600 text-xs">{entry.toCity?.city_name}</TableCell>

//                       {/* Route Stats */}
//                       <TableCell align="right" className="text-xs">{entry.km || '-'}</TableCell>
//                       <TableCell className="text-[11px] text-slate-400">{entry.route?.route_code || '-'}</TableCell>

//                       {/* Fuel */}
//                       <TableCell align="right" className="font-semibold text-slate-800 text-xs">
//                         {entry.diesel_qty} <span className="text-[10px] font-normal text-slate-400">L</span>
//                       </TableCell>
//                       <TableCell className="text-slate-500 text-xs">{entry.pump?.pump_name || '-'}</TableCell>

//                       <TableCell align="right" className="text-orange-600 font-medium text-xs">{entry.extra_diesel_qty || 0}</TableCell>
//                       <TableCell className="text-slate-500 text-[11px] max-w-[100px] truncate" title={entry.extraRemark?.remark_text}>
//                         {entry.extraRemark?.remark_text || '-'}
//                       </TableCell>
//                       <TableCell className="text-slate-500 text-[11px]">{entry.approver?.approver_name || '-'}</TableCell>

//                       {/* Financials */}
//                       <TableCell align="right" className="font-mono text-[11px]">₹{entry.trip_advance_amount || 0}</TableCell>
//                       <TableCell align="right" className="font-mono text-[11px]">₹{entry.fooding_amount || 0}</TableCell>
//                       <TableCell align="right" className="font-mono text-[11px]">₹{entry.loading_unloading_amount || 0}</TableCell>
                      
//                       <TableCell align="right" className="text-red-600 font-medium font-mono text-[11px]">
//                         {entry.cut_diesel_qty > 0 ? `-${entry.cut_diesel_qty}` : entry.cut_diesel_qty}
//                       </TableCell>

//                       {/* Status */}
//                       <TableCell>
//                         <StatusBadge status={entry.trip_status} type="trip" />
//                       </TableCell>
                      
//                       {/* REMOVED: Type Column Cell */}

//                       {/* Remarks */}
//                       <TableCell className="max-w-[150px] truncate italic text-slate-500" title={entry.remarks}>
//                         {entry.remarks || '-'}
//                       </TableCell>

//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Lazy Load Footer */}
//           {!loading && hasMoreEntries && (
//             <div className="p-3 border-t border-slate-200 bg-white sticky bottom-0 z-10 flex justify-center">
//               <button
//                 onClick={loadMore}
//                 className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors border border-blue-200"
//               >
//                 <RefreshCw size={12} />
//                 Load Next 50
//               </button>
//             </div>
//           )}
          
//           {/* Count Summary */}
//           {!loading && displayedEntries.length > 0 && !hasMoreEntries && (
//              <div className="p-2 border-t border-slate-200 bg-slate-50 text-xs text-center text-slate-500">
//                 Showing all {displayedEntries.length} entries
//              </div>
//           )}
//         </div>
//       </div>

//       <style>{`
//         /* Custom Scrollbar for cleaner look */
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 6px;
//           height: 6px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: transparent;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: #cbd5e1;
//           border-radius: 3px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: #94a3b8;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default AllEntries;
