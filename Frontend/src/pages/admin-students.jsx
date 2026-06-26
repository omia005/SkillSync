import { useState, useEffect } from "react";
import api from "../api";
import { toast } from "react-toastify";
import {
  Users,
  Search,
  Filter,
  Download,
  Loader2,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

const AdminStudents = () => {
  // ── Catalog state ──────────────────────────────────────────────────────────
  const [students, setStudents] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // ── Report / Analytics state ────────────────────────────────────────────────
  const [reportLoading, setReportLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [report, setReport] = useState(null);
  const [showReportFilters, setShowReportFilters] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [careerFilter, setCareerFilter] = useState("");
  const [nameSearch, setNameSearch] = useState("");

  // ── Career-path options for the dropdown ──────────────────────────────────
  const [careerOptions, setCareerOptions] = useState([]);
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchCareerOptions();
  }, []);

  const fetchCareerOptions = async () => {
    try {
      const res = await api.get("/skills/admin-stats/");
      const paths = res.data?.career_paths_detail || [];
      setCareerOptions(paths);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (page = currentPage) => {
    try {
      setCatalogLoading(true);
      const res = await api.get("/users/admin/students/", {
        params: { page, page_size: 10 }
      });
      setStudents(res.data.students || []);
      setTotalCount(res.data.total || 0);
      setTotalPages(res.data.total_pages || 1);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setCatalogLoading(false);
    }
  };

  const viewStudentProfile = async (studentId) => {
    setProfileLoading(studentId);
    try {
      const res = await api.get(`/users/admin/students/${studentId}/`);
      setSelectedStudent(res.data);
      setShowProfileModal(true);
    } catch {
      toast.error("Failed to load student profile");
    } finally {
      setProfileLoading(null);
    }
  };

  // ── Fetch filtered report ──────────────────────────────────────────────────
  const fetchReport = async (silent = false) => {
    if (!silent) setReportLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (careerFilter) params.career = careerFilter;
      if (nameSearch) params.search = nameSearch;
      const res = await api.get("/skills/admin/reports/students/", { params });
      setReport(res.data);
      setAllLoaded(true);
    } catch {
      toast.error("Failed to load report data");
    } finally {
      setReportLoading(false);
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setCareerFilter("");
    setNameSearch("");
    setReport(null);
    setAllLoaded(false);
  };

  const downloadPDF = async () => {
    try {
      setDownloading("students");
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (careerFilter) params.career = careerFilter;
      if (nameSearch) params.search = nameSearch;
      const res = await api.get("/skills/admin/reports/students/pdf/", {
        params, responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `students-report-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded");
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(null);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const activeCount = report?.students?.active ?? 0;
  const totalStudents = report?.students?.count ?? students.length;
  const profileComplete = report?.students?.profile_complete ?? 0;
  const profileIncomplete = report?.students?.profile_incomplete ?? 0;
  const completionRate = report?.students?.completion_rate ??
    (totalStudents > 0 ? Math.round((profileComplete / totalStudents) * 100) : 0);
  const recent = report?.recent || [];
  const careerDist = report?.career_distribution || [];

  const hasFilters = startDate || endDate || careerFilter || nameSearch;

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600">View and manage all student accounts in the system</p>
        </div>
        <button
          onClick={() => { setShowReportFilters(!showReportFilters); if (!showReportFilters && !allLoaded) fetchReport(false); }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors
            ${showReportFilters
              ? "bg-indigo-600 text-white"
              : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            }`}
        >
          <Filter size={15} />
          {showReportFilters ? "Hide Analytics" : "Analytics & Report"}
        </button>
      </div>

      {/* ── ANALYTICS BLOCK ───────────────────────────────────────────────── */}
      {showReportFilters && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Filter row */}
          <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Filter size={14} className="text-indigo-500" />
              Filters
              {hasFilters && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold inline-flex items-center justify-center">
                  {[startDate, endDate, careerFilter, nameSearch].filter(Boolean).length}
                </span>
              )}
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); }}
              onBlur={() => fetchReport(true)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="From joined date"
            />
            <span className="text-gray-300">–</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); }}
              onBlur={() => fetchReport(true)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="To joined date"
            />
            <select
              value={careerFilter}
              onChange={(e) => { setCareerFilter(e.target.value); }}
              onBlur={() => fetchReport(true)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Career Paths</option>
              {careerOptions.map((cp) => (
                <option key={cp.slug} value={cp.slug}>{cp.title}</option>
              ))}
            </select>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search by name…"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                onBlur={() => fetchReport(true)}
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44"
              />
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="Clear all"
              >
                <X size={14} />
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={downloadPDF}
              disabled={downloading || reportLoading}
              className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download size={14} />
              {downloading ? "Downloading…" : "Download PDF"}
            </button>
          </div>

          {reportLoading && !report ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-indigo-500" size={28} />
            </div>
          ) : (
            <>
              {/* Metric cards */}
              <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-indigo-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{totalStudents}</p>
                  <p className="text-xs text-indigo-800 mt-1">Total Students</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{profileComplete}</p>
                  <p className="text-xs text-emerald-800 mt-1">Complete Profiles</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">{profileIncomplete}</p>
                  <p className="text-xs text-amber-800 mt-1">Incomplete Profiles</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
                  <p className="text-xs text-blue-800 mt-1">Active Students</p>
                </div>
              </div>

              {/* Progress bar: profile completion */}
              <div className="px-5 pb-5">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>Profile completion rate</span>
                  <span className="font-medium text-gray-700">{completionRate}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all"
                    style={{ width: `${Math.min(completionRate, 100)}%` }}
                  />
                </div>
              </div>

              {/* Career distribution */}
              {careerDist.length > 0 && (
                <div className="px-5 pb-5">
                  <p className="text-sm font-semibold text-gray-600 mb-3">Students per Career Path</p>
                  <div className="space-y-2">
                    {careerDist.map((c, i) => {
                      const maxCount = Math.max(...careerDist.map((x) => x.count));
                      const barW = maxCount > 0 ? (c.count / maxCount) * 100 : 0;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-36 truncate">{c.career}</span>
                          <div className="h-2 flex-1 bg-gray-50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                              style={{ width: `${barW}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700 w-10 text-right">{c.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── CATALOG TABLE ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile Complete</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {catalogLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center"><Loader2 className="animate-spin mx-auto text-indigo-500" size={32} /></td></tr>
              ) : students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.first_name || "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.last_name || "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.email || "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.date_joined ? new Date(student.date_joined).toLocaleDateString() : "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${student.is_profile_complete ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {student.is_profile_complete ? "Yes" : "No"}
                      </span>
                    </td>
<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => viewStudentProfile(student.id)} 
                        disabled={profileLoading === student.id}
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1"
                      >
                        {profileLoading === student.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Eye size={14} />
                        )}
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No students found</td></tr>
              )}
</tbody>
           </table>
         </div>
       </div>

       {/* Pagination */}
       {totalPages > 1 && (
         <div className="flex items-center justify-between mt-4">
           <p className="text-sm text-gray-600">
             Showing {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalCount)} of {totalCount} students
           </p>
           <div className="flex items-center gap-2">
             <button
               onClick={() => { const newPage = Math.max(1, currentPage - 1); setCurrentPage(newPage); fetchStudents(newPage); }}
               disabled={currentPage === 1 || catalogLoading}
               className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
             >
               Previous
             </button>
             <span className="text-sm px-2">{currentPage} / {totalPages}</span>
             <button
               onClick={() => { const newPage = Math.min(totalPages, currentPage + 1); setCurrentPage(newPage); fetchStudents(newPage); }}
               disabled={currentPage === totalPages || catalogLoading}
               className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
             >
               Next
             </button>
           </div>
         </div>
       )}

      {showProfileModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Student Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">First Name</p>
                  <p className="font-medium">{selectedStudent.first_name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Name</p>
                  <p className="font-medium">{selectedStudent.last_name || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedStudent.email || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bio</p>
                  <p className="font-medium">{selectedStudent.bio || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">University</p>
                  <p className="font-medium">{selectedStudent.university || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Major</p>
                  <p className="font-medium">{selectedStudent.major || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Graduation Year</p>
                  <p className="font-medium">{selectedStudent.graduationYear || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year of Study</p>
                  <p className="font-medium">{selectedStudent.yearOfStudy || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">LinkedIn</p>
                  <p className="font-medium break-all">{selectedStudent.linkedIn || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">GitHub</p>
                  <p className="font-medium break-all">{selectedStudent.github || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Portfolio</p>
                  <p className="font-medium break-all">{selectedStudent.portfolio || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Selected Career</p>
                  <p className="font-medium">{selectedStudent.selected_career || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Profile Complete</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${selectedStudent.is_profile_complete ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {selectedStudent.is_profile_complete ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
