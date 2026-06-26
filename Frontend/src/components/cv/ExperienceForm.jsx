import { useState } from "react";
import { useCVStore } from "../../store/useCVStore";
import { updateCVFields } from "../../services/CVServices";
import { Plus, X, Briefcase, Trash2 } from 'lucide-react';

const ExperienceForm = () => {

  const [showForm, setShowForm] = useState(false);

  const {
    cv,
    addExperience,
    setCV,
  } = useCVStore();

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    start_date: "",
    end_date: "",
    description: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {

    const newExperience = {
      id: Date.now(),
      ...formData,
    };

    addExperience(newExperience);

    const updatedCV = await updateCVFields(cv.id, {
      experience: [...(cv.experience || []), newExperience],
    });
    setCV(updatedCV);

    setFormData({
      company: "",
      role: "",
      start_date: "",
      end_date: "",
      description: "",
    });

    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-shadow duration-200 hover:shadow-md">

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
            <Briefcase size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Experience</h2>
            <p className="text-xs text-gray-500">Work history & projects</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
        >
          {showForm ? (
            <>
              <X size={15} />
              Close
            </>
          ) : (
            <>
              <Plus size={15} />
              Add Experience
            </>
          )}
        </button>
      </div>

      {/* EXPERIENCE CARDS */}
      <div className="px-6 py-4 space-y-3">
        {cv.experience?.length === 0 ? (
          <div className="text-center py-6">
            <Briefcase size={36} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No experience added yet</p>
          </div>
        ) : (
          cv.experience?.map((exp, idx) => (
            <div
              key={exp.id || `${exp.company}-${idx}`}
              className="flex items-start gap-4 p-3.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors group"
            >
              <div className="p-2 bg-white rounded-lg border border-gray-100 flex-shrink-0">
                <Briefcase size={18} className="text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm truncate">{exp.role}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{exp.company}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-400">
                    {exp.start_date} – {exp.end_date}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{exp.description}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FORM */}
      {showForm && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                placeholder="Google, Meta, etc."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Role / Title</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                placeholder="Software Engineer"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Start Date</label>
              <input
                type="text"
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                placeholder="Jan 2022"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">End Date</label>
              <input
                type="text"
                value={formData.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                placeholder="Present / Dec 2024"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe your responsibilities, achievements, and impact..."
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-sm shadow-emerald-200 transition-all duration-200"
            >
              <Plus size={16} />
              Save Experience
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExperienceForm;