import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import Home from '../pages/Home.jsx';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';
import FarmerDashboard from '../pages/farmer/FarmerDashboard.jsx';
import FarmerProfile from '../pages/farmer/FarmerProfile.jsx';
import FpoDashboard from '../pages/fpo/FpoDashboard.jsx';
import FpoProfile from '../pages/fpo/FpoProfile.jsx';
import BuyerDashboard from '../pages/buyer/BuyerDashboard.jsx';
import BuyerProfile from '../pages/buyer/BuyerProfile.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import LotList from '../pages/marketplace/LotList.jsx';
import LotDetail from '../pages/marketplace/LotDetail.jsx';
import CreateLot from '../pages/marketplace/CreateLot.jsx';
import MyLots from '../pages/marketplace/MyLots.jsx';
import MarketIntelligence from '../pages/marketplace/MarketIntelligence.jsx';
import PostDemand from '../pages/buyer/PostDemand.jsx';
import MyDemands from '../pages/buyer/MyDemands.jsx';
import MatchedSupply from '../pages/buyer/MatchedSupply.jsx';
import BrowseLots from '../pages/buyer/BrowseLots.jsx';

// Generic dashboard dispatcher based on authenticated role
const DashboardDispatcher = () => {
  const { user } = useAuth();
  if (!user?.role) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={`/${user.role}/dashboard`} replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated Catch-all Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardDispatcher />
          </ProtectedRoute>
        }
      />

      {/* Role-Protected Dashboards & Profiles */}
      <Route
        path="/farmer/dashboard"
        element={
          <RoleRoute allowedRoles={['farmer']}>
            <FarmerDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/farmer/profile"
        element={
          <RoleRoute allowedRoles={['farmer']}>
            <FarmerProfile />
          </RoleRoute>
        }
      />

      <Route
        path="/fpo/dashboard"
        element={
          <RoleRoute allowedRoles={['fpo']}>
            <FpoDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/fpo/profile"
        element={
          <RoleRoute allowedRoles={['fpo']}>
            <FpoProfile />
          </RoleRoute>
        }
      />

      <Route
        path="/buyer/dashboard"
        element={
          <RoleRoute allowedRoles={['buyer']}>
            <BuyerDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/buyer/profile"
        element={
          <RoleRoute allowedRoles={['buyer']}>
            <BuyerProfile />
          </RoleRoute>
        }
      />
      <Route
        path="/buyer/demand/create"
        element={
          <RoleRoute allowedRoles={['buyer']}>
            <PostDemand />
          </RoleRoute>
        }
      />
      <Route
        path="/buyer/demands"
        element={
          <RoleRoute allowedRoles={['buyer']}>
            <MyDemands />
          </RoleRoute>
        }
      />
      <Route
        path="/buyer/demands/:demandId/matches"
        element={
          <RoleRoute allowedRoles={['buyer']}>
            <MatchedSupply />
          </RoleRoute>
        }
      />
      <Route
        path="/buyer/supply"
        element={
          <RoleRoute allowedRoles={['buyer']}>
            <BrowseLots />
          </RoleRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleRoute>
        }
      />

      {/* Marketplace — all authenticated users */}
      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <LotList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketplace/intelligence"
        element={
          <ProtectedRoute>
            <MarketIntelligence />
          </ProtectedRoute>
        }
      />
      {/* Marketplace write routes — farmer/FPO only */}
      <Route
        path="/marketplace/create"
        element={
          <RoleRoute allowedRoles={['farmer', 'fpo']}>
            <CreateLot />
          </RoleRoute>
        }
      />
      <Route
        path="/marketplace/my-lots"
        element={
          <RoleRoute allowedRoles={['farmer', 'fpo']}>
            <MyLots />
          </RoleRoute>
        }
      />

      {/* Dynamic lot detail route */}
      <Route
        path="/marketplace/:id"
        element={
          <ProtectedRoute>
            <LotDetail />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
