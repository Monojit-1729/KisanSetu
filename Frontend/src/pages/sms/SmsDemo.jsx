import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import smsApi from '../../api/smsApi.js';

export const SmsDemo = () => {
  const [phone, setPhone] = useState('+91 98230 11223');
  const [inputMessage, setInputMessage] = useState('SELL 2000 TOMATO');
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'system',
      text: 'KisanSetu SMS Gateway connected.\nRegistered Phone: +91 98230 11223 (Ramesh Patel)\nTry sending "SELL 2000 TOMATO" or "HELP".',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [demoFarmers, setDemoFarmers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    smsApi.getDemoPhones().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setDemoFarmers(data);
      }
    }).catch((e) => console.warn('Could not load demo phones:', e.message));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const msg = (textToSend || inputMessage).trim();
    if (!msg || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await smsApi.simulateSms({
        phone,
        message: msg,
      });

      const responseText = res.response || (res.success ? 'Message acknowledged.' : res.error || 'No reply.');

      const kisanMsg = {
        id: `kisan-${Date.now()}`,
        sender: 'kisan',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        success: res.success,
      };

      setMessages((prev) => [...prev, kisanMsg]);
    } catch (err) {
      const errMsg = {
        id: `err-${Date.now()}`,
        sender: 'kisan',
        text: err.response?.data?.error || err.message || 'SMS transmission failed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCommand = (cmd) => {
    setInputMessage(cmd);
    handleSend(cmd);
  };

  const clearChat = () => {
    setMessages([
      {
        id: `clear-${Date.now()}`,
        sender: 'system',
        text: `SMS log cleared for ${phone}. Send "SELL 2000 TOMATO" or "HELP" to start.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-lg shadow-emerald-500/20">
                KS
              </div>
              <div>
                <span className="font-bold text-white text-lg leading-tight block tracking-tight">KisanSetu</span>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  A8 SMS Feature-Phone Channel
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex items-center space-x-3">
            <Link
              to="/farmer/dashboard"
              className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Farmer Web Portal
            </Link>
            <Link
              to="/"
              className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Experience */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Conceptual Overview & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Inclusive Rural Access
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Feature-Phone SMS Engine
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Enables 60%+ of rural smallholder farmers who lack smartphones or 4G data to access KisanSetu’s transparent APMC mandi prices, net realization calculations, and direct buyer matches using standard 2G SMS.
            </p>

            {/* Workflow steps */}
            <div className="mt-5 space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                <div>
                  <span className="font-semibold text-slate-200 block">Register Once</span>
                  <span className="text-slate-400 text-[11px]">Farmer mobile linked to their profile & district location.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                <div>
                  <span className="font-semibold text-slate-200 block">Send Simple Keyword</span>
                  <span className="text-slate-400 text-[11px]">Send <code>SELL 2000 TOMATO</code> to KisanSetu gateway.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                <div>
                  <span className="font-semibold text-slate-200 block">Receive Net-Realization & Buyers</span>
                  <span className="text-slate-400 text-[11px]">Actual APMC rates, freight deductions, and top buyer options.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                <div>
                  <span className="font-semibold text-slate-200 block">Confirm with Single Letter</span>
                  <span className="text-slate-400 text-[11px]">Reply <code>BUY A</code> to lock intent and initiate dispatch.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sender Phone Selector & Settings */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 backdrop-blur-sm space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Simulated Sender Phone
            </h3>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Select Demo Farmer Account</label>
              <select
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
              >
                <option value="+91 98230 11223">Ramesh Patel (Farmer — Nashik) [+91 98230 11223]</option>
                <option value="+91 98220 44556">Sahyadri FPO Lead [+91 98220 44556]</option>
                <option value="+91 99999 00000">Unregistered Test Phone [+91 99999 00000]</option>
                {demoFarmers.map((df) => (
                  <option key={df.id} value={df.phone}>
                    {df.name} [{df.phone}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Or Enter Custom Mobile Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98230 11223"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick Demo Action Buttons */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Test Commands
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleQuickCommand('SELL 2000 TOMATO')}
                  className="text-xs font-semibold bg-slate-900 hover:bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  SELL 2000 TOMATO
                </button>
                <button
                  onClick={() => handleQuickCommand('SELL 500 ONION')}
                  className="text-xs font-semibold bg-slate-900 hover:bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  SELL 500 ONION
                </button>
                <button
                  onClick={() => handleQuickCommand('BUY A')}
                  className="text-xs font-semibold bg-slate-900 hover:bg-amber-950/60 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  BUY A
                </button>
                <button
                  onClick={() => handleQuickCommand('HELP')}
                  className="text-xs font-semibold bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  HELP
                </button>
                <button
                  onClick={() => handleQuickCommand('SELL ABC TOMATO')}
                  className="text-xs font-semibold bg-slate-900 hover:bg-rose-950/60 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Invalid Qty Test
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Phone Device Frame */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-md bg-slate-950 border-4 border-slate-800 rounded-[2.5rem] shadow-2xl p-4 sm:p-5 flex flex-col h-[650px] relative overflow-hidden">
            {/* Phone Speaker & Notch */}
            <div className="flex justify-center mb-3">
              <div className="w-16 h-1 bg-slate-800 rounded-full" />
            </div>

            {/* Phone Status Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800/80 px-1 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400">📶</span>
                <span className="font-semibold text-slate-300">KISANSETU GSM</span>
              </div>
              <div className="flex items-center gap-2">
                <span>2G</span>
                <span>🔋 94%</span>
              </div>
            </div>

            {/* Sender / Contact Title */}
            <div className="py-2 px-1 flex items-center justify-between border-b border-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  KS
                </div>
                <div>
                  <span className="font-bold text-xs text-white block leading-tight">KisanSetu Gateway</span>
                  <span className="text-[10px] text-slate-500 font-mono">51234 (Shortcode)</span>
                </div>
              </div>
              <button
                onClick={clearChat}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                title="Clear Messages"
              >
                Clear Log
              </button>
            </div>

            {/* Conversation Message Feed */}
            <div className="flex-1 overflow-y-auto py-3 px-1 space-y-3 font-sans text-xs scrollbar-thin scrollbar-thumb-slate-800">
              {messages.map((m) => {
                if (m.sender === 'system') {
                  return (
                    <div key={m.id} className="text-center my-2">
                      <span className="bg-slate-900 border border-slate-800 text-[10px] text-slate-400 px-3 py-1 rounded-full inline-block font-mono">
                        {m.text}
                      </span>
                    </div>
                  );
                }

                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm whitespace-pre-wrap leading-relaxed ${
                        isUser
                          ? 'bg-emerald-600 text-white rounded-br-none font-semibold'
                          : m.isError
                          ? 'bg-rose-950/80 border border-rose-800 text-rose-200 rounded-bl-none font-mono text-[11px]'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none font-mono text-[11px]'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[9px] text-slate-600 mt-1 px-1 font-mono">
                      {m.timestamp} {isUser ? '• Sent' : '• Received'}
                    </span>
                  </div>
                );
              })}

              {loading && (
                <div className="flex flex-col items-start">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none px-3.5 py-2.5 text-slate-400 text-xs flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[10px] font-mono text-slate-500">Processing via Intelligence Engine...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="pt-2 border-t border-slate-800/80 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type SMS e.g. SELL 2000 TOMATO"
                disabled={loading}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 font-mono outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
              >
                <span>Send</span>
                <span>➔</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SmsDemo;
