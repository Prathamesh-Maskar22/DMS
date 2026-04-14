import React, { useState, useEffect } from 'react';
import { Search, FileText, Truck, Fuel, Calendar, MapPin, User, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// --- Helper Components ---

const StatusBadge = ({ status, type = 'trip' }) => {
  const styles = {
    trip: {
      Loaded: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      Unloaded: 'bg-gray-50 text-gray-600 border-gray-100',
      default: 'bg-gray-50 text-gray-600 border-gray-100'
    },
    isNew: {
      true: 'bg-blue-50 text-blue-700 border-blue-100',
      false: 'bg-gray-50 text-gray-500 border-gray-100'
    }
  };

  const styleSet = type === 'trip' ? styles.trip[status] || styles.trip.default : styles.isNew[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styleSet}`}>
      {type === 'trip' && status === 'Loaded' && <CheckCircle size={12} />}
      {status}
    </span>
  );
};

const TableCell = ({ children, className = "", align = "left" }) => (
  <td className={`px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap ${align === 'right' ? 'text-right' : ''} ${className}`}>
    {children}
  </td>
);

const AllEntries = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/entries`);
        const json = await res.json();
        if (json.success) setEntries(json.data);
      } catch (err) {
        console.error('Failed to fetch entries', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const filteredEntries = entries.filter((entry) => {
    const term = searchTerm.toLowerCase();
    return (
      entry.vehicle?.vehicle_number?.toLowerCase().includes(term) ||
      entry.invoice_number?.toLowerCase().includes(term) ||
      entry.driver?.driver_name?.toLowerCase().includes(term) ||
      entry.fromCity?.city_name?.toLowerCase().includes(term) ||
      entry.toCity?.city_name?.toLowerCase().includes(term)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    const [h, m] = timeString.split(':');
    return `${h}:${m}`;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-4 md:py-8 px-2 md:px-6 font-sans">
      
      <div className="max-w-[1800px] mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Diesel Logs</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and monitor vehicle fuel entries</p>
          </div>

          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search vehicle, invoice, driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </header>

        {/* Main Data Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ring-1 ring-slate-900/5">
          <div className="overflow-x-auto max-h-[75vh] custom-scrollbar">
            
            <table className="min-w-full text-left border-collapse">
              {/* Sticky Header */}
              <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200">

                <tr>
                  {[
                    { icon: Calendar, label: "Date" },
                    { label: "Time" },
                    { icon: FileText, label: "Invoice" },
                    { label: "Material" },
                    { icon: Truck, label: "Vehicle" },
                    { icon: User, label: "Driver" },
                    { icon: MapPin, label: "From" },
                    { icon: MapPin, label: "To" },
                    { label: "KM" },
                    { label: "Route" },
                    { icon: Fuel, label: "Diesel (L)" },
                    { label: "Pump" },
                    { label: "Extra" },
                    { label: "Reason" },
                    { label: "Approved By" },
                    { label: "Advance" },
                    { label: "Food" },
                    { label: "Load" },
                    { label: "Cut" },
                    { label: "Status" },
                    { label: "Type" },
                    { label: "Remarks" }
                  ].map((col, i) => (
                    <th
                      key={i}
                      className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap last:right-0 last:bg-slate-50 last:shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]"
                    >
                      <div className="flex items-center gap-1.5">
                        {col.icon && <col.icon size={12} className="opacity-70" />}
                        {col.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  // Skeleton Loading
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      {Array.from({ length: 22 }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan="23" className="h-96 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
                        <div className="p-3 bg-slate-100 rounded-full">
                          <Search size={24} />
                        </div>
                        <p className="font-medium text-slate-600">No records found</p>
                        <p className="text-sm">Try adjusting your search filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={`group hover:bg-blue-50/40 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                      }`}
                    >
                      {/* Trip Details */}
                      <TableCell className="font-medium text-slate-700">{formatDate(entry.entry_date)}</TableCell>
                      <TableCell className="text-slate-500 font-mono text-xs">{formatTime(entry.invoice_time)}</TableCell>
                      <TableCell className="font-medium text-blue-600">{entry.invoice_number}</TableCell>
                      <TableCell className="text-slate-600">{entry.material_type || '-'}</TableCell>

                      {/* Route */}
                      <TableCell className="font-medium text-slate-700">{entry.vehicle?.vehicle_number}</TableCell>
                      <TableCell className="text-slate-500">{entry.driver?.driver_name}</TableCell>
                      <TableCell className="text-slate-600">{entry.fromCity?.city_name}</TableCell>
                      <TableCell className="text-slate-600">{entry.toCity?.city_name}</TableCell>

                      {/* Route Stats */}
                      <TableCell align="right">{entry.km || '-'}</TableCell>
                      <TableCell className="text-xs text-slate-400">{entry.route?.route_code || '-'}</TableCell>

                      {/* Fuel */}
                      <TableCell className="font-semibold text-slate-800">{entry.diesel_qty} <span className="text-xs font-normal text-slate-400">L</span></TableCell>
                      <TableCell className="text-slate-500">{entry.pump?.pump_name || '-'}</TableCell>

                      <TableCell className="text-orange-600 font-medium">{entry.extra_diesel_qty || 0}</TableCell>
                      <TableCell className="text-slate-500 max-w-[120px] truncate" title={entry.extraRemark?.remark_text}>
                        {entry.extraRemark?.remark_text || '-'}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs">{entry.approver?.approver_name || '-'}</TableCell>

                      {/* Financials */}
                      <TableCell align="right" className="font-mono text-xs">₹{entry.trip_advance_amount || 0}</TableCell>
                      <TableCell align="right" className="font-mono text-xs">₹{entry.fooding_amount || 0}</TableCell>
                      <TableCell align="right" className="font-mono text-xs">₹{entry.loading_unloading_amount || 0}</TableCell>
                      
                      <TableCell align="right" className="text-red-600 font-medium font-mono text-xs">
                        {entry.cut_diesel_qty > 0 ? `-${entry.cut_diesel_qty}` : entry.cut_diesel_qty}
                      </TableCell>

                      {/* Status (Sticky) */}
                      <TableCell className="last:right-0 last:bg-white last:group-hover:bg-blue-50/40 last:shadow-[-5px_0_15px_-3px_rgba(0,0,0,0.05)] last:z-10">
                         <div className="flex flex-col gap-1">
                            <StatusBadge status={entry.trip_status} type="trip" />
                            <StatusBadge status={entry.is_new_trip} type="isNew" />
                         </div>
                      </TableCell>

                      <TableCell className="y last:right-[80px] last:bg-white last:group-hover:bg-blue-50/40">
                         <div className="flex flex-col gap-1">
                             {/* Remarks hidden on very small screens for cleanliness, visible on md+ */}
                            <span className="text-xs text-slate-400 max-w-[100px] truncate hidden md:block" title={entry.remarks}>
                              {entry.remarks || '-'}
                            </span>
                         </div>
                      </TableCell>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        /* Custom Scrollbar for cleaner look */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default AllEntries;
// import React, { useState, useEffect } from 'react';
// import { Search, Fuel, Truck, Calendar, MapPin, ArrowUpDown, IndianRupee, Clock, FileText, User, AlertCircle } from 'lucide-react';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// const AllEntries = () => {
//   const [entries, setEntries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     const fetchEntries = async () => {
//       try {
//         const res = await fetch(`${API_BASE_URL}/api/v1/entries`);
//         const json = await res.json();
//         if (json.success) setEntries(json.data);
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
//     return (
//       entry.vehicle?.vehicle_number?.toLowerCase().includes(term) ||
//       entry.invoice_number?.toLowerCase().includes(term) ||
//       entry.driver?.driver_name?.toLowerCase().includes(term) ||
//       entry.fromCity?.city_name?.toLowerCase().includes(term) ||
//       entry.toCity?.city_name?.toLowerCase().includes(term)
//     );
//   });

//   const formatDate = (dateString) => {
//     if (!dateString) return '-';
//     return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return '-';
//     // Handle format HH:MM:SS or HH:MM
//     const [h, m] = timeString.split(':');
//     return `${h}:${m}`;
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       <div className="max-w-full mx-auto space-y-6">
        
//         {/* Header */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//               <Fuel className="text-blue-600" /> Complete Diesel Log
//             </h1>
//             <p className="text-gray-500 text-sm mt-1">Full visibility of all fuel, financial, and trip data.</p>
//           </div>
          
//           <div className="relative w-full md:w-96">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//             <input
//               type="text"
//               placeholder="Search Invoice, Vehicle, Driver, or City..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm"
//             />
//           </div>
//         </div>

//         {/* Table Container with Horizontal Scroll */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-[1800px] w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Date & Time</th>
//                   <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Invoice Info</th>
//                   <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Vehicle & Driver</th>
//                   <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Route Details</th>
//                   <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Main Fuel</th>
//                   <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-orange-50">Extra Diesel</th>
//                   <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Financials</th>
//                   <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Deductions</th>
//                   <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">Status</th>
//                   <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Remarks & Meta</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {loading ? (
//                   <tr><td colSpan="10" className="p-8 text-center text-gray-500">Loading...</td></tr>
//                 ) : filteredEntries.length === 0 ? (
//                   <tr><td colSpan="10" className="p-8 text-center text-gray-500">No entries found.</td></tr>
//                 ) : (
//                   filteredEntries.map((entry) => (
//                     <tr key={entry.id} className="hover:bg-blue-50/50 transition-colors">
                      
//                       {/* 1. Date & Time */}
//                       <td className="px-4 py-3 whitespace-nowrap border-r border-gray-100">
//                         <div className="text-sm font-bold text-gray-900">{formatDate(entry.entry_date)}</div>
//                         <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
//                           <Clock size={12} /> {formatTime(entry.invoice_time)}
//                         </div>
//                       </td>

//                       {/* 2. Invoice Info */}
//                       <td className="px-4 py-3 whitespace-nowrap border-r border-gray-100">
//                         <div className="flex items-center gap-1 text-sm font-semibold text-blue-700">
//                           <FileText size={14} /> {entry.invoice_number}
//                         </div>
//                         <div className="text-xs text-gray-500 mt-1">{entry.material_type || <span className="text-gray-300 italic">No material</span>}</div>
//                       </td>

//                       {/* 3. Vehicle & Driver */}
//                       <td className="px-4 py-3 border-r border-gray-100">
//                         <div className="text-sm font-bold text-gray-900">{entry.vehicle?.vehicle_number}</div>
//                         <div className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
//                           <User size={12} /> {entry.driver?.driver_name}
//                         </div>
//                         <div className="text-[10px] text-gray-400 mt-0.5">{entry.vehicle?.vehicle_short_code}</div>
//                       </td>

//                       {/* 4. Route Details */}
//                       <td className="px-4 py-3 border-r border-gray-100">
//                         <div className="flex items-center gap-1 text-sm text-gray-800 mb-1">
//                           <MapPin size={14} className="text-gray-400" />
//                           {entry.fromCity?.city_name || '-'} <span className="text-gray-400 mx-1">→</span> {entry.toCity?.city_name || '-'}
//                         </div>
//                         <div className="flex gap-2 text-xs text-gray-500">
//                           {entry.km && <span className="bg-gray-100 px-1.5 rounded">{entry.km} km</span>}
//                           {entry.route?.route_code && <span className="bg-blue-50 text-blue-600 px-1.5 rounded border border-blue-100">{entry.route.route_code}</span>}
//                         </div>
//                       </td>

//                       {/* 5. Main Fuel */}
//                       <td className="px-4 py-3 border-r border-gray-100 whitespace-nowrap">
//                         <div className="text-lg font-bold text-gray-900">{entry.diesel_qty} <span className="text-xs font-normal text-gray-500">L</span></div>
//                         <div className="text-xs text-gray-500">{entry.pump?.pump_name || 'Unknown Pump'}</div>
//                       </td>

//                       {/* 6. Extra Diesel */}
//                       <td className="px-4 py-3 border-r border-gray-100">
//                         {entry.extra_diesel_qty > 0 ? (
//                           <div className="space-y-1">
//                             <div className="text-sm font-bold text-orange-700 bg-orange-100 inline-block px-2 py-0.5 rounded">
//                               +{entry.extra_diesel_qty}L
//                             </div>
//                             <div className="text-[10px] text-gray-600 leading-tight max-w-[120px]">
//                               <span className="font-semibold">Reason:</span> {entry.extraRemark?.remark_text || 'N/A'}
//                             </div>
//                             <div className="text-[10px] text-gray-600 leading-tight">
//                               <span className="font-semibold">By:</span> {entry.approver?.approver_name || 'N/A'}
//                             </div>
//                           </div>
//                         ) : (
//                           <span className="text-gray-300 text-sm">-</span>
//                         )}
//                       </td>

//                       {/* 7. Financials */}
//                       <td className="px-4 py-3 border-r border-gray-100">
//                         <div className="space-y-1 text-xs">
//                           <div className="flex justify-between gap-2">
//                             <span className="text-gray-500">Advance:</span>
//                             <span className="font-medium text-gray-900">₹{Number(entry.trip_advance_amount).toLocaleString('en-IN')}</span>
//                           </div>
//                           <div className="flex justify-between gap-2">
//                             <span className="text-gray-500">Fooding:</span>
//                             <span className="font-medium text-gray-900">₹{Number(entry.fooding_amount).toLocaleString('en-IN')}</span>
//                           </div>
//                           <div className="flex justify-between gap-2">
//                             <span className="text-gray-500">Load/Unld:</span>
//                             <span className="font-medium text-gray-900">₹{Number(entry.loading_unloading_amount).toLocaleString('en-IN')}</span>
//                           </div>
//                         </div>
//                       </td>

//                       {/* 8. Deductions */}
//                       <td className="px-4 py-3 border-r border-gray-100 whitespace-nowrap">
//                         {entry.cut_diesel_qty > 0 ? (
//                            <div className="text-sm font-medium text-red-600 flex items-center gap-1">
//                              <AlertCircle size={14} /> {entry.cut_diesel_qty}L Cut
//                            </div>
//                         ) : (
//                            <span className="text-gray-300 text-sm">-</span>
//                         )}
//                       </td>

//                       {/* 9. Status */}
//                       <td className="px-4 py-3 border-r border-gray-100 whitespace-nowrap">
//                         <div className="flex flex-col gap-1">
//                           <span className={`px-2 py-0.5 text-xs font-bold rounded-full w-fit ${
//                             entry.trip_status === 'Loaded' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
//                           }`}>
//                             {entry.trip_status}
//                           </span>
//                           <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full w-fit ${
//                             entry.is_new_trip ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
//                           }`}>
//                             {entry.is_new_trip ? 'New Trip' : 'Past Trip'}
//                           </span>
//                         </div>
//                       </td>

//                       {/* 10. Remarks & Meta */}
//                       <td className="px-4 py-3">
//                         <div className="text-xs text-gray-600 max-w-[200px] break-words italic" title={entry.remarks}>
//                           {entry.remarks || <span className="text-gray-300">No remarks</span>}
//                         </div>
//                         <div className="text-[10px] text-gray-400 mt-2">
//                           By: {entry.created_by || 'System'}
//                         </div>
//                       </td>

//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
          
//           {/* Footer */}
//           <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
//             <div className="text-sm text-gray-500">
//               Total Records: <span className="font-bold text-gray-900">{filteredEntries.length}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AllEntries;
