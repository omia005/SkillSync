import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api.js";
import { useCareerStore } from "../store/useCareerStore";
import {
  ArrowLeft,
  Clock,
  Target,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Zap,
  TrendingUp,
  Award,
  DollarSign,
} from "lucide-react";

const CareerDetailPage = () => {
  const { slug } = useParams();
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const { selectedSlug, selectCareer } = useCareerStore();

  useEffect(() => {
    const fetchCareer = async () => {
      try {
        const res = await api.get(`/skills/career-paths/${slug}/`);
        setCareer(res.data);
      } catch (err) {
        console.error("Error fetching career:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCareer();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading career details...</p>
        </div>
      </div>
    );
  }

  if (!career) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Career Path Not Found
        </h2>
        <p className="text-gray-500 mb-4">
          The career path you're looking for doesn't exist.
        </p>
        <Link
          to="/career-paths"
          className="text-indigo-600 hover:underline font-medium"
        >
          ← Back to all career paths
        </Link>
      </div>
    );
  }

  const isSelected = selectedSlug === career.slug;

  const handleSelectCareer = async () => {
    const targetSlug = isSelected ? null : career.slug;
    selectCareer(targetSlug);
    try {
      await api.post("/users/select-career/", isSelected ? { slug: null } : { slug: career.slug });
    } catch (err) {
      console.error("Failed to save career selection:", err);
    }
  };

  // Tab definitions
  const tabs = [
    { id: "overview", label: "Overview", icon: <Target size={16} /> },
    {
      id: "skills",
      label: "Skills Required",
      icon: <Zap size={16} />,
    },
    { id: "roadmap", label: "Learning Roadmap", icon: <BookOpen size={16} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        to="/career-paths"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 font-medium transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Career Paths
      </Link>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-8 md:p-10 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-20 -mb-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/15 backdrop-blur-sm rounded-xl">
              <Target className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {career.title}
              </h1>
              <p className="text-indigo-200 text-sm mt-1">{career.slug}</p>
            </div>
          </div>
          <p className="text-indigo-100 text-lg leading-relaxed max-w-3xl">
            {career.description}
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Clock size={18} className="text-indigo-200 mb-2" />
              <p className="text-sm text-indigo-200">Avg Duration</p>
              <p className="text-lg font-bold">
                {career.learning_path?.length || 0} stages
              </p>
            </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <DollarSign size={18} className="text-indigo-200 mb-2" />
                <p className="text-sm text-indigo-200">Salary</p>
                <p className="text-lg font-bold">{career.salary || "N/A"}</p>
              </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <TrendingUp size={18} className="text-indigo-200 mb-2" />
              <p className="text-sm text-indigo-200">Job Outlook</p>
              <p className="text-lg font-bold">{career.outlook || "N/A"}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Award size={18} className="text-indigo-200 mb-2" />
              <p className="text-sm text-indigo-200">Skills</p>
              <p className="text-lg font-bold">
                {career.skills_required?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-200 border-b-2 ${
                activeTab === tab.id
                  ? "text-indigo-600 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 border-transparent hover:text-indigo-600 hover:bg-gray-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Career Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Applications */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-4">
                    <Target className="text-indigo-500" size={18} />
                    Application Areas
                  </h3>
                  <ul className="space-y-3">
                    {career.applications?.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-gray-600"
                      >
                        <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 flex-shrink-0"></div>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                    {!career.applications?.length && (
                      <li className="text-gray-400 text-sm">
                        No applications listed
                      </li>
                    )}
                  </ul>
                </div>

                {/* Industries */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-4">
                    <BookOpen className="text-purple-500" size={18} />
                    Industries
                  </h3>
                  <ul className="space-y-3">
                    {career.industries?.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-gray-600"
                      >
                        <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                    {!career.industries?.length && (
                      <li className="text-gray-400 text-sm">
                        No industries listed
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Tools & Technologies */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-4">
                  <Zap className="text-amber-500" size={18} />
                  Tools &amp; Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {career.tools_needed?.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-white text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                    >
                      {tool}
                    </span>
                  ))}
                  {!career.tools_needed?.length && (
                    <span className="text-gray-400 text-sm">
                      No tools listed
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Skills Required Tab */}
          {activeTab === "skills" && (
            <div className="space-y-4">
              {career.skills_required?.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {skill.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Required Proficiency:{" "}
                        <span className="capitalize">{skill.level}</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                    {skill.level}
                  </span>
                </div>
              ))}
              {!career.skills_required?.length && (
                <p className="text-center text-gray-400 py-8">
                  No skills requirements listed
                </p>
              )}
            </div>
          )}

          {/* Learning Roadmap Tab */}
          {activeTab === "roadmap" && career.learning_path?.length > 0 && (
            <div className="space-y-8">
              {/* Timeline */}
              <div className="relative pl-8 border-l-2 border-indigo-200 ml-2">
                {career.learning_path?.map((stage, idx) => (
                  <div key={idx} className="relative mb-8 ml-4">
                    {/* Timeline dot */}
                    <div className="absolute -left-[38px] top-1 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm z-10
                      bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200/50">
                      {idx + 1}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800">
                          {stage.stage}
                        </h3>
                        <span className="flex items-center gap-1 text-sm text-gray-500 bg-white px-2 py-1 rounded">
                          <Clock size={14} />
                          {stage.duration}
                        </span>
                      </div>

                      {/* Topics */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Topics Covered
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {stage.topics?.map((topic, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2.5 py-1 bg-white text-xs rounded-lg border border-gray-200 text-gray-600"
                            >
                              {typeof topic === "string" ? topic : topic.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Resources */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Recommended Resources
                        </p>
                        <ul className="space-y-2">
                          {stage.resources?.map((res, rIdx) => (
                            <li key={rIdx}>
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                              >
                                <BookOpen size={14} />
                                {res.name}
                                <span className="text-gray-300">→</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "roadmap" &&
            !career.learning_path?.length && (
              <p className="text-center text-gray-400 py-8">
                No learning roadmap available
              </p>
            )}
        </div>
      </div>
      

      {/* Select/Unselect Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSelectCareer}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
            isSelected
              ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200"
          }`}
        >
          {isSelected ? (
            <>
              <CheckCircle2 size={18} />
              Selected — Deselect
            </>
          ) : (
            <>
              <Target size={18} />
              Select This Career Path
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CareerDetailPage;