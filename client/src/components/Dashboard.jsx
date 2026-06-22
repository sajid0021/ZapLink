import { useState, useEffect } from "react";
import { Zap, Shield, BarChart3, X, Globe, Laptop, Compass, Link2, Calendar, Clock, Loader2, ExternalLink, Copy, Check } from "lucide-react";
import UrlForm from "./UrlForm";
import API from "../services/api";

const CustomLogo = ({ size = 24, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="4.5" fill="none" strokeLinecap="butt" strokeLinejoin="miter" className={className}>
    <path d="M 9 2 L 19 12 L 15 16" />
    <path d="M 15 22 L 5 12 L 9 8" />
  </svg>
);

const Dashboard = () => {
  const [selectedCode, setSelectedCode] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [statsCopied, setStatsCopied] = useState(false);

  useEffect(() => {
    if (!selectedCode) {
      setStatsData(null);
      return;
    }

    const fetchStats = async () => {
      setLoadingStats(true);
      setStatsError("");
      try {
        const response = await API.get(`/url/${selectedCode}/stats`);
        setStatsData(response.data);
      } catch (err) {
        console.error(err);
        setStatsError(
          err.response?.data?.message || "Failed to load statistics for this link."
        );
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [selectedCode]);

  const handleStatsCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatsCopied(true);
      setTimeout(() => setStatsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const renderStatBars = (itemsObj, total) => {
    if (!itemsObj || Object.keys(itemsObj).length === 0) {
      return <p className="text-xs text-slate-500 italic">No data recorded yet.</p>;
    }

    const sortedItems = Object.entries(itemsObj)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return (
      <div className="space-y-3">
        {sortedItems.slice(0, 5).map((item, idx) => {
          const percent = total > 0 ? ((item.count / total) * 100).toFixed(0) : 0;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-medium truncate max-w-[70%]">{item.name}</span>
                <span className="text-slate-600 font-semibold">{item.count} ({percent}%)</span>
              </div>
              <div className="w-full bg-white/80 h-1.5 rounded-full overflow-hidden border border-slate-200/50">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      {/* Header / Navigation */}
      <header className="w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <CustomLogo size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-500 bg-clip-text text-transparent tracking-tight">
              ZapLink
            </span>
          </div>

        </div>
      </header>

      {/* Main Hero & URL Shortener Section */}
      <main className="flex-grow flex flex-col justify-center max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-16 z-10">
        
        {/* Hero Copy */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider">
            <CustomLogo size={14} className="text-purple-400" />
            <span>Powering instant redirection</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none">
            Shorten. Share.{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Elevate
            </span>{" "}
            your links.
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed font-normal">
            A lightning-fast, premium URL shortener backed by MongoDB. Generate instantly shareable, clean short links in one click.
          </p>
        </div>

        {/* Shortener UI Form */}
        <UrlForm onViewStats={(code) => setSelectedCode(code)} />

        {/* Feature Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-slate-200 transition-all duration-300 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <CustomLogo size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Instant Shortening</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              No delay. Paste your long URL and receive a clean, optimized redirect link within milliseconds.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-slate-200 transition-all duration-300 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Shield size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Secure & Persistent</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              All URL mappings are securely stored inside MongoDB databases, ensuring reliability and continuous uptime.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-slate-200 transition-all duration-300 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <BarChart3 size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Custom Redirection</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Redirect traffic seamlessly from short codes directly to target destinations through local routing services.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-slate-200/80 bg-slate-50/40 text-center text-xs text-slate-500 z-10">
        <p>© {new Date().getFullYear()} ZapLink. Built with React, Tailwind CSS, Express, and MongoDB.</p>
      </footer>

      {/* Slide-over Analytics Panel */}
      {selectedCode && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-50/85 backdrop-blur-sm transition-opacity" 
            onClick={() => setSelectedCode(null)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-2xl bg-white/95 border-l border-slate-200 shadow-xl backdrop-blur-xl flex flex-col h-full z-10 animate-slide-in">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Link Analytics</h2>
                  <p className="text-xs text-slate-600">Detailed performance insights</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCode(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingStats ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <Loader2 size={36} className="text-purple-500 animate-spin" />
                  <span className="text-sm text-slate-600 font-medium">Fetching stats...</span>
                </div>
              ) : statsError ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  ⚠️ {statsError}
                </div>
              ) : statsData ? (
                <>
                  {/* Summary Block */}
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Destination URL</span>
                      <a 
                        href={statsData.urlDetails.longUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-purple-400 hover:underline flex items-center gap-1.5 truncate font-medium mt-0.5"
                      >
                        {statsData.urlDetails.longUrl}
                        <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-200/60">
                      <div>
                        <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold block mb-0.5">Short Link</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">
                            {`${window.location.origin || "http://localhost:5173"}/api/url/${statsData.urlDetails.shortCode}`}
                          </span>
                          <button
                            onClick={() => handleStatsCopy(`${window.location.origin || "http://localhost:5173"}/api/url/${statsData.urlDetails.shortCode}`)}
                            className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded cursor-pointer transition-colors"
                          >
                            {statsCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/50">
                        <Calendar size={13} />
                        <span>Created: {new Date(statsData.urlDetails.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Clicks Counter Banner */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-gradient-to-br from-purple-900/10 to-indigo-900/10 border border-purple-500/15 rounded-2xl flex flex-col justify-between">
                      <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">Total Clicks</span>
                      <span className="text-4xl font-extrabold text-slate-900 mt-2">
                        {statsData.urlDetails.totalClicks}
                      </span>
                    </div>

                    <div className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider text-slate-600">Recent Activity</span>
                      <span className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {statsData.recentClicks.length > 0 ? (
                          <>
                            Last click logged from <span className="font-semibold text-slate-700">{statsData.recentClicks[0].country}</span> using <span className="font-semibold text-slate-700">{statsData.recentClicks[0].browser}</span>.
                          </>
                        ) : (
                          "No redirect activity recorded yet for this shortcode."
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Aggregated Breakdowns */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2">Traffic Insights</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Countries Card */}
                      <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <Globe size={14} className="text-purple-400" />
                          <span>Top Countries</span>
                        </h4>
                        {renderStatBars(statsData.stats.countries, statsData.urlDetails.totalClicks)}
                      </div>

                      {/* Referrers Card */}
                      <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <Link2 size={14} className="text-indigo-400" />
                          <span>Top Referrers</span>
                        </h4>
                        {renderStatBars(statsData.stats.referrers, statsData.urlDetails.totalClicks)}
                      </div>

                      {/* Browsers Card */}
                      <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <Compass size={14} className="text-pink-400" />
                          <span>Top Browsers</span>
                        </h4>
                        {renderStatBars(statsData.stats.browsers, statsData.urlDetails.totalClicks)}
                      </div>

                      {/* Devices Card */}
                      <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <Laptop size={14} className="text-emerald-400" />
                          <span>Top Devices</span>
                        </h4>
                        {renderStatBars(statsData.stats.devices, statsData.urlDetails.totalClicks)}
                      </div>
                    </div>
                  </div>

                  {/* Recent Click Table/Logs */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2">Recent Click Logs</h3>
                    
                    {statsData.recentClicks.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No clicks logged yet.</p>
                    ) : (
                      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-slate-50">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                              <th className="py-2.5 px-4">Time</th>
                              <th className="py-2.5 px-4">Country</th>
                              <th className="py-2.5 px-4">Device/Browser</th>
                              <th className="py-2.5 px-4">Referrer</th>
                              <th className="py-2.5 px-4">IP</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {statsData.recentClicks.map((click, cIdx) => (
                              <tr key={cIdx} className="hover:bg-slate-50 transition-colors">
                                <td className="py-2.5 px-4 whitespace-nowrap text-slate-500 font-medium">
                                  {new Date(click.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="py-2.5 px-4 whitespace-nowrap font-medium text-slate-800">
                                  {click.country}
                                </td>
                                <td className="py-2.5 px-4 whitespace-nowrap">
                                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded mr-1.5 text-[9px] uppercase font-bold tracking-wider">
                                    {click.device}
                                  </span>
                                  <span className="text-slate-700">
                                    {click.browser}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 truncate max-w-[120px] text-slate-600" title={click.referrer}>
                                  {click.referrer}
                                </td>
                                <td className="py-2.5 px-4 whitespace-nowrap text-slate-500 font-mono">
                                  {click.ip}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-slate-500 text-sm font-medium">
                  Select a link to view analytics.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
