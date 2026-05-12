import { useState, useEffect } from "react";
import api from "../api";

const SkillSelector = ({ onSkillSelect }) => {
  const [skills, setSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState("");

  // ✅ Fetch skills from backend
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await api.get("/skills/skills/", { withCredentials: true });
        setSkills(res.data); // [{id:1, name:"React", category:"Framework"}, ...]
      } catch (err) {
        console.error("Error fetching skills:", err.response?.data || err.message);
      }
    };
    fetchSkills();
  }, []);

  const handleChange = (e) => {
    const skillId = e.target.value;
    setSelectedSkillId(skillId);
    onSkillSelect(skillId); // pass selected skill ID back to parent
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-300 mb-2">Select Skill</label>
      <select
        value={selectedSkillId}
        onChange={handleChange}
        className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">-- Choose a skill --</option>
        {skills.map((skill) => (
          <option key={skill.id} value={skill.id}>
            {skill.name} ({skill.category})
          </option>
        ))}
      </select>
    </div>
  );
};

export default SkillSelector;
