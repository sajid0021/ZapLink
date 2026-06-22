import { useState, useEffect } from "react";
import { Link2, ArrowRight, Copy, Check, Sparkles, Trash2, ExternalLink, BarChart3 } from "lucide-react";
import API from "../services/api";

const UrlForm = ({ onViewStats }) => {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  // Load history from local storage
  useEffect(() => {
    const savedHistory = localStorage.getItem("url_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setShortUrl("");

    // Automatically prepend protocol if missing
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    try {
      const response = await API.post("/url/shorten", {
        longUrl: targetUrl,
      });

      const newShortUrl = response.data.shortUrl;
      setShortUrl(newShortUrl);

      // Add to history
      const newHistoryItem = {
        id: Date.now(),
        longUrl: targetUrl,
        shortUrl: newShortUrl,
        date: new Date().toLocaleDateString(),
      };
      const updatedHistory = [newHistoryItem, ...history.slice(0, 4)];
      setHistory(updatedHistory);
      localStorage.setItem("url_history", JSON.stringify(updatedHistory));
      setUrl("");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to shorten URL. Make sure the server and database are running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("url_history");
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Form Container */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl shadow-purple-500/5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-slate-600 pointer-events-none">
              <Link2 size={22} className="animate-pulse" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your long link here (e.g., github.com/google/deepmind)"
              className="w-full pl-12 pr-32 py-4 bg-white/80 border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-slate-900 rounded-2xl outline-none transition-all duration-300 placeholder-slate-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-lg shadow-purple-500/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Shorten</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Shortened URL Output */}
        {shortUrl && (
          <div className="mt-6 p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl animate-scale-in">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full min-w-0">
                <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
                  <Sparkles size={20} />
                </div>
                <div className="truncate text-left w-full">
                  <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider block">
                    Your Short Link
                  </span>
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base md:text-lg font-bold text-slate-900 hover:text-purple-400 transition-colors inline-flex items-center gap-1.5 break-all"
                  >
                    {shortUrl}
                    <ExternalLink size={14} className="opacity-60" />
                  </a>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleCopy(shortUrl)}
                  className={`w-full sm:w-auto px-5 py-3 rounded-xl font-medium flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                    copied
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300/50"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={18} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                {onViewStats && (
                  <button
                    onClick={() => {
                      const shortCode = shortUrl.substring(shortUrl.lastIndexOf("/") + 1);
                      onViewStats(shortCode);
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl font-medium bg-purple-600/90 hover:bg-purple-600 active:scale-95 text-white border border-purple-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-md shadow-purple-500/10"
                  >
                    <BarChart3 size={18} />
                    <span>View Stats</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* History List */}
      {history.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-widest">
              Recent Shortened Links
            </h3>
            <button
              onClick={clearHistory}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Clear History</span>
            </button>
          </div>

          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-slate-200 transition-all duration-300 group"
              >
                <div className="flex flex-col text-left min-w-0 pr-4">
                  <span className="text-xs text-slate-500 truncate mb-1">
                    {item.longUrl}
                  </span>
                  <a
                    href={item.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 font-semibold hover:underline inline-flex items-center gap-1.5"
                  >
                    {item.shortUrl}
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="hidden sm:inline text-xs text-slate-600 mr-2">
                    {item.date}
                  </span>
                  {onViewStats && (
                    <button
                      onClick={() => {
                        const shortCode = item.shortUrl.substring(item.shortUrl.lastIndexOf("/") + 1);
                        onViewStats(shortCode);
                      }}
                      className="p-2 bg-slate-100 hover:bg-purple-950/40 text-slate-600 hover:text-purple-400 rounded-lg cursor-pointer border border-transparent hover:border-purple-900/40 transition-all"
                      title="View Stats"
                    >
                      <BarChart3 size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => handleCopy(item.shortUrl)}
                    className="p-2 bg-slate-100 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer border border-transparent hover:border-slate-300 transition-all"
                    title="Copy Short Link"
                  >
                    <Copy size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlForm;
