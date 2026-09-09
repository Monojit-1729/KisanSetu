import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import Home from '../pages/Home.jsx';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';

// Code-split heavy routes with React.lazy
const FarmerDashboard = lazy(() => import('../pages/farmer/FarmerDashboard.jsx'));
const FarmerProfile = lazy(() => import('../pages/farmer/FarmerProfile.jsx'));
const FpoDashboard = lazy(() => import('../pages/fpo/FpoDashboard.jsx'));
const FpoProfile = lazy(() => import('../pages/fpo/FpoProfile.jsx'));
const BuyerDashboard = lazy(() => import('../pages/buyer/BuyerDashboard.jsx'));
const BuyerProfile = lazy(() => import('../pages/buyer/BuyerProfile.jsx'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard.jsx'));
const LotList = lazy(() => import('../pages/marketplace/LotList.jsx'));
const LotDetail = lazy(() => import('../pages/marketplace/LotDetail.jsx'));
const CreateLot = lazy(() => import('../pages/marketplace/CreateLot.jsx'));
const MyLots = lazy(() => import('../pages/marketplace/MyLots.jsx'));
const MarketIntelligence = lazy(() => import('../pages/marketplace/MarketIntelligence.jsx'));
const MarketAnalytics = lazy(() => import('../pages/marketplace/MarketAnalytics.jsx'));
const FarmerMarketIntelligence = lazy(() => import('../pages/farmer/MarketIntelligence.jsx'));
const Recommendations = lazy(() => import('../pages/farmer/Recommendations.jsx'));
const PostDemand = lazy(() => import('../pages/buyer/PostDemand.jsx'));
const MyDemands = lazy(() => import('../pages/buyer/MyDemands.jsx'));
const MatchedSupply = lazy(() => import('../pages/buyer/MatchedSupply.jsx'));
const BrowseLots = lazy(() => import('../pages/buyer/BrowseLots.jsx'));
const FarmerOffers = lazy(() => import('../pages/farmer/Offers.jsx'));
const FpoOffers = lazy(() => import('../pages/fpo/Offers.jsx'));
const BuyerOffers = lazy(() => import('../pages/buyer/Offers.jsx'));
const FarmerOrders = lazy(() => import('../pages/farmer/FarmerOrders.jsx'));
const FpoOrders = lazy(() => import('../pages/fpo/FpoOrders.jsx'));
const BuyerOrders = lazy(() => import('../pages/buyer/BuyerOrders.jsx'));
const OrderDetails = lazy(() => import('../pages/orders/OrderDetails.jsx'));
const SmsDemo = lazy(() => import('../pages/sms/SmsDemo.jsx'));

// Route loading fallback
const RouteLoadingSpinner = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50/50">
    <div className="flex items-center space-x-3 bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-xs">
      <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm font-medium text-slate-700">Loading KisanSetu...</span>
    </div>
  </div>
);

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
    <Suspense fallback={<RouteLoadingSpinner />}>
      <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/sms" element={<SmsDemo />} />
      <Route path="/sms-demo" element={<SmsDemo />} />

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
        path="/farmer/market-intelligence"
        element={
          <RoleRoute allowedRoles={['farmer', 'fpo']}>
            <FarmerMarketIntelligence />
          </RoleRoute>
        }
      />
      <Route
        path="/farmer/recommendations"
        element={
          <RoleRoute allowedRoles={['farmer', 'fpo']}>
            <Recommendations />
          </RoleRoute>
        }
      />
      <Route
        path="/farmer/offers"
        element={
          <RoleRoute allowedRoles={['farmer', 'fpo']}>
            <FarmerOffers />
          </RoleRoute>
        }
      />
      <Route
        path="/farmer/orders"
        element={
          <RoleRoute allowedRoles={['farmer', 'fpo']}>
            <FarmerOrders />
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
        path="/fpo/market-intelligence"
        element={
          <RoleRoute allowedRoles={['farmer', 'fpo']}>
            <FarmerMarketIntelligence />
          </RoleRoute>
        }
      />
      <Route
        path="/fpo/recommendations"
        element={
          <RoleRoute allowedRoles={['farmer', 'fpo']}>
            <Recommendations />
          </RoleRoute>
        }
      />
      <Route
        path="/fpo/offers"
        element={
          <RoleRoute allowedRoles={['fpo']}>
            <FpoOffers />
          </RoleRoute>
        }
      />
      <Route
        path="/fpo/orders"
        element={
          <RoleRoute allowedRoles={['fpo']}>
            <FpoOrders />
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
        path="/buyer/offers"
        element={
          <RoleRoute allowedRoles={['buyer']}>
            <BuyerOffers />
          </RoleRoute>
        }
      />
      <Route
        path="/buyer/orders"
        element={
          <RoleRoute allowedRoles={['buyer']}>
            <BuyerOrders />
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
      <Route
        path="/marketplace/analytics"
        element={
          <ProtectedRoute>
            <MarketAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <MarketAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/analytics"
        element={
          <ProtectedRoute>
            <MarketAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fpo/analytics"
        element={
          <ProtectedRoute>
            <MarketAnalytics />
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

      {/* Shared Order Detail */}
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
};

export default AppRoutes;
