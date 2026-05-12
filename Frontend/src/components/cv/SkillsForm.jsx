import { useState } from "react";
import { useCVStore } from "../../store/useCVStore";
import { updateCV } from "../../services/CVServices";

const SkillsForm = () => {
  const [skill, setSkill] = useState("");

  const { cv, addSkill, removeSkill } = useCVStore();

  const handleAddSkill = () => {
    if (!skill.trim()) return;

    addSkill({
      name: skill,
      level: "Intermediate",
    });

    setSkill("");
  };
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6">
        Skills
      </h2>

      <div className="flex gap-3">
        <input
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          placeholder="Add a skill"
          className="flex-1 border rounded-lg p-3"
        />

        <button
          onClick={handleAddSkill}
          className="bg-indigo-600 text-white px-4 rounded-lg"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {cv.skills?.map((skill, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg"
          >
            <span>{skill.name}</span>

            <button
              onClick={() => removeSkill(idx)}
              className="text-red-500"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsForm;