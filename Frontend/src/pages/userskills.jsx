import { useState, useEffect } from "react";
import api from "../api";
import SkillSelector from "../components/skillselector";
import { Plus, Trash2, Edit2, Search, Filter, ChevronDown, Award, Layers, Zap, Loader2} from 'lucide-react';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [proficiency, setProficiency] = useState("Beginner");
  const [category, setCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [expandedSkillId, setExpandedSkillId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSkills = async () => {
    try {
      const res = await api.get("/skills/user-skills/", { withCredentials: true });
      setSkills(res.data);
    } catch (err) {
      console.error("Failed to fetch skills:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkillId || !category || !proficiency) return;

    setLoading(true);
    try {
      await api.post(
        "/skills/user-skills/",
        { skill_id: selectedSkillId, category, proficiency },
        { withCredentials: true }
      );

      setSelectedSkillId(null);
      setCategory("");
      setProficiency("Beginner");
      fetchSkills();
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding skill:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await api.delete(`/skills/user-skills/${id}/`, { withCredentials: true });
      setSkills(skills.filter((skill) => skill.id !== id));
    } catch (err) {
      console.error("Error deleting skill:", err.response?.data || err.message);
    }
  };

  const allCategories = ["All", ...new Set(skills.map((s) => s.category).filter(Boolean))];

  const filteredSkills = skills
    .filter((skill) => {
      const matchesSearch =
        !searchQuery ||
        skill.skill.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        filterCategory === "All" || skill.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.skill.name.localeCompare(b.skill.name);
      if (sortBy === "proficiency") return a.proficiency.localeCompare(b.proficiency);
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  const proficiencyColors = {
    Beginner: "bg-green-100 text-green-700",
    Intermediate: "bg-blue-100 text-blue-700",
    Advanced: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Skills</h1>
        <p className="text-gray-600 text-lg">
          Manage and track your acquired skills. Currently {skills.length} skill
          {skills.length !== 1 ? "s" : ""} logged.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Total Skills</div>
          <div className="text-2xl font-bold text-gray-900">{skills.length}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Beginner</div>
          <div className="text-2xl font-bold text-green-600">
            {skills.filter((s) => s.proficiency === "Beginner").length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Intermediate</div>
          <div className="text-2xl font-bold text-blue-600">
            {skills.filter((s) => s.proficiency === "Intermediate").length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Advanced</div>
          <div className="text-2xl font-bold text-purple-600">
            {skills.filter((s) => s.proficiency === "Advanced").length}
          </div>
        </div>
      </div>

      {/* Add Skill Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Add New Skill
              </h2>
              <p className="text-sm text-gray-500">
                Log a skill you have acquired
              </p>
            </div>
          </div>
          {showAddForm ? (
            <ChevronDown className="text-gray-400" size={20} />
          ) : (
            <ChevronDown className="text-gray-400" size={20} />
          )}
        </div>

        {showAddForm && (
          <form
            onSubmit={handleAddSkill}
            className="mt-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Skill
              </label>
              <SkillSelector onSkillSelect={setSelectedSkillId} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-700 bg-white"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Framework">Framework</option>
                  <option value="Programming Language">
                    Programming Language
                  </option>
                  <option value="Databases">Databases</option>
                  <option value="Tool">Tool</option>
                  <option value="Soft skill">Soft skill</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proficiency Level
                </label>
                <select
                  value={proficiency}
                  onChange={(e) => setProficiency(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-700 bg-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedSkillId || !category}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Plus size={18} />
              )}
              {loading ? "Adding..." : "Add Skill"}
            </button>
          </form>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-white"
          >
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-white"
          >
            <option value="date">Sort: Date</option>
            <option value="name">Sort: Name</option>
            <option value="proficiency">Sort: Proficiency</option>
          </select>
        </div>
      </div>

      {/* Skills List */}
      <div className="space-y-3">
        {filteredSkills.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Zap size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-1">
              No skills found
            </h3>
            <p className="text-sm text-gray-400">
              {skills.length === 0
                ? "Get started by adding your first skill above"
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${
                expandedSkillId === skill.id ? "ring-2 ring-indigo-200" : ""
              }`}
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() =>
                  setExpandedSkillId(
                    expandedSkillId === skill.id ? null : skill.id
                  )
                }
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center ${
                      proficiencyColors[skill.proficiency] || "bg-gray-100"
                    }`}
                  >
                    <Layers size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {skill.skill.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          proficiencyColors[skill.proficiency] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {skill.proficiency}
                      </span>
                      <span className="text-xs text-gray-400">
                        • {skill.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSkill(skill.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete skill"
                  >
                    <Trash2 size={16} />
                  </button>
                  {expandedSkillId === skill.id ? (
                    <ChevronDown className="text-gray-400" size={18} />
                  ) : (
                    <ChevronDown className="text-gray-400" size={18} />
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {expandedSkillId === skill.id && (
                <div className="px-4 pb-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
                    <Award size={14} />
                    <span>
                      Skill ID: {skill.skill_id} • Added to your profile
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Skills;