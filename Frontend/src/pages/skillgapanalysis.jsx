import { useEffect, useState } from "react";
import api from "../api";
import { Download, AlertCircle, CheckCircle2, ArrowLeft, Target } from "lucide-react";
import { Link } from "react-router-dom";

function SkillGapAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const res = await api.get("/skills/skill-gap-analysis/");
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch skill gap analysis:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const res = await api.get("/skills/skill-gap-report/", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `skill-gap-report-${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download report:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading skill gap analysis...</p>
        </div>
      </div>
    );
  }

  if (!data?.career?.title) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/career-paths" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium">
            <ArrowLeft size={18} /> Back to Career Paths
          </Link>
        </div>
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Career Selected</h2>
          <p className="text-gray-500 mb-4">Select a career path to analyze your skills gap.</p>
          <Link to="/career-paths" className="text-indigo-600 hover:underline font-medium">Browse Career Paths →</Link>
        </div>
      </div>
    );
  }

  const { career, stats, matched_skills, missing_skills } = data;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link to="/career-paths" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium">
          <ArrowLeft size={18} /> Back to Career Paths
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Skill Gap Analysis</h1>
          <p className="text-indigo-100 text-lg">{career.title}</p>
          <p className="text-indigo-200 mt-2">{career.description}</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total_required}</div>
              <div className="text-sm text-gray-500">Total Required</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.matched_count}</div>
              <div className="text-sm text-gray-500">Matched</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{stats.upgrade_count}</div>
              <div className="text-sm text-gray-500">Upgrade Needed</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.missing_count}</div>
              <div className="text-sm text-gray-500">Missing</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Progress</h2>
              <span className="text-2xl font-bold text-indigo-600">{stats.completion_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all" style={{ width: `${stats.completion_percentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {matched_skills.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-green-600" size={20} /> Matched Skills
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Skill</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Required</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Your Level</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
<tbody>
                 {matched_skills.map((skill) => (
                   <tr key={skill.name} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-800">{String(skill.name).replace(/\b\w/g, c => c.toUpperCase())}</td>
                      <td className="py-3 px-4 text-gray-600">{skill.required_level}</td>
                      <td className="py-3 px-4 text-gray-600">{skill.user_level}</td>
                     <td className="py-3 px-4">
                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                         skill.status === "matched" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                       }`}>
                         {skill.status === "matched" ? "Matched" : "Upgrade Needed"}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>
      )}

      {missing_skills.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} /> Missing Skills
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Skill</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Required Level</th>
                </tr>
              </thead>
<tbody>
                 {missing_skills.map((skill) => (
                   <tr key={skill.name} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-800">{String(skill.name).replace(/\b\w/g, c => c.toUpperCase())}</td>
                      <td className="py-3 px-4 text-gray-600">{skill.required_level}</td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleDownloadReport}
          disabled={downloading}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
        >
          <Download size={18} />
          {downloading ? "Downloading..." : "Download PDF Report"}
        </button>
      </div>
    </div>
  );
}

export default SkillGapAnalysis;