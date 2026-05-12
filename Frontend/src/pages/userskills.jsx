import {useState, useEffect} from "react"
import api from '../api'
import SkillSelector from "../components/skillselector";
import { Plus, Trash2, Edit } from 'lucide-react';

const Skills = () => {

  const [skills, setSkills] = useState([])
  const [selectedSkillId, setSelectedSkillId] = useState(null)
  const [proficiency, setProficiency] = useState("Beginner")
  const [category, setCategory] = useState("")

  
    const fetchSkills = async () => {
      try {
        const res = await api.get("/skills/user-skills/", {withCredentials: true}
        );
        setSkills(res.data);
      } catch (err) {
        console.error("Failed to fetch skills:", err.response?.data || err.message);
      }
    };

    useEffect(() =>{
      fetchSkills()
    }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkillId || !category || !proficiency) return;
     

    try {
      const res = await api.post(
        "/skills/user-skills/",
        { skill_id : selectedSkillId, category, proficiency },
        {withCredentials: true}
      );
      
      setSelectedSkillId(null);
      setCategory("");
      setProficiency("Beginner");
      fetchSkills()
      
    } catch (err) {
      console.error("Error adding skill:", err.response?.data || err.message);
    }
  };

  // ✅ Delete skill
   const handleDeleteSkill = async (id) => {
     try {
       await api.delete(`/skills/user-skills/${id}/`, {withCredentials:true});
       setSkills(skills.filter((skill) => skill.id !== id));
     } catch (err) {
       console.error("Error deleting skill:", err.response?.data || err.message);
     }
  }; 


  return (
    <div className="w-full h-screen p-8 text-white">
      <h1 className="text-3xl font-bold mb-2 text-black">My Skills</h1>
      <p className="text-gray-600 mb-6">Log and manage your acquired skills.</p>
      

      {/* Add Skill Form */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 max-w-3xl mb-8">
        <h2 className="text-xl font-semibold mb-4">Add a Skill</h2>
        <form onSubmit={handleAddSkill} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkillSelector onSkillSelect={setSelectedSkillId} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Category</option>
            <option value="Framework">Framework</option>
            <option value="Programming Language">Programming Language</option>
            <option value="Databases">Databases</option>
            <option value="Tool">Tool</option>
            <option value="Soft skill">Soft skill</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value)}
            className="w-full  rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition md:col-span-3"
          >
            <Plus size={20} />
            Add
          </button>
        </form>
      </div>
        
      {/* Skills List */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 max-w-3xl mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Your Skills ({skills.length})
        </h2>
        {skills.length === 0 ? (
          <p className="text-gray-400">No skills added yet.</p>
        ) : (
          <ul className="space-y-4">
            {skills.map((skill) => (
              <li
                key={skill.id}
                className="flex items-center justify-between bg-gray-700 p-4 rounded-lg"
              >
                <div>
                  <p className="text-lg font-semibold">{skill.skill.name}</p>
                  <p className="text-sm text-gray-400">
                    {skill.category} • {skill.proficiency}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="text-yellow-400 hover:text-yellow-500">
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      
    </div>
  );
}

export default Skills