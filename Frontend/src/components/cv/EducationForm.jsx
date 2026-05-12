import { useState } from "react";
import { useCVStore } from "../../store/useCVStore";
import { updateCV } from "../../services/CVServices";

const EducationForm = () => {
  const [showForm, setShowForm] = useState(false);

  const {
    cv,
    addEducation,
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

    // ✅ Update Zustand instantly
    addEducation(newEducation);

    // ✅ Save to backend
    await updateCV(cv.id, {
      education: [...(cv.education || []), newEducation],
    });

    // ✅ Reset form
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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-semibold">
          Education
        </h2>

        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          + Add Education
        </button>

      </div>

      {/* EDUCATION CARDS */}
      <div className="space-y-4">

        {cv.education?.map((edu) => (
          <div
            key={edu.id}
            className="border rounded-xl p-4 bg-gray-50"
          >

            <h3 className="font-semibold text-lg">
              {edu.degree}
            </h3>

            <p className="text-gray-600">
              {edu.school}
            </p>

            <p className="text-sm text-gray-500">
              {edu.start_date} - {edu.end_date}
            </p>

            <p className="mt-2 text-gray-700">
              {edu.field_of_study}
            </p>

          </div>
        ))}

      </div>

      {/* FORM */}
      {showForm && (

        <div className="mt-6 border-t pt-6">

          <input
            type="text"
            value={formData.school}
            onChange={(e) =>
              handleChange("school", e.target.value)
            }
            placeholder="School / University"
            className="w-full border rounded-lg p-3 mb-4"
          />

          <input
            type="text"
            value={formData.degree}
            onChange={(e) =>
              handleChange("degree", e.target.value)
            }
            placeholder="Degree"
            className="w-full border rounded-lg p-3 mb-4"
          />

          <input
            type="text"
            value={formData.field_of_study}
            onChange={(e) =>
              handleChange("field_of_study", e.target.value)
            }
            placeholder="Field of Study"
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

          <div className="flex gap-3">

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Save Education
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

export default EducationForm;