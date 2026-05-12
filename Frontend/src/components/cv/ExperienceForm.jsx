import { useState } from "react";
import { useCVStore } from "../../store/useCVStore";
import { updateCV } from "../../services/CVServices";

const ExperienceForm = () => {

  const [showForm, setShowForm] = useState(false);

  const {
    cv,
    addExperience,
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

    // ✅ Instant UI update
    addExperience(newExperience);

    // ✅ Save backend
    await updateCV(cv.id, {
      experience: [...(cv.experience || []), newExperience],
    });

    // ✅ Reset
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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-semibold">
          Experience
        </h2>

        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          + Add Experience
        </button>

      </div>

      {/* EXPERIENCE CARDS */}
      <div className="space-y-4">

        {cv.experience?.map((exp) => (
          <div
            key={exp.id}
            className="border rounded-xl p-4 bg-gray-50"
          >

            <h3 className="font-semibold text-lg">
              {exp.role}
            </h3>

            <p className="text-gray-600">
              {exp.company}
            </p>

            <p className="text-sm text-gray-500">
              {exp.start_date} - {exp.end_date}
            </p>

            <p className="mt-3 text-gray-700">
              {exp.description}
            </p>

          </div>
        ))}

      </div>

      {/* FORM */}
      {showForm && (

        <div className="mt-6 border-t pt-6">

          <input
            type="text"
            value={formData.company}
            onChange={(e) =>
              handleChange("company", e.target.value)
            }
            placeholder="Company"
            className="w-full border rounded-lg p-3 mb-4"
          />

          <input
            type="text"
            value={formData.role}
            onChange={(e) =>
              handleChange("role", e.target.value)
            }
            placeholder="Role"
            className="w-full border rounded-lg p-3 mb-4"
          />

          <div className="grid grid-cols-2 gap-4 mb-4">

            <input
              type="text"
              value={formData.start_date}
              onChange={(e) =>
                handleChange("start_date", e.target.value)
              }
              placeholder="Start Date"
              className="border rounded-lg p-3"
            />

            <input
              type="text"
              value={formData.end_date}
              onChange={(e) =>
                handleChange("end_date", e.target.value)
              }
              placeholder="End Date"
              className="border rounded-lg p-3"
            />

          </div>

          <textarea
            value={formData.description}
            onChange={(e) =>
              handleChange("description", e.target.value)
            }
            placeholder="Description"
            className="w-full border rounded-lg p-3 mb-4"
          />

          <div className="flex gap-3">

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Save Experience
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-lg"
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