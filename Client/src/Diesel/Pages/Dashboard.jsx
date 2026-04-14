import React from 'react';
import { 
  Truck, DollarSign, Users, Fuel, 
  TrendingUp 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';

const statCards = [
  { title: "Fleet Composition", value: "324 TOTAL", sub: "142 Own | 182 Attached", icon: Truck, color: "blue" },
  { title: "Fleet Categories", value: "2 Types ACTIVE", sub: "210 Container | 114 Bulker", icon: Users, color: "emerald" },
  { title: "Daily Fuel Spend", value: "₹14,250", trend: "+2.1%", icon: DollarSign, color: "rose" },
  { title: "Monthly Fuel Spend", value: "₹4,23,500", trend: "+3.4%", icon: DollarSign, color: "violet" },
];

const breakEvenData = [
  { day: "Mon", revenue: 22500, fuel: 13500, opex: 8000 },
  { day: "Tue", revenue: 21000, fuel: 14800, opex: 7500 },
  { day: "Wed", revenue: 30000, fuel: 28000, opex: 11000 },
  { day: "Thu", revenue: 24500, fuel: 16500, opex: 9200 },
  { day: "Fri", revenue: 29000, fuel: 21000, opex: 10500 },
  { day: "Sat", revenue: 18500, fuel: 12500, opex: 6800 },
  { day: "Sun", revenue: 16200, fuel: 9800, opex: 6200 },
];

const consumptionTrend = [
  { date: "07 May", consumption: 12400 },
  { date: "14 May", consumption: 13800 },
  { date: "21 May", consumption: 17200 },
  { date: "28 May", consumption: 15800 },
  { date: "31 May", consumption: 14200 },
];

const topVehicles = [
  { vehicle: "V-221", qty: 1450 },
  { vehicle: "V-405", qty: 1230 },
  { vehicle: "V-102", qty: 1040 },
  { vehicle: "V-056", qty: 870 },
  { vehicle: "V-304", qty: 650 },
];

const highRisk = [
  { id: "V-221", driver: "John Miller", pending: 288, date: "22 May 2024" },
  { id: "V-405", driver: "Sarah Chen", pending: 242, date: "23 May 2024" },
  { id: "V-112", driver: "Mike Ross", pending: 210, date: "20 May 2024" },
];

const sourceData = [
  { name: "Main Depot A", value: 75, color: "#3b82f6" },
  { name: "East Station", value: 25, color: "#10b981" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
                <p className="text-sm text-gray-600 mt-1">{card.sub}</p>
              </div>
              <div className={`p-3 rounded-xl bg-${card.color}-50`}>
                <card.icon className={`text-${card.color}-600`} size={28} />
              </div>
            </div>
            {card.trend && (
              <div className="mt-4 flex items-center gap-1 text-emerald-600 text-sm">
                <TrendingUp size={16} /> {card.trend} this month
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Break-even Analysis */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border">
        <h2 className="text-xl font-semibold mb-6">Operational Break-even Analysis</h2>
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={breakEvenData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} name="REVENUE" />
            <Line type="monotone" dataKey="fuel" stroke="#ef4444" strokeWidth={3} name="FUEL COST" />
            <Line type="monotone" dataKey="opex" stroke="#6b7280" strokeWidth={2} name="OTHER OPEX" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Section - 30 Day Trend + Pie + Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* 30-Day Fuel Consumption Trend */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">30-Day Fuel Consumption Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={consumptionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="natural" dataKey="consumption" stroke="#3b82f6" strokeWidth={4} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Consumption by Source */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">Consumption by Source</h2>
          <div className="flex flex-col md:flex-row items-center gap-10">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value">
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-6">
              {sourceData.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-2xl font-bold">{item.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 10 Vehicles & High Risk */}
        <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 10 Vehicles */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-6">Top 10 Vehicles by Consumption (L)</h2>
            <div className="space-y-5">
              {topVehicles.map((v, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 text-right font-mono text-sm text-gray-500">{v.vehicle}</div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(v.qty / 1450) * 100}%` }} />
                  </div>
                  <div className="w-16 font-semibold text-right">{v.qty}</div>
                </div>
              ))}
            </div>
          </div>

          {/* High Risk Vehicles */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">High Risk Vehicles (Pending &gt; 200L)</h2>
              <span className="text-blue-600 text-sm cursor-pointer hover:underline">View All →</span>
            </div>
            <div className="space-y-4">
              {highRisk.map((v, i) => (
                <div key={i} className="flex justify-between items-center bg-red-50 p-4 rounded-2xl">
                  <div>
                    <p className="font-semibold">{v.id}</p>
                    <p className="text-sm text-gray-600">{v.driver}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 font-bold text-lg">{v.pending} L</p>
                    <p className="text-xs text-gray-500">{v.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}