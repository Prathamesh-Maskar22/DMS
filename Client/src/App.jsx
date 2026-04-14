import { Routes, Route } from 'react-router-dom';
import LoginPage from './Login/Login';
import Dashboard from './Diesel/Pages/Dashboard';
import FuelEntry from './Diesel/Pages/FuelEntry';
import AppLayout from './components/Layout';
import NotFoundWIP from './components/NotFound';
import AllEntries from './Diesel/Pages/AllEntries';
import VehicleMaster from './Diesel/Pages/VehicleMaster';
import Logout from './components/Logout';
import DriverMaster from './Diesel/Pages/DriverMaster';
import CityMaster from './Diesel/Pages/CityMaster';
import PumpMaster from './Diesel/Pages/PumpMaster';
import CustomerMaster from './Diesel/Pages/CustomerMaster';
import ExtraRemarkMaster from './Diesel/Pages/ExtraRemarkMaster';
import ApproverMaster from './Diesel/Pages/ApproverMaster';
import RouteMaster from './Diesel/Pages/RouteMaster';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<Logout />} />
        <Route element={<AppLayout></AppLayout>}>
          <Route path="/dashboard" element={<Dashboard></Dashboard>} />
          <Route path="/fuel-entry" element={<FuelEntry></FuelEntry>} />
          <Route path="/all-entry" element={<AllEntries></AllEntries>} />
          <Route path="/vehicles-master" element={<VehicleMaster></VehicleMaster>} />
          <Route path="/drivers-master" element={<DriverMaster></DriverMaster>} />

          <Route path="/city-master" element={<CityMaster></CityMaster>} />
          <Route path="/pump-master" element={<PumpMaster></PumpMaster>} />
          <Route path="/customer-master" element={<CustomerMaster></CustomerMaster>} />
          <Route path="/extra-remark-master" element={<ExtraRemarkMaster />} />
          <Route path="/approver-master" element={<ApproverMaster />} />
          <Route path="/route-master" element={<RouteMaster />} />
          {/* Catch-all route for 404s */}
          <Route path="*" element={<NotFoundWIP></NotFoundWIP>} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;