import { useState } from "react";
import { useCVStore } from "../../store/useCVStore";
import { updateCVFields } from "../../services/CVServices";
import { Plus, X, Zap, Layers } from 'lucide-react';

const SkillsForm = () => {
  const [skill, setSkill] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { cv, addSkill, removeSkill, setCV } = useCVStore();

  const handleAddSkill = async () => {
    if (!skill.trim()) return;

    const newSkill = {
      id: Date.now(),
      name: skill,
      level: "Intermediate",
    };

    addSkill(newSkill);

    const updatedCV = await updateCVFields(cv.id, {
      skills: [...(cv.skills || []), newSkill],
    });
    setCV(updatedCV);

    setSkill("");
  };

  const handleRemoveSkill = async (index) => {
    const updatedSkills = cv.skills.filter((_, i) => i !== index);
    removeSkill(index);

    const updatedCV = await updateCVFields(cv.id, {
      skills: updatedSkills,
    });
    setCV(updatedCV);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-shadow duration-200 hover:shadow-md">

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-50 rounded-lg text-violet-600">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Skills</h2>
            <p className="text-xs text-gray-500">Your key competencies</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-600 rounded-lg text-sm font-medium hover:bg-violet-100 transition-colors"
        >
          {showForm ? (
            <>
              <X size={15} />
              Close
            </>
          ) : (
            <>
              <Plus size={15} />
              Add Skill
            </>
          )}
        </button>
      </div>

      {/* SKILLS LIST */}
      <div className="px-6 py-4">
        {cv.skills?.length === 0 ? (
          <div className="text-center py-6">
            <Zap size={36} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No skills added yet</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {cv.skills?.map((skillItem, idx) => (
              <div
                key={skillItem.id || idx}
                className="group flex items-center gap-2 bg-gradient-to-r from-gray-50 to-white border border-gray-100 px-3 py-1.5 rounded-full hover:shadow-md hover:border-indigo-200 transition-all duration-200"
              >
                <span className="text-sm font-medium text-gray-700">
                  {skillItem.name}
                </span>
                <button
                  onClick={() => handleRemoveSkill(idx)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FORM */}
      {showForm && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Skill Name</label>
              <input
                type="text"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="e.g., React, Python, Figma..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleAddSkill}
                disabled={!skill.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white font-semibold rounded-lg shadow-sm shadow-violet-200 transition-all duration-200 whitespace-nowrap"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SkillsForm;