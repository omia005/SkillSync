import { useEffect, useState } from "react";
import { useCVStore } from "../store/useCVStore";
import { createCV } from "../services/CVServices";
import PersonalInfoForm from "../components/cv/PersonalInfoForm";
import EducationForm from "../components/cv/EducationForm";
import ExperienceForm from "../components/cv/ExperienceForm";
import SkillsForm from "../components/cv/SkillsForm";
import CVPreview from "../components/cv/CVPreview";
import { useRef, useCallback } from "react";
import html2pdf from "html2pdf.js";
import api from "../api";
import {
   FileUser,
   Download,
   Save,
   CheckCircle,
   AlertCircle,
   Loader2,
   Send,
   User,
   GraduationCap,
   Briefcase,
   Layers,
   ChevronRight,
} from "lucide-react";

const sections = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "skills", label: "Skills", icon: Layers },
];

const CVBuilderPage = () => {
   
   // Validate CV data before saving
   const validateCVData = (cvData) => {
     if (!cvData) return false;
     
     // Basic validation - ensure we have at least some data
     // You can customize this based on your requirements
     return true;
   };
   const { cv, setCV } = useCVStore();
   const previewRef = useRef(null);
   const [saveStatus, setSaveStatus] = useState(null);
   const [activeSection, setActiveSection] = useState("personal");
   const prevCvRef = useRef(null);
   const isSavingRef = useRef(false);

  const handleDownloadPDF = async () => {
    const element = previewRef.current;

    if (!element) {
      console.error("Preview element not found");
      return;
    }

    setSaveStatus("saving");

    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `${cv?.personal?.full_name || "my-cv"}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
      },
    };

    try {
      await html2pdf().set(opt).from(element).save();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

    const handleSaveCV = useCallback(async () => {
      if (!cv || !cv.id) return;
      try {
        setSaveStatus("saving");
        await api.put(`/cv/${cv.id}/`, cv);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(null), 2000);
      } catch (err) {
        console.error(err);
        setSaveStatus("error");
        setTimeout(() => setSaveStatus(null), 3000);
      }
    }, [cv]);

   useEffect(() => {
     const initializeCV = async () => {
       const fetchCV = async () => {
         try {
           const res = await api.get("/cv/");
           if (res.data.length > 0) {
             setCV(res.data[0]);
           } else {
             const created = await createCV();
             setCV(created);
           }
         } catch (err) {
           console.error(err);
         }
       };
       await fetchCV();
     };

     initializeCV();
   }, []);

// Auto-save CV whenever it changes (with debounce)
    useEffect(() => {
      if (cv && saveStatus === null && !isSavingRef.current) {
        // Validate CV data before saving
        if (validateCVData(cv)) {
          // Check if CV has actually changed since last auto-save
          const cvChanged = JSON.stringify(cv) !== JSON.stringify(prevCvRef.current);
          if (cvChanged) {
            prevCvRef.current = cv;
            // Debounce the save - longer delay to avoid interrupting typing
            const handler = setTimeout(() => {
              isSavingRef.current = true;
              handleSaveCV().finally(() => {
                isSavingRef.current = false;
              });
            }, 3000); // 3 seconds after the last change

            return () => {
              clearTimeout(handler);
            };
          }
        }
      }
    }, [cv]);

  if (!cv) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading CV Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <FileUser size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CV Builder</h1>
                <p className="text-sm text-gray-500">Build your professional resume</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {saveStatus && (
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    saveStatus === "saving"
                      ? "bg-yellow-50 text-yellow-700"
                      : saveStatus === "saved"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {saveStatus === "saving" && <Loader2 className="animate-spin" size={14} />}
                  {saveStatus === "saved" && <CheckCircle size={14} />}
                  {saveStatus === "error" && <AlertCircle size={14} />}
                  <span>
                    {saveStatus === "saving"
                      ? "Saving..."
                      : saveStatus === "saved"
                      ? "Saved!"
                      : "Error"}
                  </span>
                </div>
              )}
              <button
                onClick={handleSaveCV}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-sm shadow-indigo-200/30 font-semibold text-sm"
              >
                <Save size={16} />
                Save CV
              </button>
            </div>
          </div>

          {/* Section Progress Bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              {sections.map((section, i) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                const isCompleted = isActive || sections.findIndex((s) => s.id === activeSection) > i;
                return (
                  <div key={section.id} className="flex items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                          isCompleted
                            ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md"
                            : isActive
                            ? "bg-indigo-50 text-indigo-600 ring-2 ring-indigo-200"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <span
                        className={`text-xs font-medium whitespace-nowrap transition-colors ${
                          isCompleted ? "text-indigo-600" : isActive ? "text-indigo-500" : "text-gray-400"
                        }`}
                      >
                        {section.label}
                      </span>
                    </div>
                    {i < sections.length - 1 && (
                      <div
                        className={`w-8 h-0.5 mx-2 transition-colors ${
                          sections.findIndex((s) => s.id === activeSection) > i
                            ? "bg-gradient-to-r from-indigo-400 to-purple-400"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Forms Column */}
          <div className="xl:col-span-2 space-y-6">
            {/* Section Navigation Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-1 overflow-x-auto">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200/30"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={16} />
                    {section.label}
                  </button>
                );
              })}
            </div>

            {/* Personal Info Section */}
            <div
              className={`transition-all duration-300 ${
                activeSection === "personal" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none h-0 overflow-hidden"
              }`}
            >
              <PersonalInfoForm />
            </div>

            {/* Education & Experience Side by Side */}
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-300 ${
                activeSection === "education" || activeSection === "experience"
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 pointer-events-none h-0 overflow-hidden"
              }`}
            >
              <div
                className={`transition-all duration-300 ${
                  activeSection === "education" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none h-0 overflow-hidden"
                }`}
              >
                <EducationForm />
              </div>
              <div
                className={`transition-all duration-300 ${
                  activeSection === "experience" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none h-0 overflow-hidden"
                }`}
              >
                <ExperienceForm />
              </div>
            </div>

            {/* Skills Section */}
            <div
              className={`transition-all duration-300 ${
                activeSection === "skills" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none h-0 overflow-hidden"
              }`}
            >
              <SkillsForm />
            </div>

            {/* Quick Actions Footer */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-indigo-800">Ready to download?</h3>
                <p className="text-xs text-indigo-600 mt-0.5">Your CV is ready to export as a PDF.</p>
              </div>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-200/30 transition-all duration-200 whitespace-nowrap"
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>

          {/* Preview Column */}
          <div className="xl:sticky xl:top-24 h-fit">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  <FileUser size={16} />
                  Live Preview
                </h2>
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                  Auto-saved
                </span>
              </div>
<div className="max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
                 <CVPreview ref={previewRef} />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVBuilderPage;