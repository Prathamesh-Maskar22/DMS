import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Fuel,
  Truck,
  Users,
  FileText,
  Settings,
  Search,
  Menu,
  ChevronLeft,
  ReceiptText,
  LogOut,
  MapPin,
  Building,
  Route as RouteIcon,
  MessageSquare,
  UserCheck,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Fuel, label: 'Fuel Entry', path: '/fuel-entry' },
  { icon: ReceiptText, label: 'All Entries', path: '/all-entry' },

  // ==================== MASTERS ====================
  { icon: Truck, label: 'Vehicle Master', path: '/vehicles-master' },
  { icon: Users, label: 'Driver Master', path: '/drivers-master' },
  { icon: Fuel, label: 'Pump Master', path: '/pump-master' },
  { icon: MapPin, label: 'City Master', path: '/city-master' },
  { icon: Building, label: 'Customer Master', path: '/customer-master' },
  { icon: RouteIcon, label: 'Route Master', path: '/route-master' },
  { icon: MessageSquare, label: 'Extra Remarks', path: '/extra-remark-master' },
  { icon: UserCheck, label: 'Approvers', path: '/approver-master' },

  // { icon: FileText, label: 'Reports', path: '/reports' },
  // { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: LogOut, label: 'Logout', path: '/logout' },
];

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Persist collapse state
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed);
  }, [collapsed]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch { }
    }
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(p => p[0]).join("").toUpperCase();
  };

  const getPageTitle = () => {
    const current = navItems.find(item =>
      location.pathname.includes(item.path)
    );
    return current ? current.label : "Dashboard";
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">

      {/* Sidebar */}
      <aside
        className={`h-screen bg-white border-r border-gray-100 shadow-sm transition-all duration-300
        ${collapsed ? 'w-25' : 'w-64'}`}
      >
        {/* Logo */}
        <div className="px-3 pt-3 pb-4 border-b border-gray-100 flex items-center justify-center">
          <img
            src="/VGS-Logo.png"
            alt="logo"
            className={`transition-all duration-300 ${collapsed ? 'h-8' : 'h-10'
              }`}
          />
        </div>

        {/* Nav */}
        <nav className="mt-6 px-2 space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path}>
              {({ isActive }) => (
                <div className="relative group">

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                  )}

                  <div
                    className={`flex items-center ${collapsed ? 'justify-center' : ''
                      } px-3 py-3 rounded-xl text-gray-600 transition-all duration-200
                    hover:bg-blue-50 hover:text-blue-600
                    ${isActive
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : ''
                      }`}
                  >
                    <item.icon className="h-5 w-5" />

                    {!collapsed && (
                      <span className="ml-3 text-sm">{item.label}</span>
                    )}
                  </div>

                  {/* Tooltip */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2
                      whitespace-nowrap bg-gray-900 text-white text-xs px-3 py-1.5 rounded-md
                      opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg">
                      {item.label}
                    </div>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between">

          {/* Toggle */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <Menu /> : <ChevronLeft />}
          </button>

          {/* Title */}
          <h1 className="text-xl font-semibold text-black">
            {getPageTitle()}
          </h1>

          {/* Right Section */}
          <div className="flex items-center gap-4">

            {/* Profile */}
            <div className="relative group">
              <div className="flex items-center gap-3 px-4 py- rounded-2xl bg-white
    hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer">

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500
      flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {getInitials(user?.name)}
                </div>

                {/* Info */}
                <div className="leading-tight hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.name || "Guest User"}
                  </p>

                  <div className="flex items-center gap-2 ">
                    <span className="text-xs text-gray-500">
                      {user?.role || "No Role"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Optional Dropdown (future-ready) */}
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg
    opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">

                <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50" onClick={() => navigate("/logout")}>
                  Logout
                </button>
              </div>
            </div>

          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="bg-white border border-gray-100 shadow-sm py-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;