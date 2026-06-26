import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { UserCog, Save, Loader2, Edit, CheckCircle, User, Mail, GraduationCap, Link2, FileText, Globe, BookOpen, Sparkles } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { toast } from "react-toastify";

function SetupProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    linkedIn: "",
    github: "",
    portfolio: "",
    university: "",
    major: "",
    graduationYear: "",
    yearOfStudy: "",
    profilePicture: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile/", { withCredentials: true });
        const data = res.data;
        setForm((prev) => ({
          ...prev,
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
          bio: data.bio || "",
          linkedIn: data.linkedIn || "",
          github: data.github || "",
          portfolio: data.portfolio || "",
          university: data.university || "",
          major: data.major || "",
          graduationYear: data.graduationYear || "",
          yearOfStudy: data.yearOfStudy || "",
          profilePicture: data.profile_picture || "",
        }));
        setProfileComplete(!!data.is_profile_complete);
        setSubmitted(!!data.is_profile_complete);
      } catch (err) {
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(
        "/users/profile/",
        form,
        { withCredentials: true }
      );
      sessionStorage.setItem("is_profile_complete", "true");
      setProfileComplete(true);
      setSubmitted(true);
      toast.success("Profile saved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setSubmitted(false);

  const initials = `${form.firstName?.[0] || "U"}${form.lastName?.[0] || "S"}`;

  const fields = [
    { name: "firstName", label: "First Name", icon: User, required: true },
    { name: "lastName", label: "Last Name", icon: User, required: true },
    { name: "email", label: "Email", icon: Mail, type: "email", required: true },
    { name: "university", label: "University", icon: GraduationCap, placeholder: "e.g., MIT" },
    { name: "major", label: "Major / Program", icon: BookOpen, placeholder: "e.g., Computer Science" },
    { name: "graduationYear", label: "Graduation Year", icon: CalendarIcon, placeholder: "e.g., 2025", type: "number" },
    { name: "yearOfStudy", label: "Year of Study", icon: CalendarIcon, placeholder: "e.g., 3" },
    { name: "linkedIn", label: "LinkedIn URL", icon: FaLinkedin, placeholder: "https://linkedin.com/in/..." },
    { name: "github", label: "GitHub URL", icon: FaGithub, placeholder: "https://github.com/..." },
    { name: "portfolio", label: "Portfolio URL", icon: Globe, placeholder: "https://yoursite.com" },
  ];

  const countFilled = Object.values(form).filter((v) => v && String(v).trim()).length;
  const totalFields = Object.keys(form).length;
  const completionPercent = Math.round((countFilled / totalFields) * 100);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-200/30">
              {form.profilePicture ? (
                <img src={form.profilePicture} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${profileComplete ? "bg-emerald-400" : "bg-amber-400"}`}>
              {profileComplete ? <CheckCircle size={12} className="text-white" /> : <Sparkles size={12} className="text-white" />}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{form.firstName || "Your"} Profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {profileComplete
                ? "Your profile is complete and up to date"
                : `Complete your profile to unlock all features — ${completionPercent}% done`}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden max-w-xs">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completionPercent >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
                    completionPercent >= 50 ? "bg-gradient-to-r from-blue-500 to-indigo-500" :
                    "bg-gradient-to-r from-amber-500 to-orange-500"
                  }`}
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-500">{completionPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {submitted ? ( 
        <div className="space-y-5">
          {/* Personal Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <User size={18} />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Personal Information</h2>
              </div>
              {profileComplete && (
                <span className="flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                  <CheckCircle size={12} />
                  Verified
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["Full Name", `${form.firstName} ${form.lastName}`],
                ["Email", form.email],
                ["University", form.university || "Not set"],
                ["Major", form.major || "Not set"],
                ["Year of Study", form.yearOfStudy || "Not set"],
                ["Graduation Year", form.graduationYear || "Not set"],
              ].map(([label, value], i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-sm text-gray-800 font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Links Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <Link2 size={18} />
              </div>
              Links & Socials
            </h2>
            <div className="space-y-3">
{[
                 ["LinkedIn", form.linkedIn, FaLinkedin],
                 ["GitHub", form.github, FaGithub],
                 ["Portfolio", form.portfolio, Globe],
               ].map(([label, value, Icon], i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <Icon size={18} className="text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
                    {value ? (
                      <a href={value.startsWith("http") ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline truncate">
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Not provided</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bio Card */}
          {form.bio && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <FileText size={18} />
                </div>
                Bio
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">{form.bio}</p>
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-indigo-800">Want to make changes?</h3>
              <p className="text-xs text-indigo-600 mt-0.5">Click edit to update your profile information.</p>
            </div>
            <button
              onClick={handleEdit}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm shadow-indigo-200/30"
            >
              <Edit size={16} className="inline mr-1.5" />
              Edit Profile
            </button>
          </div>
        </div>
      ) : (
        /* EDIT MODE */
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <UserCog size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Personal Information</h2>
                <p className="text-xs text-gray-400">Basic details about you</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.slice(0, 6).map((f) => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {f.label} {f.required && <span className="text-red-400">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={f.type || "text"}
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleChange}
                      placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}`}
                      className="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-all bg-gray-50"
                      required={f.required}
                    />
                    <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <Link2 size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Links & Socials</h2>
                <p className="text-xs text-gray-400">Optional — connect your profiles</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.slice(6).map((f) => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                  <div className="relative">
                    <input
                      type="text"
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleChange}
                      placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}`}
                      className="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-all bg-gray-50"
                    />
                    <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <FileText size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Bio</h2>
                <p className="text-xs text-gray-400">A brief intro about you and your goals</p>
              </div>
            </div>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself, your interests, and career aspirations..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-all resize-none bg-gray-50"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200/30 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

// Simple calendar icon component
function CalendarIcon({ className, size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

export default SetupProfile;