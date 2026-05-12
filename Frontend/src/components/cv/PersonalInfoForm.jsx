import { useState } from "react";
import { useCVStore } from "../../store/useCVStore";
import { updateCV } from "../../services/CVServices";

const PersonalInfoForm = () => {
  const [showForm, setShowForm] = useState(false);

  const handleSave = async () => {
    await updateCV(cv.id, {
      personal: cv.personal,
    });
    setShowForm(false);
  };

  const { cv, updatePersonal } = useCVStore();

  const personal = cv.personal || {};

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <h2 className="text-2xl font-semibold">
          Personal Information
        </h2>

        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Edit Information
        </button>

      </div>

      {/* PERSONAL INFO CARD */}
      <div className="border rounded-xl p-4 bg-gray-50">

        <h3 className="font-semibold text-xl">
          {personal.full_name || "Your Name"}
        </h3>

        <p className="text-gray-600 mt-2">
          {personal.email || "you@example.com"}
        </p>

        <p className="text-gray-600">
          {personal.phone || "Phone Number"}
        </p>

        <p className="text-gray-600">
          {personal.location || "Location"}
        </p>

        <p className="mt-4 text-gray-700">
          {personal.summary || "Professional Summary"}
        </p>

      </div>

      {/* CONDITIONAL FORM */}
      {showForm && (

        <div className="mt-6 border-t pt-6">

          <div className="grid md:grid-cols-2 gap-4">

           <input
             type="text"
             value={personal.full_name || ""}
             onChange={(e) => updatePersonal("full_name", e.target.value)}
             placeholder="Full Name"
             className="border rounded-lg p-3"
           />

            <input
              type="email"
              value={personal.email || ""}
              onChange={(e) => updatePersonal("email", e.target.value)}
              placeholder="Email"
              className="border rounded-lg p-3"
            />

            <input
              type="text"
              value={personal.phone || ""}
              onChange={(e) => updatePersonal("phone", e.target.value)}
              placeholder="Phone"
              className="border rounded-lg p-3"
            />

            <input
              type="text"              
              value={personal.location || ""}
              onChange={(e) => updatePersonal("location", e.target.value)}
              placeholder="Location"
              className="border rounded-lg p-3"
            />

          </div>

          <textarea
            placeholder="Professional Summary"
            className="border rounded-lg p-3 w-full mt-4 min-h-[120px]"
            value={personal.summary || ""}
            onChange={(e) => updatePersonal("summary", e.target.value)}
          />

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 mt-4">

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Save Information
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

export default PersonalInfoForm;