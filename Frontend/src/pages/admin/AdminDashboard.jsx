import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import adminApi from '../../api/adminApi.js';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    adminApi
      .getOverview()
      .then((res) => {
        if (isMounted) {
          setData(res?.data || null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load administration metrics');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-base sm:text-lg shadow-xs shrink-0">
              KS
            </div>
            <div>
              <span className="font-bold text-white text-base sm:text-lg leading-tight block">KisanSetu</span>
              <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider block sm:hidden">
                Admin Console
              </span>
              <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider hidden sm:block">
                System Administration Console
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-right hidden md:block">
              <div className="text-xs font-semibold text-slate-200">{user?.name}</div>
              <div className="text-[10px] text-slate-400">{user?.email}</div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-900 text-purple-200 border border-purple-700">
              Admin
            </span>
            <button
              onClick={logout}
              className="text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 mb-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                System Oversight Active
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Platform Administration Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Real-time registry statistics, participant verification health, and security telemetry.
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              Database: <span className="text-emerald-700 font-bold">● Active</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading platform telemetry...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6">
            {error}
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Total Accounts</span>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">
                  {data?.metrics?.totalUsers || 0}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {data?.metrics?.verifiedUsers || 0} verified participants
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 block">Farmer Accounts</span>
                <div className="text-3xl font-extrabold text-emerald-700 mt-1">
                  {data?.metrics?.farmers || 0}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {data?.profiles?.farmerProfiles || 0} agricultural profiles
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-700 block">FPO Collectives</span>
                <div className="text-3xl font-extrabold text-blue-700 mt-1">
                  {data?.metrics?.fpos || 0}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {data?.profiles?.fpoProfiles || 0} registered FPO profiles
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-700 block">Commercial Buyers</span>
                <div className="text-3xl font-extrabold text-amber-700 mt-1">
                  {data?.metrics?.buyers || 0}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {data?.profiles?.buyerProfiles || 0} procurement profiles
                </div>
              </div>
            </div>

            {/* System Status Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                  Security & Access Controls Status
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-700">Public Admin Registration Block</span>
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                      Enforced (HTTP 403)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-700">JWT Session Management</span>
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                      Active (7-Day Expiry)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-700">Role-Guarded Endpoint Authorization</span>
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                      Strict requireRole()
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-700">Password Hashing</span>
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                      bcryptjs (Salted 10 Rounds)
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                  Governance Roadmap (Phase 2 - 6)
                </h3>
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <strong className="text-slate-800 block">APMC Ingestion & Modal Rates (Phase 3)</strong>
                    <span>Automated feeds from Agmarknet / APMC Maharashtra for real-time benchmark pricing.</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <strong className="text-slate-800 block">KYC Verification & Trust Badges (Phase 4)</strong>
                    <span>Review farmer land records, FPO registration certificates, and commercial buyer GSTINs.</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <strong className="text-slate-800 block">Dispute Mediation & Auditing (Phase 6)</strong>
                    <span>Grievance escalation tracking and escrow settlement governance.</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
