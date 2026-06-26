import { useState } from "react";
import { useCVStore } from "../../store/useCVStore";
import { updateCVFields } from "../../services/CVServices";
import { Plus, X, Save } from 'lucide-react';

const PersonalInfoForm = () => {
  const [showForm, setShowForm] = useState(false);

  const handleSave = async () => {
    const updatedCV = await updateCVFields(cv.id, {
      personal: cv.personal,
    });
    setCV(updatedCV);
    setShowForm(false);
  };

  const { cv, updatePersonal, setCV } = useCVStore();

  const personal = cv.personal || {};

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-shadow duration-200 hover:shadow-md">

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
            <p className="text-xs text-gray-500">Basic details and contact info</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
        >
          {showForm ? (
            <>
              <X size={15} />
              Close
            </>
          ) : (
            <>
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </>
          )}
        </button>
      </div>

      {/* PERSONAL INFO CARD */}
      <div className="p-6">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {(personal.full_name || "?")[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 truncate">
                {personal.full_name || "Your Name"}
              </h3>
              <div className="mt-1.5 space-y-1">
                {personal.email && (
                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {personal.email}
                  </p>
                )}
                {personal.phone && (
                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {personal.phone}
                  </p>
                )}
                {personal.location && (
                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {personal.location}
                  </p>
                )}
              </div>
            </div>
          </div>

          {personal.summary && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 leading-relaxed">{personal.summary}</p>
            </div>
          )}
        </div>
      </div>

      {/* CONDITIONAL FORM */}
      {showForm && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                value={personal.full_name || ""}
                onChange={(e) => updatePersonal("full_name", e.target.value)}
                placeholder="Full Name"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={personal.email || ""}
                onChange={(e) => updatePersonal("email", e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
              <input
                type="text"
                value={personal.phone || ""}
                onChange={(e) => updatePersonal("phone", e.target.value)}
                placeholder="Phone"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Location</label>
              <input
                type="text"
                value={personal.location || ""}
                onChange={(e) => updatePersonal("location", e.target.value)}
                placeholder="Location"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">LinkedIn</label>
              <input
                type="text"
                value={personal.linkedin || ""}
                onChange={(e) => updatePersonal("linkedin", e.target.value)}
                placeholder="LinkedIn URL"
                className=" w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">GitHub</label>
              <input
                type="text"
                value={personal.github || ""}
                onChange={(e) => updatePersonal("github", e.target.value)}
                placeholder="GitHub URL"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Portfolio</label>
              <input
                type="text"
                value={personal.portfolio || ""}
                onChange={(e) => updatePersonal("portfolio", e.target.value)}
                placeholder="Portfolio URL"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Professional Summary</label>
            <textarea
              placeholder="Tell us about yourself..."
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm resize-none"
              rows={3}
              value={personal.summary || ""}
              onChange={(e) => updatePersonal("summary", e.target.value)}
            />
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm shadow-indigo-200 transition-all duration-200"
            >
              <Save size={16} />
              Save Changes
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

export default PersonalInfoForm;