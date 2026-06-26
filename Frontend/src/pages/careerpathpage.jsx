import api from "../api";
import { useState, useEffect } from "react";
import { useCareerStore } from "../store/useCareerStore";
import { Search, Sparkles, Briefcase, TrendingUp } from "lucide-react";
import CareerCard from "../components/CareerCard";

const CareerPathPage = () => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { selectedSlug } = useCareerStore();

  const fetchPaths = async () => {
    try {
      const res = await api.get("/skills/career-paths/");
      setCareers(res.data);
    } catch (err) {
      console.error("Error fetching careers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaths();
  }, []);

  // Extract unique categories
  const categories = ["All", ...new Set(careers.map((c) => c.category || "Other"))];

  const filteredCareers = careers.filter((path) => {
    const matchesSearch =
      path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || path.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm font-medium">Loading career paths…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-0 animate-fade-in-up">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-indigo-600" size={22} />
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Explore
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Career Paths
        </h1>
        <p className="text-gray-500 mt-1 text-base">
          Discover and select the IT career track that matches your passions and goals.
        </p>
      </div>

      {/* ── QUICK STATS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Paths",
            value: careers.length,
            icon: <Briefcase size={18} />,
            color: "bg-indigo-500",
            bg: "bg-indigo-50",
          },
          {
            label: "Categories",
            value: categories.length - 1,
            icon: <Sparkles size={18} />,
            color: "bg-purple-500",
            bg: "bg-purple-50",
          },
          {
            label: "Showing",
            value: filteredCareers.length,
            icon: <Search size={18} />,
            color: "bg-blue-500",
            bg: "bg-blue-50",
          },
          {
            label: "Selected",
            value: selectedSlug ? 1 : 0,
            icon: <TrendingUp size={18} />,
            color: "bg-emerald-500",
            bg: "bg-emerald-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`${stat.bg} rounded-xl p-4 flex items-center gap-3 ring-1 ring-black/[0.04]`}
          >
            <div className={`${stat.color} w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-900 leading-none">
                {stat.value}
              </p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTERS ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" width="18" height="18" />
          <input
            type="text"
            placeholder="Search career paths…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all duration-200 shadow-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Briefcase size={13} />
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── RESULTS COUNT ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-medium text-gray-500">
          Showing <span className="text-gray-800 font-bold">{filteredCareers.length}</span> of{" "}
          <span className="text-gray-800">{careers.length}</span> career paths
        </p>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Clear search
          </button>
        )}
      </div>

      {/* ── CAREER CARDS GRID ────────────────────────────────────────────── */}
      {filteredCareers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCareers.map((path, index) => (
            <div
              key={path.slug}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <CareerCard path={path} isSelected={selectedSlug === path.slug} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-5">
            <Search className="text-gray-400" size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            No career paths found
          </h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Try adjusting your search keyword or switching to a different category.
          </p>
          <button
            onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
            </svg>
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CareerPathPage;
