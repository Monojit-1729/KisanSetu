import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

export const Home = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">
              KS
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-tight block">KisanSetu</span>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">SIH Problem Statement 26132</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Link
                to={`/${user?.role}/dashboard`}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
              >
                Go to {user?.role?.toUpperCase()} Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Phase 1.1: Authentication & Role System Foundation Active
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Strengthening Market Linkages & Price Discovery for Farmers
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          An explainable, cost-aware agricultural intelligence platform connecting Farmers, FPOs, and Buyers with transparent net realisation calculations.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
          >
            Register as Participant
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-xs transition-colors"
          >
            Access Portal Sign In
          </Link>
          <Link
            to="/sms"
            className="px-6 py-3 text-sm font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>📱</span> Keypad SMS Simulator
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Farmer
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-3">Individual Producers</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Transparent mandi prices, explainable net realisation scoring, and direct buyer match opportunities.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
              FPO
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-3">Farmer Producer Orgs</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Aggregate member produce, achieve scale advantages, and negotiate direct institutional procurement contracts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
              Buyer
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-3">Commercial Buyers</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Post verified demand requirements, discover quality-graded supply lots, and establish direct traceability.
            </p>
          </div>
        </div>

        {/* Feature-Phone SMS Accessibility Card */}
        <div className="mt-8 bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-5 text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full mb-1">
              <span>📶</span> Feature-Phone 2G SMS Channel
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              No Smartphone? Access KisanSetu via Basic 2G SMS
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Farmers can send simple text keywords like <code>SELL 2000 TOMATO</code> from any keypad phone to receive transparent APMC rates, freight deductions, net realization, and suitable buyers.
            </p>
          </div>
          <Link
            to="/sms"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors whitespace-nowrap shadow-sm shrink-0"
          >
            Open SMS Simulator →
          </Link>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        KisanSetu — Smart India Hackathon 2026 (Problem Statement 26132)
      </footer>
    </div>
  );
};

export default Home;
