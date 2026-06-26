import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Target,
  BookOpen,
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";

const AdminCareerPaths = () => {
  const navigate = useNavigate();
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCareer, setEditingCareer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [skills, setSkills] = useState([]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    icon: "",
    salary: "",
    tools_needed: "",
    industries: "",
    applications: "",
    skills_required: [],
    learning_path: [{ stage: "", duration: "", topics: [], resources: [] }],
  });

  useEffect(() => {
    fetchCareers();
    fetchSkills();
  }, []);

  const fetchCareers = async () => {
    try {
      const res = await api.get("/skills/career-paths/");
      setCareers(res.data);
    } catch (err) {
      toast.error("Failed to fetch career paths");
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await api.get("/skills/skills/");
      setSkills(res.data);
    } catch (err) {
      console.error("Failed to fetch skills:", err);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      slug: "",
      description: "",
      icon: "",
      salary: "",
      tools_needed: "",
      industries: "",
      applications: "",
      skills_required: [],
      learning_path: [{ stage: "", duration: "", topics: [], resources: [] }],
    });
    setEditingCareer(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      tools_needed: form.tools_needed.split(",").map((t) => t.trim()).filter(Boolean),
      industries: form.industries.split(",").map((i) => i.trim()).filter(Boolean),
      applications: form.applications.split(",").map((a) => a.trim()).filter(Boolean),
      skills_required: form.skills_required.map((s) => ({ id: s, name: s })),
    };

    try {
      if (editingCareer) {
        await api.put(`/skills/career-paths/${editingCareer.slug}/`, payload);
        toast.success("Career path updated successfully");
      } else {
        await api.post("/skills/career-paths/", payload);
        toast.success("Career path created successfully");
      }
      fetchCareers();
      resetForm();
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (career) => {
    setEditingCareer(career);
    setForm({
      title: career.title,
      slug: career.slug,
      description: career.description,
      icon: career.icon || "",
      salary: career.salary || "",
      tools_needed: (career.tools_needed || []).join(", "),
      industries: (career.industries || []).join(", "),
      applications: (career.applications || []).join(", "),
      skills_required: (career.skills_required || []).map((s) => s.name || s),
      learning_path:
        career.learning_path?.length > 0
          ? career.learning_path.map((lp) => ({
              stage: lp.stage,
              duration: lp.duration,
              topics: (lp.topics || []).map((t) => t.name || t),
              resources: (lp.resources || []).map((r) => ({ name: r.name, url: r.url })),
            }))
          : [{ stage: "", duration: "", topics: [], resources: [] }],
    });
    setShowForm(true);
  };

  const handleDelete = async (slug) => {
    if (!window.confirm("Are you sure you want to delete this career path?")) return;
    try {
      await api.delete(`/skills/career-paths/${slug}/`);
      fetchCareers();
      toast.success("Career path deleted");
    } catch (err) {
      toast.error("Failed to delete career path");
    }
  };

  const addLearningStage = () => {
    setForm((prev) => ({
      ...prev,
      learning_path: [
        ...prev.learning_path,
        { stage: "", duration: "", topics: [], resources: [] },
      ],
    }));
  };

  const removeLearningStage = (index) => {
    setForm((prev) => ({
      ...prev,
      learning_path: prev.learning_path.filter((_, i) => i !== index),
    }));
  };

  const updateLearningStage = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.learning_path];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, learning_path: updated };
    });
  };

  const addTopicToStage = (stageIndex) => {
    const topic = prompt("Enter topic name:");
    if (topic) {
      setForm((prev) => {
        const updated = [...prev.learning_path];
        updated[stageIndex].topics.push(topic.trim());
        return { ...prev, learning_path: updated };
      });
    }
  };

  const removeTopicFromStage = (stageIndex, topicIndex) => {
    setForm((prev) => {
      const updated = [...prev.learning_path];
      updated[stageIndex].topics = updated[stageIndex].topics.filter((_, i) => i !== topicIndex);
      return { ...prev, learning_path: updated };
    });
  };

  const addResourceToStage = (stageIndex) => {
    const name = prompt("Enter resource name:");
    const url = prompt("Enter resource URL:");
    if (name) {
      setForm((prev) => {
        const updated = [...prev.learning_path];
        updated[stageIndex].resources.push({ name: name.trim(), url: url?.trim() || "" });
        return { ...prev, learning_path: updated };
      });
    }
  };

  const removeResourceFromStage = (stageIndex, resIndex) => {
    setForm((prev) => {
      const updated = [...prev.learning_path];
      updated[stageIndex].resources = updated[stageIndex].resources.filter((_, i) => i !== resIndex);
      return { ...prev, learning_path: updated };
    });
  };

  const filteredCareers = careers.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Career Paths</h1>
          <p className="text-gray-600">Add, edit, or remove career paths from the catalog</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm shadow-indigo-200/30 transition-all duration-200"
        >
          <Plus size={18} />
          Add Career Path
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search career paths..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-white"
        />
      </div>

      {/* Career Path List */}
      {loading && !careers.length ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCareers.map((career) => (
            <div
              key={career.slug}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 flex-shrink-0">
                    <Target size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-800 truncate">{career.title}</h3>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {career.slug}
                      </span>
                    </div>
                    {career.salary && (
                      <p className="text-sm text-gray-500 mb-2">
                        💰 Salary: {career.salary}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 line-clamp-2">{career.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs text-gray-400">
                        Skills: {(career.skills_required || []).length} required
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">
                        Stages: {(career.learning_path || []).length}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/career-paths/${career.slug}`}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="View"
                  >
                    <ChevronRight size={18} />
                  </Link>
                  <button
                    onClick={() => handleEdit(career)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(career.slug)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredCareers.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchQuery ? "No results found" : "No career paths yet"}
              </h3>
              <p className="text-gray-400">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "Create your first career path to get started"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCareer ? "Edit Career Path" : "Add Career Path"}
              </h2>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Frontend Developer"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Slug <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    placeholder="e.g., frontend-developer"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe this career path..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Salary
                  </label>
                  <input
                    type="text"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    placeholder="e.g., $85,000 - $120,000"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Icon (emoji or class)
                  </label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="e.g., 💻 or target"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Industries (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={form.industries}
                    onChange={(e) => setForm({ ...form, industries: e.target.value })}
                    placeholder="Tech, Finance, Healthcare"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Application Areas (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={form.applications}
                    onChange={(e) => setForm({ ...form, applications: e.target.value })}
                    placeholder="Web Dev, Mobile, AI"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tools Needed (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={form.tools_needed}
                    onChange={(e) => setForm({ ...form, tools_needed: e.target.value })}
                    placeholder="VS Code, Git, Docker"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Required Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.skills_required.map((skill, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-medium"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            skills_required: prev.skills_required.filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && !form.skills_required.includes(val)) {
                        setForm((prev) => ({
                          ...prev,
                          skills_required: [...prev.skills_required, val],
                        }));
                      }
                      e.target.value = "";
                    }}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-white"
                  >
                    <option value="">Select a skill to add...</option>
                    {skills
                      .filter(
                        (s) => !form.skills_required.includes(s.name)
                      )
                      .map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} ({s.category})
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const existing = skills
                        .filter((s) => !form.skills_required.includes(s.name))
                        .map((s) => s.name);
                      if (existing.length) {
                        setForm((prev) => ({
                          ...prev,
                          skills_required: [
                            ...prev.skills_required,
                            existing[0],
                          ],
                        }));
                      }
                    }}
                    className="px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors text-sm"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Learning Path Stages */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Learning Path Stages
                  </label>
                  <button
                    type="button"
                    onClick={addLearningStage}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    <Plus size={14} />
                    Add Stage
                  </button>
                </div>
                <div className="space-y-4">
                  {form.learning_path.map((stage, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-bold text-gray-400 w-6">#{idx + 1}</span>
                        <input
                          type="text"
                          value={stage.stage}
                          onChange={(e) => updateLearningStage(idx, "stage", e.target.value)}
                          placeholder="Stage name"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                        />
                        <input
                          type="text"
                          value={stage.duration}
                          onChange={(e) => updateLearningStage(idx, "duration", e.target.value)}
                          placeholder="Duration"
                          className="w-32 px-3 py-1.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeLearningStage(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Topics */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-gray-600">Topics</label>
                          <button
                            type="button"
                            onClick={() => addTopicToStage(idx)}
                            className="text-xs text-indigo-600 hover:text-indigo-800"
                          >
                            + Add Topic
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {stage.topics.map((topic, tIdx) => (
                            <span key={tIdx} className="flex items-center gap-1 bg-white text-xs text-gray-700 px-2 py-0.5 rounded-full border">
                              {topic}
                              <button
                                type="button"
                                onClick={() => removeTopicFromStage(idx, tIdx)}
                                className="text-red-400 hover:text-red-600"
                              >
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Resources */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-gray-600">Resources</label>
                          <button
                            type="button"
                            onClick={() => addResourceToStage(idx)}
                            className="text-xs text-indigo-600 hover:text-indigo-800"
                          >
                            + Add Resource
                          </button>
                        </div>
                        <div className="space-y-1">
                          {stage.resources.map((res, rIdx) => (
                            <div key={rIdx} className="flex items-center gap-2 bg-white rounded px-2 py-1 text-xs">
                              <span className="flex-1 truncate">{res.name}</span>
                              {res.url && <span className="text-gray-400 truncate max-w-[100px]">{res.url}</span>}
                              <button
                                type="button"
                                onClick={() => removeResourceFromStage(idx, rIdx)}
                                className="text-red-400 hover:text-red-600"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm shadow-indigo-200/30 transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {loading
                    ? "Saving..."
                    : editingCareer
                    ? "Update Career Path"
                    : "Create Career Path"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCareerPaths;