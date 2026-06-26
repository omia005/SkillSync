import { useState } from "react";
import { useCVStore } from "../../store/useCVStore";
import { updateCVFields } from "../../services/CVServices";
import { Plus, X, GraduationCap, Trash2 } from 'lucide-react';

const EducationForm = () => {
  const [showForm, setShowForm] = useState(false);

  const {
    cv,
    addEducation,
    setCV,
  } = useCVStore();

  const [formData, setFormData] = useState({
    school: "",
    degree: "",
    field_of_study: "",
    start_date: "",
    end_date: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {

    const newEducation = {
      id: Date.now(),
      ...formData,
    };

    addEducation(newEducation);

    const updatedCV = await updateCVFields(cv.id, {
      education: [...(cv.education || []), newEducation],
    });
    setCV(updatedCV);

    setFormData({
      school: "",
      degree: "",
      field_of_study: "",
      start_date: "",
      end_date: "",
    });

    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-shadow duration-200 hover:shadow-md">

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
            <GraduationCap size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Education</h2>
            <p className="text-xs text-gray-500">Degrees and certifications</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
        >
          {showForm ? (
            <>
              <X size={15} />
              Close
            </>
          ) : (
            <>
              <Plus size={15} />
              Add Education
            </>
          )}
        </button>
      </div>

      {/* EDUCATION CARDS */}
      <div className="px-6 py-4 space-y-3">
        {cv.education?.length === 0 ? (
          <div className="text-center py-6">
            <GraduationCap size={36} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No education added yet</p>
          </div>
        ) : (
          cv.education?.map((edu, idx) => (
            <div
              key={edu.id || `${edu.school}-${idx}`}
              className="flex items-start gap-4 p-3.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors group"
            >
              <div className="p-2 bg-white rounded-lg border border-gray-100 flex-shrink-0">
                <GraduationCap size={18} className="text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm truncate">{edu.degree}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{edu.school}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-400">{edu.field_of_study}</span>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-400">
                    {edu.start_date} – {edu.end_date}
                  </span>
                </div>
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
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">School / University</label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => handleChange("school", e.target.value)}
                placeholder="Massachusetts Institute of Technology"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Degree</label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => handleChange("degree", e.target.value)}
                placeholder="B.Sc. Computer Science"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Field of Study</label>
              <input
                type="text"
                value={formData.field_of_study}
                onChange={(e) => handleChange("field_of_study", e.target.value)}
                placeholder="Software Engineering"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Start Date</label>
              <input
                type="text"
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                placeholder="2020"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">End Date</label>
              <input
                type="text"
                value={formData.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                placeholder="2024"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-sm shadow-amber-200 transition-all duration-200"
            >
              <Plus size={16} />
              Save Education
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

export default EducationForm;