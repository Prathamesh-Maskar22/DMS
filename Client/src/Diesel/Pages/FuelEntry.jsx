import React, { useState, useEffect, useRef } from 'react';
import { Save, Fuel, Truck, User, MapPin, FileText, Clock, Weight, Scissors, Calendar, Route as RouteIcon, AlertTriangle, Search, ChevronDown } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const CUT_FROM_TRIP_ID = 1;
const CUT_FROM_SALARY_ID = 2;

// --- CUSTOM SEARCHABLE SELECT COMPONENT ---
// Used for all dropdowns to enable search and custom scrollbars
const SearchableSelect = ({ label, name, value, options, labelKey, valueKey, onChange, icon: Icon, placeholder = "Select" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  // Find the currently selected label for display
  const currentLabel = options.find(o => String(o[valueKey]) === String(value))?.[labelKey] || '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option[labelKey].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    // Simulate event object structure for existing handleChange
    onChange({ target: { name, value: option[valueKey] } });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">{label}</label>
      
      {/* Trigger Box (looks like input but acts as button) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-2 py-1.5 border rounded-lg cursor-pointer
          bg-white flex items-center justify-between
          transition-all text-xs
          ${isOpen ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {Icon && <Icon size={14} className="text-gray-400 flex-shrink-0" />}
          <span className="truncate text-gray-700">{currentLabel || placeholder}</span>
        </div>
        <ChevronDown size={12} className={`transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Custom Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {/* Search Input inside dropdown */}
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-500 text-center">No results found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option[valueKey]}
                  onClick={() => handleSelect(option)}
                  className="px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors truncate"
                >
                  {option[labelKey]}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---

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
    kata_charges: '',      
    border_charges: '',    
    misc_charges: '',      
    extra_diesel_qty: 0,
    extra_diesel_remark_id: '',
    approved_by_id: '',
    cut_diesel_qty: 0,
    loading_weight: '',
    remarks: '',
    is_new_trip: true,
    trip_status: 'Loaded',
  });

  const [loading, setLoading] = useState(false);
  const [fetchingPast, setFetchingPast] = useState(false);
  const [driverPendingDiesel, setDriverPendingDiesel] = useState(0);

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

        const responses = await Promise.all(endpoints.map(e => fetch(`${API_BASE_URL}${e.url}`)));
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
        toast.error('Failed to load master data.');
      }
    };

    fetchMasters();
  }, []);

  useEffect(() => {
    if (form.is_new_trip) return;
    if (!form.vehicle_id) return;
    handleFetchPastTrip();
  }, [form.vehicle_id, form.is_new_trip]);

  useEffect(() => {
    if (form.driver_id) handleFetchDriverPending(form.driver_id);
    else setDriverPendingDiesel(0);
  }, [form.driver_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const currentRowPending = Number(form.extra_diesel_qty || 0) - Number(form.cut_diesel_qty || 0);

  const handleFetchPastTrip = async () => {
    setFetchingPast(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/entries/last-trip-vehicle?vehicle_id=${form.vehicle_id}`);
      const result = await response.json();

      if (response.ok && result.data) {
        setForm(prev => ({
          ...prev,
          customer_id: result.data.customer_id || '',
          route_id: result.data.route_id || '',
          from_city_id: result.data.from_city_id || '',
          to_city_id: result.data.to_city_id || '',
          invoice_number: result.data.invoice_number || '',
          invoice_time: result.data.invoice_time || '',
          material_type: result.data.material_type || '',
          diesel_qty: '', 
          trip_advance_amount: '', fooding_amount: '', loading_unloading_amount: '',
          kata_charges: '', border_charges: '', misc_charges: '',
          extra_diesel_qty: 0, cut_diesel_qty: 0,
          driver_id: '', pump_id: '', remarks: '',
        }));
        toast.success('✅ Last trip details auto-filled');
      } else {
        setForm(prev => ({
          ...prev, customer_id: '', route_id: '', from_city_id: '', to_city_id: '', 
          invoice_number: '', invoice_time: '', material_type: '' 
        }));
      }
    } catch (err) {
      toast.error('Network error while fetching past trip.');
    } finally {
      setFetchingPast(false);
    }
  };

  const handleFetchDriverPending = async (driverId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/entries/driver-pending?driver_id=${driverId}`);
      const result = await response.json();
      if (response.ok && result.data) setDriverPendingDiesel(result.data.total_pending || 0);
      else setDriverPendingDiesel(0);
    } catch (err) {
      setDriverPendingDiesel(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
        kata_charges: Number(form.kata_charges) || 0,      
        border_charges: Number(form.border_charges) || 0,  
        misc_charges: Number(form.misc_charges) || 0,      
        extra_diesel_qty: Number(form.extra_diesel_qty) || 0,
        cut_diesel_qty: Number(form.cut_diesel_qty) || 0,
        loading_weight: form.loading_weight ? Number(form.loading_weight) : undefined,
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) toast.success('Diesel entry saved successfully!');
      else toast.error('Failed to save entry');
    } catch (err) {
      toast.error('Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = masters.customers.find(c => String(c.id) === form.customer_id);
  const selectedApprover = masters.approvers.find(a => String(a.id) === form.approved_by_id);

  return (
    <div className="max-w-[1600px] mx-auto mt-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <Fuel className="text-blue-600" /> Vehicle Refueling
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-4">

            {/* 1. Date & Vehicle */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Entry Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-2.5 top-2 text-gray-400" />
                <input name="entry_date" type="date" value={form.entry_date} onChange={handleChange} className="w-full pl-8 pr-2 py-1.5 border border-gray-300 bg-white rounded-lg focus:ring-1 focus:ring-blue-500 text-sm" required />
              </div>
            </div>

            {/* CUSTOM DROPDOWN: Vehicle */}
            <SearchableSelect
              label="Vehicle"
              name="vehicle_id"
              value={form.vehicle_id}
              options={masters.vehicles}
              labelKey="vehicle_number"
              valueKey="id"
              onChange={handleChange}
              icon={Truck}
              placeholder="Select Vehicle"
            />

            {/* 2. Trip Type & Status */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Trip Type</label>
                <div className="flex bg-gray-100 p-0.5 rounded-lg h-[34px]">
                  <button type="button" onClick={() => setForm(p => ({ ...p, is_new_trip: true }))} className={`flex-1 text-[10px] font-bold rounded transition-colors ${form.is_new_trip ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>New</button>
                  <button type="button" onClick={() => setForm(p => ({ ...p, is_new_trip: false }))} className={`flex-1 text-[10px] font-bold rounded transition-colors ${!form.is_new_trip ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Past</button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Status</label>
                <div className="flex bg-gray-100 p-0.5 rounded-lg h-[34px]">
                  <button type="button" onClick={() => setForm(p => ({ ...p, trip_status: 'Loaded' }))} className={`flex-1 text-[10px] font-bold rounded transition-colors ${form.trip_status === 'Loaded' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500'}`}>Loaded</button>
                  <button type="button" onClick={() => setForm(p => ({ ...p, trip_status: 'Empty' }))} className={`flex-1 text-[10px] font-bold rounded transition-colors ${form.trip_status === 'Empty' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500'}`}>Empty</button>
                </div>
              </div>
            </div>

            {!form.is_new_trip && fetchingPast && (
              <div className="col-span-full flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-amber-200">
                <div className="animate-spin h-3 w-3 border-2 border-amber-600 border-t-transparent rounded-full" /> Fetching trip details...
              </div>
            )}

            {/* 3. Trip Details */}
            <div className="col-span-full border-t border-gray-100 pt-3">
              <h3 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1"><MapPin size={12} /> Trip Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-3">
                
                {/* CUSTOM DROPDOWN: Customer */}
                <SearchableSelect
                  label="Customer"
                  name="customer_id"
                  value={form.customer_id}
                  options={masters.customers}
                  labelKey="customer_name"
                  valueKey="id"
                  onChange={handleChange}
                  placeholder="Select"
                />

                {/* CUSTOM DROPDOWN: Driver */}
                <div>
                  <SearchableSelect
                    label="Driver"
                    name="driver_id"
                    value={form.driver_id}
                    options={masters.drivers}
                    labelKey="driver_name"
                    valueKey="id"
                    onChange={handleChange}
                    icon={User}
                    placeholder="Select"
                  />
                  {driverPendingDiesel > 0 && (
                    <div className="mt-1 text-[9px] font-bold text-orange-600 flex items-center gap-1 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                      <AlertTriangle size={9} /> Pending: {driverPendingDiesel}L
                    </div>
                  )}
                </div>

                {/* CUSTOM DROPDOWN: Route */}
                <SearchableSelect
                  label="Route"
                  name="route_id"
                  value={form.route_id}
                  options={masters.routes}
                  labelKey="route_code"
                  valueKey="id"
                  onChange={handleChange}
                  icon={RouteIcon}
                  placeholder="Select"
                />

                {/* CUSTOM DROPDOWN: Pump */}
                <SearchableSelect
                  label="Pump"
                  name="pump_id"
                  value={form.pump_id}
                  options={masters.pumps}
                  labelKey="pump_name"
                  valueKey="id"
                  onChange={handleChange}
                  placeholder="Select"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3 mt-3">
                
                {/* CUSTOM DROPDOWN: From City */}
                <SearchableSelect
                  label="From City"
                  name="from_city_id"
                  value={form.from_city_id}
                  options={masters.cities}
                  labelKey="city_name"
                  valueKey="id"
                  onChange={handleChange}
                  icon={MapPin}
                  placeholder="Select"
                />

                {/* CUSTOM DROPDOWN: To City */}
                <SearchableSelect
                  label="To City"
                  name="to_city_id"
                  value={form.to_city_id}
                  options={masters.cities}
                  labelKey="city_name"
                  valueKey="id"
                  onChange={handleChange}
                  icon={MapPin}
                  placeholder="Select"
                />
              </div>
            </div>

            {/* 4. Invoice & Material */}
            <div className="col-span-full border-t border-gray-100 pt-3">
              <h3 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1"><FileText size={12} /> Invoice & Material</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Invoice No</label>
                  <input name="invoice_number" type="text" value={form.invoice_number} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 bg-gray-50 rounded-lg focus:ring-1 focus:ring-blue-500 text-xs" placeholder="INV-001" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Time</label>
                  <input name="invoice_time" type="time" value={form.invoice_time} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 bg-gray-50 rounded-lg focus:ring-1 focus:ring-blue-500 text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Material</label>
                  <input name="material_type" type="text" value={form.material_type} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 bg-gray-50 rounded-lg focus:ring-1 focus:ring-blue-500 text-xs" placeholder="e.g. Cement" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Load Weight</label>
                  <input name="loading_weight" type="number" step="0.01" value={form.loading_weight} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 bg-gray-50 rounded-lg focus:ring-1 focus:ring-blue-500 text-xs" />
                </div>
              </div>
            </div>

            {/* 5. Financials */}
            <div className="col-span-full border-t border-gray-100 pt-3">
              <h3 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1"><Weight size={12} /> Financials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Advance</label>
                  <input name="trip_advance_amount" type="number" value={form.trip_advance_amount} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 bg-gray-50 rounded-lg focus:ring-1 focus:ring-blue-500 text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Fooding</label>
                  <input name="fooding_amount" type="number" value={form.fooding_amount} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 bg-gray-50 rounded-lg focus:ring-1 focus:ring-blue-500 text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">L/U</label>
                  <input name="loading_unloading_amount" type="number" value={form.loading_unloading_amount} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 bg-gray-50 rounded-lg focus:ring-1 focus:ring-blue-500 text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Kata</label>
                  <input name="kata_charges" type="number" value={form.kata_charges} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 bg-gray-50 rounded-lg focus:ring-1 focus:ring-blue-500 text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Border</label>
                  <input name="border_charges" type="number" value={form.border_charges} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 bg-gray-50 rounded-lg focus:ring-1 focus:ring-blue-500 text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Misc</label>
                  <input name="misc_charges" type="number" value={form.misc_charges} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 bg-gray-50 rounded-lg focus:ring-1 focus:ring-blue-500 text-xs" />
                </div>
              </div>
            </div>

            {/* 6. Diesel Details */}
            <div className="col-span-full border-t border-gray-100 pt-3">
              <h3 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1"><Fuel size={12} /> Diesel Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-3">
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Diesel (L)</label>
                  <div className="relative">
                    <Fuel size={14} className="absolute left-2.5 top-2 text-blue-500" />
                    <input name="diesel_qty" type="number" step="0.01" value={form.diesel_qty} onChange={handleChange} className="w-full pl-8 pr-2 py-1.5 border border-blue-200 bg-blue-50 rounded-lg focus:ring-1 focus:ring-blue-500 font-bold text-blue-700 text-xs" required />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">KM</label>
                  <input name="km" type="number" value={form.km} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 bg-gray-50 rounded-lg focus:ring-1 focus:ring-blue-500 text-xs" />
                </div>

                <div className="border-l-2 border-orange-100 pl-2">
                  <label className="block text-[10px] font-bold text-orange-600 uppercase mb-0.5">Extra</label>
                  <input name="extra_diesel_qty" type="number" step="0.01" value={form.extra_diesel_qty} onChange={handleChange} className="w-full px-2 py-1.5 border border-orange-200 bg-white rounded-lg focus:ring-1 focus:ring-orange-500 text-xs" />
                  
                  {Number(form.extra_diesel_qty) > 0 && (
                    <div className="mt-1 space-y-1">
                      {/* CUSTOM DROPDOWN: Extra Remark */}
                      <SearchableSelect
                        label="Reason"
                        name="extra_diesel_remark_id"
                        value={form.extra_diesel_remark_id}
                        options={masters.extraRemarks}
                        labelKey="remark_text"
                        valueKey="id"
                        onChange={handleChange}
                        placeholder="Select"
                      />
                      
                      {/* CUSTOM DROPDOWN: Approver */}
                      <SearchableSelect
                        label="Approver"
                        name="approved_by_id"
                        value={form.approved_by_id}
                        options={masters.approvers}
                        labelKey="approver_name"
                        valueKey="id"
                        onChange={handleChange}
                        placeholder="Select"
                      />
                    </div>
                  )}
                </div>

                <div className="border-l-2 border-red-100 pl-2">
                  <label className="block text-[10px] font-bold text-red-600 uppercase mb-0.5 flex items-center gap-1">
                    <Scissors size={10} /> Cut
                  </label>
                  <input name="cut_diesel_qty" type="number" step="0.01" value={form.cut_diesel_qty} onChange={handleChange} className="w-full px-2 py-1.5 border border-red-200 bg-white rounded-lg focus:ring-1 focus:ring-red-500 text-xs" />
                  <div className="mt-1 text-[10px] text-gray-500 flex justify-between bg-gray-50 px-1.5 py-0.5 rounded">
                    <span>Pend:</span>
                    <span className="font-bold text-gray-700">{currentRowPending.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Remarks */}
            <div className="col-span-full border-t border-gray-100 pt-3">
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Remarks</label>
              <textarea name="remarks" value={form.remarks} onChange={handleChange} className="w-full px-2 py-2 border border-gray-300 bg-gray-50 rounded-lg h-16 text-xs resize-none focus:ring-1 focus:ring-blue-500" placeholder="Add notes..." />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center rounded-b-xl">
          <div>
             <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="colored" />
          </div>
          <div className="flex gap-2">
            <button type="button" className="px-4 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-white text-xs font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm flex items-center gap-1.5 disabled:opacity-50 text-xs">
              <Save size={14} /> {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FuelEntry;

// import React, { useState, useEffect } from 'react';
// import { Save, Fuel, Truck, User, MapPin, FileText, Clock, Weight, Scissors, Calendar, Route as RouteIcon } from 'lucide-react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// const FuelEntry = () => {
//   const [masters, setMasters] = useState({
//     vehicles: [],
//     drivers: [],
//     cities: [],
//     pumps: [],
//     customers: [],
//     extraRemarks: [],
//     approvers: [],
//     routes: [],
//   });

//   const [form, setForm] = useState({
//     entry_date: new Date().toISOString().split('T')[0],
//     vehicle_id: '',
//     driver_id: '',
//     from_city_id: '',
//     to_city_id: '',
//     pump_id: '',
//     customer_id: '',
//     route_id: '',
//     invoice_number: '',
//     invoice_time: '',
//     material_type: '',
//     km: '',
//     diesel_qty: '',
//     trip_advance_amount: '',
//     fooding_amount: '',
//     loading_unloading_amount: '',
//     extra_diesel_qty: 0,
//     extra_diesel_remark_id: '',
//     approved_by_id: '',
//     cut_diesel_qty: 0,
//     loading_weight: '',
//     remarks: '',
//     is_new_trip: true,
//     trip_status: 'Loaded',
//   });

//   const [loading, setLoading] = useState(false);
//   const [fetchingPast, setFetchingPast] = useState(false);

//   // Fetch all masters
//   useEffect(() => {
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

//         const responses = await Promise.all(
//           endpoints.map(e => fetch(`${API_BASE_URL}${e.url}`))
//         );
//         const data = await Promise.all(responses.map(res => res.json()));

//         setMasters({
//           vehicles: data[0].data || [],
//           drivers: data[1].data || [],
//           cities: data[2].data || [],
//           pumps: data[3].data || [],
//           customers: data[4].data || [],
//           extraRemarks: data[5].data || [],
//           approvers: data[6].data || [],
//           routes: data[7].data || [],
//         });
//       } catch (err) {
//         toast.error('Failed to load master data.');
//       }
//     };

//     fetchMasters();
//   }, []);

//   // ==================== AUTO RE-FETCH ON CUSTOMER / VEHICLE CHANGE ====================
//   useEffect(() => {
//     if (form.is_new_trip) return;
//     if (!form.vehicle_id || !form.customer_id) return;
//     handleFetchPastTrip();
//   }, [form.vehicle_id, form.customer_id, form.is_new_trip]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm(prev => ({ ...prev, [name]: value }));
//   };

//   // Computed Pending to Cut
//   const pendingToCut = Number(form.extra_diesel_qty || 0) - Number(form.cut_diesel_qty || 0);

//   // ==================== FETCH PAST TRIP ====================
//   const handleFetchPastTrip = async () => {
//     setFetchingPast(true);
//     try {
//       const query = new URLSearchParams({
//         vehicle_id: form.vehicle_id,
//         customer_id: form.customer_id,
//       }).toString();

//       const response = await fetch(`${API_BASE_URL}/api/v1/entries/last-trip?${query}`);
//       const result = await response.json();

//       if (response.ok && result.data) {
//         setForm(prev => ({
//           ...prev,
//           ...result.data,
//           is_new_trip: false,
//           km: result.data.km || '',
//           diesel_qty: result.data.diesel_qty || '',
//           trip_advance_amount: result.data.trip_advance_amount || '',
//           fooding_amount: result.data.fooding_amount || '',
//           loading_unloading_amount: result.data.loading_unloading_amount || '',
//           extra_diesel_qty: result.data.extra_diesel_qty || 0,
//           cut_diesel_qty: result.data.cut_diesel_qty || 0,
//           loading_weight: result.data.loading_weight || '',
//         }));
//         toast.success('✅ Last trip auto-filled');
//       } else {
//         setForm(prev => ({
//           ...prev,
//           driver_id: '',
//           from_city_id: '',
//           to_city_id: '',
//           pump_id: '',
//           route_id: '',
//           invoice_number: '',
//           invoice_time: '',
//           material_type: '',
//           km: '',
//           diesel_qty: '',
//           trip_advance_amount: '',
//           fooding_amount: '',
//           loading_unloading_amount: '',
//           extra_diesel_qty: 0,
//           extra_diesel_remark_id: '',
//           approved_by_id: '',
//           cut_diesel_qty: 0,
//           loading_weight: '',
//           remarks: '',
//         }));
//         toast.error('No past trip found for this Customer + Vehicle');
//       }
//     } catch (err) {
//       toast.error('Network error while fetching past trip.');
//     } finally {
//       setFetchingPast(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const payload = {
//         ...form,
//         vehicle_id: Number(form.vehicle_id),
//         driver_id: Number(form.driver_id),
//         route_id: form.route_id ? Number(form.route_id) : undefined,
//         customer_id: form.customer_id ? Number(form.customer_id) : undefined,
//         from_city_id: form.from_city_id ? Number(form.from_city_id) : undefined,
//         to_city_id: form.to_city_id ? Number(form.to_city_id) : undefined,
//         pump_id: form.pump_id ? Number(form.pump_id) : undefined,
//         extra_diesel_remark_id: form.extra_diesel_remark_id ? Number(form.extra_diesel_remark_id) : undefined,
//         approved_by_id: form.approved_by_id ? Number(form.approved_by_id) : undefined,

//         km: form.km ? Number(form.km) : undefined,
//         diesel_qty: Number(form.diesel_qty),
//         trip_advance_amount: Number(form.trip_advance_amount) || 0,
//         fooding_amount: Number(form.fooding_amount) || 0,
//         loading_unloading_amount: Number(form.loading_unloading_amount) || 0,
//         extra_diesel_qty: Number(form.extra_diesel_qty) || 0,
//         cut_diesel_qty: Number(form.cut_diesel_qty) || 0,
//         loading_weight: form.loading_weight ? Number(form.loading_weight) : undefined,
//       };

//       const response = await fetch(`${API_BASE_URL}/api/v1/entries`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         toast.success('Diesel entry saved successfully!');
//       } else {
//         toast.error('Failed to save entry');
//       }
//     } catch (err) {
//       toast.error('Failed to save entry');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const selectedCustomer = masters.customers.find(c => String(c.id) === form.customer_id);
//   const selectedApprover = masters.approvers.find(a => String(a.id) === form.approved_by_id);

//   return (
//     <div className="max-w-7xl mx-auto mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
//       <div className="px-6 py-4 bg-gray-100 border-b border-gray-100 flex justify-between items-center">
//         <h1 className="text-2xl font-bold flex items-center gap-3">
//           <Fuel className="text-blue-600" /> Vehicle Refueling & Trip Tracking
//         </h1>
//       </div>

//       <form onSubmit={handleSubmit}>
//         <div className="p-6">
//           {/* Layout Grid: 4 Columns on large screens for compact data entry */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

//             {/* 1. Date & Vehicle Number */}
//             <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Entry Date</label>
//               <div className="relative">
//                 <Calendar size={18} className="absolute left-3 top-2.5 text-gray-400" />
//                 <input 
//                   name="entry_date" 
//                   type="date" 
//                   value={form.entry_date} 
//                   onChange={handleChange} 
//                   className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-gray-700" 
//                   required 
//                 />
//               </div>
//             </div>

//             <div className="lg:col-span-1">
//               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vehicle Number</label>
//               <div className="relative">
//                 <Truck size={18} className="absolute left-3 top-3 text-gray-400" />
//                 <select 
//                   name="vehicle_id" 
//                   value={form.vehicle_id} 
//                   onChange={handleChange}
//                   className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 font-medium" 
//                   required
//                 >
//                   <option value="">Select Vehicle</option>
//                   {masters.vehicles.map(v => (
//                     <option key={v.id} value={v.id}>{v.vehicle_number} ({v.vehicle_short_code})</option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* 2. Trip Type & Status */}
//             <div className="lg:col-span-2 grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trip Type</label>
//                 <div className="flex bg-gray-100 p-1 rounded-xl h-[42px] items-center">
//                   <button type="button" onClick={() => setForm(p => ({ ...p, is_new_trip: true }))}
//                     className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${form.is_new_trip ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
//                     New
//                   </button>
//                   <button type="button" onClick={() => setForm(p => ({ ...p, is_new_trip: false }))}
//                     className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${!form.is_new_trip ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
//                     Past
//                   </button>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trip Status</label>
//                 <div className="flex bg-gray-100 p-1 rounded-xl h-[42px] items-center">
//                   <button type="button" onClick={() => setForm(p => ({ ...p, trip_status: 'Loaded' }))}
//                     className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${form.trip_status === 'Loaded' ? 'bg-emerald-600 text-white shadow' : 'text-gray-500'}`}>
//                     Loaded
//                   </button>
//                   <button type="button" onClick={() => setForm(p => ({ ...p, trip_status: 'Empty' }))}
//                     className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${form.trip_status === 'Empty' ? 'bg-emerald-600 text-white shadow' : 'text-gray-500'}`}>
//                     Empty
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Auto-fetch status indicator */}
//             {!form.is_new_trip && fetchingPast && (
//               <div className="col-span-full md:col-span-2 lg:col-span-4 flex items-center gap-3 bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-sm font-medium border border-amber-100 mb-2">
//                 <div className="animate-spin h-4 w-4 border-2 border-amber-600 border-t-transparent rounded-full" />
//                 Fetching latest trip for selected Customer + Vehicle...
//               </div>
//             )}

//             {/* 3. Trip Details Section */}
//             <div className="col-span-full lg:col-span-4 border-t border-gray-100 pt-4 mt-2">
//               <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
//                 <MapPin size={16} className="text-blue-500" /> Trip Details
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                
//                 {/* Customer */}
//                 <div className="lg:col-span-1">
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer</label>
//                   <select name="customer_id" value={form.customer_id} onChange={handleChange}
//                     className="w-full px-4 py-2.5 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 text-sm">
//                     <option value="">Select Customer</option>
//                     {masters.customers.map(c => (
//                       <option key={c.id} value={c.id}>{c.customer_name}</option>
//                     ))}
//                   </select>
//                   {selectedCustomer && (
//                     <p className="mt-1 text-xs text-emerald-700 font-semibold truncate">{selectedCustomer.customer_name}</p>
//                   )}
//                 </div>

//                 {/* Driver */}
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Driver</label>
//                   <div className="relative">
//                     <User size={16} className="absolute left-3 top-2.5 text-gray-400" />
//                     <select name="driver_id" value={form.driver_id} onChange={handleChange}
//                       className="w-full pl-9 pr-3 py-2.5 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 text-sm appearance-none">
//                       <option value="">Select Driver</option>
//                       {masters.drivers.map(d => <option key={d.id} value={d.id}>{d.driver_name}</option>)}
//                     </select>
//                   </div>
//                 </div>

//                 {/* Route */}
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Route</label>
//                   <div className="relative">
//                     <RouteIcon size={16} className="absolute left-3 top-2.5 text-gray-400" />
//                     <select name="route_id" value={form.route_id} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 text-sm appearance-none">
//                       <option value="">Select Route</option>
//                       {masters.routes.map(r => (
//                         <option key={r.id} value={r.id}>{r.route_code}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 {/* Pump */}
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pump</label>
//                   <select name="pump_id" value={form.pump_id} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 text-sm">
//                     <option value="">Select Pump</option>
//                     {masters.pumps.map(p => <option key={p.id} value={p.id}>{p.pump_name}</option>)}
//                   </select>
//                 </div>

//                 {/* From City */}
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">From City</label>
//                   <div className="relative">
//                     <MapPin size={16} className="absolute left-3 top-2.5 text-gray-400" />
//                     <select name="from_city_id" value={form.from_city_id} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 text-sm appearance-none">
//                       <option value="">Select From</option>
//                       {masters.cities.map(c => <option key={c.id} value={c.id}>{c.city_name}</option>)}
//                     </select>
//                   </div>
//                 </div>

//                 {/* To City */}
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">To City</label>
//                   <div className="relative">
//                     <MapPin size={16} className="absolute left-3 top-2.5 text-gray-400" />
//                     <select name="to_city_id" value={form.to_city_id} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 text-sm appearance-none">
//                       <option value="">Select To</option>
//                       {masters.cities.map(c => <option key={c.id} value={c.id}>{c.city_name}</option>)}
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* 4. Invoice & Material Section */}
//             <div className="col-span-full lg:col-span-4 border-t border-gray-100 pt-4 mt-2">
//               <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
//                 <FileText size={16} className="text-purple-500" /> Invoice & Material
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
//                 <div className="lg:col-span-1">
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Invoice No</label>
//                   <input name="invoice_number" type="text" value={form.invoice_number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" placeholder="INV-001" />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time</label>
//                   <input name="invoice_time" type="time" value={form.invoice_time} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Material</label>
//                   <input name="material_type" type="text" value={form.material_type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. Cement" />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Loading Weight</label>
//                   <input name="loading_weight" type="number" step="0.01" value={form.loading_weight} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" placeholder="0.00" />
//                 </div>
//               </div>
//             </div>

//             {/* 5. Trip Advance Section */}
//             <div className="col-span-full lg:col-span-4 border-t border-gray-100 pt-4 mt-2">
//               <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
//                 <Weight size={16} className="text-orange-500" /> Financials
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trip Advance (₹)</label>
//                   <input name="trip_advance_amount" type="number" value={form.trip_advance_amount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fooding (₹)</label>
//                   <input name="fooding_amount" type="number" value={form.fooding_amount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Loading/Unloading (₹)</label>
//                   <input name="loading_unloading_amount" type="number" value={form.loading_unloading_amount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" />
//                 </div>
//               </div>
//             </div>

//             {/* 6. Diesel Details Section */}
//             <div className="col-span-full lg:col-span-4 border-t border-gray-100 pt-4 mt-2">
//               <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
//                 <Fuel size={16} className="text-blue-500" /> Diesel Details
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Diesel Qty (L)</label>
//                   <div className="relative">
//                     <Fuel size={16} className="absolute left-3 top-2.5 text-blue-500" />
//                     <input name="diesel_qty" type="number" step="0.01" value={form.diesel_qty} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 border border-blue-200 bg-blue-50 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-blue-700 text-sm" required />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">KM</label>
//                   <input name="km" type="number" value={form.km} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm" />
//                 </div>

//                 {/* Extra Diesel */}
//                 <div className="border-l-2 border-orange-100 pl-4">
//                   <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Extra Diesel (L)</label>
//                   <input name="extra_diesel_qty" type="number" step="0.01" value={form.extra_diesel_qty} onChange={handleChange} className="w-full px-3 py-2 border border-orange-200 rounded-xl focus:ring-orange-500 text-sm bg-white" />
                  
//                   {Number(form.extra_diesel_qty) > 0 && (
//                     <div className="mt-2 space-y-2">
//                       <select name="extra_diesel_remark_id" value={form.extra_diesel_remark_id} onChange={handleChange} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white">
//                         <option value="">Reason</option>
//                         {masters.extraRemarks.map(r => <option key={r.id} value={r.id}>{r.remark_text}</option>)}
//                       </select>
//                       <select name="approved_by_id" value={form.approved_by_id} onChange={handleChange} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white">
//                         <option value="">Approver</option>
//                         {masters.approvers.map(a => <option key={a.id} value={a.id}>{a.approver_name}</option>)}
//                       </select>
//                       {selectedApprover && (
//                         <p className="text-[10px] text-orange-700 font-medium truncate">{selectedApprover.approver_name}</p>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 {/* Cutting Diesel */}
//                 <div className="border-l-2 border-red-100 pl-4">
//                   <label className="block text-xs font-bold text-red-600 uppercase mb-1 flex items-center gap-1">
//                     <Scissors size={12} /> Cut Diesel (L)
//                   </label>
//                   <input name="cut_diesel_qty" type="number" step="0.01" value={form.cut_diesel_qty} onChange={handleChange} className="w-full px-3 py-2 border border-red-200 rounded-xl focus:ring-red-500 text-sm bg-white" />
                  
//                   <div className="mt-2 text-xs text-gray-500 flex justify-between items-center bg-gray-50 px-2 py-1 rounded">
//                     <span>Pending:</span>
//                     <span className="font-bold text-gray-800">{pendingToCut.toFixed(2)}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* 7. Remarks */}
//             <div className="col-span-full lg:col-span-4 border-t border-gray-100 pt-4 mt-2">
//               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Remarks</label>
//               <textarea name="remarks" value={form.remarks} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl h-24 text-sm resize-none focus:ring-2 focus:ring-blue-500" placeholder="Add any additional notes..." />
//             </div>

//           </div>
//         </div>

//         {/* Footer */}
//         <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center rounded-b-2xl">
//           <div>
//             <ToastContainer
//               position="top-right"
//               autoClose={3000}
//               hideProgressBar={false}
//               newestOnTop
//               closeOnClick
//               pauseOnHover
//               theme="colored"
//             />
//           </div>
//           <div className="flex gap-3">
//             <button type="button" className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-white font-medium transition-colors text-sm">
//               Cancel
//             </button>
//             <button type="submit" disabled={loading} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-md flex items-center gap-2 disabled:opacity-50 text-sm">
//               <Save size={18} /> {loading ? 'Saving...' : 'Save Entry'}
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default FuelEntry;
