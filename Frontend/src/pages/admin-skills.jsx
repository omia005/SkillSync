import { useState, useEffect } from "react";
import api from "../api";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Award,
  Layers,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Download,
  BarChart2,
  Filter,
} from "lucide-react";
import { toast } from "react-toastify";

const AdminSkills = () => {
  // ── Catalog state ──────────────────────────────────────────────────────────
  const [skills, setSkills] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [form, setForm] = useState({ name: "", category: "" });

  // ── Embedded Analytics state ────────────────────────────────────────────────
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [analyticsSearch, setAnalyticsSearch] = useState("");

  // ── Download state ────────────────────────────────────────────────────────
  const [downloading, setDownloading] = useState(null);

  // ── Supporting lists ──────────────────────────────────────────────────────
  const allCategories = ["All", ...new Set(skills.map((s) => s.category || "Uncategorized"))];

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setCatalogLoading(true);
      const res = await api.get("/skills/skills/");
      setSkills(res.data || []);
    } catch {
      toast.error("Failed to fetch skills");
    } finally {
      setCatalogLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (analyticsSearch) params.search = analyticsSearch;
      const res = await api.get("/skills/admin/reports/skills/", { params });
      setAnalyticsData(res.data);
    } catch {
      toast.error("Failed to load skills report");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const clearAnalyticsFilters = () => {
    setStartDate("");
    setEndDate("");
    setAnalyticsSearch("");
    setAnalyticsData(null);
  };

  const downloadPDF = async () => {
    try {
      setDownloading("skills");
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (analyticsSearch) params.search = analyticsSearch;
      const res = await api.get("/skills/admin/reports/skills/pdf/", { params, responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `skills-report-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Skills report downloaded");
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(null);
    }
  };

  // ── CRUD handlers ──────────────────────────────────────────────────────────
  const resetForm = () => { setForm({ name: "", category: "" }); setEditingSkill(null); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCatalogLoading(true);
    try {
      if (editingSkill) {
        await api.put(`/skills/skills/${editingSkill.id}/`, form);
        toast.success("Skill updated");
      } else {
        await api.post("/skills/skills/", form);
        toast.success("Skill created");
      }
      fetchSkills();
      resetForm();
      setShowForm(false);
    } catch { toast.error(err => err?.response?.data?.message || "Operation failed"); }
    finally { setCatalogLoading(false); }
  };
  const handleEdit = (skill) => { setEditingSkill(skill); setForm({ name: skill.name, category: skill.category }); setShowForm(true); };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this skill?")) return;
    try { await api.delete(`/skills/skills/${id}/`); fetchSkills(); toast.success("Skill deleted"); }
    catch { toast.error("Delete failed"); }
  };

  // ── Catalog filtering ─────────────────────────────────────────────────────
  const filteredSkills = skills.filter((s) => {
    const mSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const mCat = filterCategory === "All" || s.category === filterCategory;
    return mSearch && mCat;
  });

  // ── Analytics derived values ────────────────────────────────────────────
  const totalCount = analyticsData?.skills?.total_count ?? skills.length;
  const categoriesCount = analyticsData?.skills?.categories_count ?? allCategories.length - 1;
  const topSkills = analyticsData?.top_skills || [];
  const categories = analyticsData?.categories || [];
  const maxCatCount = categories.length > 0 ? Math.max(...categories.map((c) => c.count)) : 1;

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Skills Catalog</h1>
          <p className="text-gray-600">Add, edit, or remove skills from the master catalog</p>
        </div>
        <button
          onClick={() => { setShowForm(true); resetForm(); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm shadow-indigo-200/30 transition-all duration-200"
        >
          <Plus size={18} />
          Add Skill
        </button>
      </div>

      {/* ── EMBEDDED ANALYTICS BLOCK ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Bar header with title + actions */}
        <div
          className="px-5 py-3 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowAnalytics(!showAnalytics)}
        >
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-indigo-500" />
            <span className="text-sm font-medium text-gray-700">Skills Analytics &amp; Report</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); fetchAnalytics(); }}
              disabled={analyticsLoading}
              className="px-3 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium flex items-center gap-1 disabled:opacity-50"
            >
              {analyticsLoading ? "Loading..." : "Refresh"}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); downloadPDF(); }}
              disabled={downloading === "skills" || analyticsLoading}
              className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-medium flex items-center gap-1 disabled:opacity-50"
            >
              <Download size={12} />
              {downloading === "skills" ? "Downloading…" : "Download PDF"}
            </button>
          </div>
        </div>

        {showAnalytics && (
          <>
            {/* Analytics filter row */}
            <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <Filter size={13} className="text-indigo-500" />
                Filters
                {(startDate || endDate || analyticsSearch) && (
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold inline-flex items-center justify-center">
                    {[startDate, endDate, analyticsSearch].filter(Boolean).length}
                  </span>
                )}
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title="From date"
              />
              <span className="text-gray-300 text-xs">–</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title="To date"
              />
              <input
                type="text"
                placeholder="Search skills…"
                value={analyticsSearch}
                onChange={(e) => setAnalyticsSearch(e.target.value)}
                onKeyPress={(e) => { if (e.key === "Enter") fetchAnalytics(); }}
                className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32"
              />
              <button
                onClick={() => { clearAnalyticsFilters(); fetchAnalytics(); }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="Clear filters"
              >
                <X size={12} />
              </button>
              <button
                onClick={fetchAnalytics}
                className="px-3 py-1 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium"
              >
                Apply &amp; Reload
              </button>

              <div className="flex-1" />
              <span className="text-xs text-gray-400">
                {analyticsData ? `Showing ${totalCount} skill${totalCount !== 1 ? "s" : ""}` : ""}
              </span>
            </div>

            {/* Analytics content */}
            {analyticsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-indigo-500" size={26} />
              </div>
            )}
            {!analyticsLoading && analyticsData && (
              <>
                {/* Stat cards */}
                <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-indigo-50 rounded-xl p-3.5 text-center">
                    <p className="text-xl font-bold text-indigo-600">{totalCount}</p>
                    <p className="text-[11px] text-indigo-700 mt-0.5">Total Skills</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3.5 text-center">
                    <p className="text-xl font-bold text-emerald-600">{categoriesCount}</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Categories</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3.5 text-center">
                    <p className="text-xl font-bold text-amber-600">{categoriesCount > 0 ? Math.round(totalCount / categoriesCount) : 0}</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">Avg per Category</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3.5 text-center">
                    <p className="text-xl font-bold text-blue-600">{analyticsData?.all_skills?.length ?? 0}</p>
                    <p className="text-[11px] text-blue-700 mt-0.5">In Catalog</p>
                  </div>
                </div>

                {/* Top skills bar chart */}
                {topSkills.length > 0 && (
                  <div className="px-5 pb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Most Popular Skills (by Student Adoption)</p>
                    <div className="space-y-1.5">
                      {topSkills.slice(0, 10).map((skill) => {
                        const maxCount = Math.max(...topSkills.slice(0, 10).map((s) => s.count), 1);
                        return (
                          <div key={skill.name} className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 w-36 truncate">{skill.name}</span>
                            <div className="h-1.5 flex-1 bg-gray-50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"
                                style={{ width: `${Math.max((skill.count / maxCount) * 100, 4)}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-medium text-gray-600 w-7 text-right">{skill.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Skills by category table */}
                {categories.length > 0 && (
                  <div className="px-5 pb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Skills by Category</p>
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <div key={cat.name} className="flex items-center gap-3">
                          <span className="text-xs text-gray-600 w-36 truncate">{cat.name}</span>
                          <div className="h-1.5 flex-1 bg-gray-50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                              style={{ width: `${Math.max((cat.count / maxCatCount) * 100, 4)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-medium text-gray-600 w-7 text-right">{cat.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* ── CATALOG TABLE ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Skills Catalog ({skills.length})</span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search catalog…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                {["#", "Name", "Category", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {catalogLoading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center"><Loader2 className="animate-spin mx-auto text-indigo-500" size={28} /></td></tr>
              ) : filteredSkills.length > 0 ? (
                filteredSkills.map((skill, idx) => (
                  <tr key={skill.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-xs text-gray-400">{idx + 1}</td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{skill.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">{skill.category || "Uncategorized"}</span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleEdit(skill)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(skill.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No skills found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ────────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-800">{editingSkill ? "Edit Skill" : "Add Skill"}</h2>
              <button onClick={() => { resetForm(); setShowForm(false); }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Skill Name <span className="text-red-400">*</span></label>
                <input
                  type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. React, Python, Figma" required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category <span className="text-red-400">*</span></label>
                <select
                  value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-white"
                >
                  <option value="">Select a category</option>
                  {["Programming Language", "Framework", "Databases", "Tool", "Soft Skill", "Other"].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { resetForm(); setShowForm(false); }}
                  className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">Cancel</button>
                <button type="submit" disabled={catalogLoading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm shadow-indigo-200/30 transition-all flex items-center gap-2 text-sm disabled:opacity-50">
                  {catalogLoading ? <><Loader2 className="animate-spin" size={15} /> Saving…</> : <><CheckCircle2 size={15} /> {editingSkill ? "Update Skill" : "Create Skill"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSkills;
