import { useEffect, useState } from "react";
import { useCVStore } from "../store/useCVStore";
import { createCV } from "../services/CVServices";
import PersonalInfoForm from "../components/cv/PersonalInfoForm";
import EducationForm from "../components/cv/EducationForm";
import ExperienceForm from "../components/cv/ExperienceForm";
import SkillsForm from "../components/cv/SkillsForm";
import CVPreview from "../components/cv/CVPreview";
import { useRef } from "react";
import html2pdf from "html2pdf.js";
import api from "../api";




const CVBuilderPage = () => {
  const { cv, setCV } = useCVStore();
  const previewRef = useRef(null);
  const [showCV, setShowCV] = useState(false);

  const handleDownloadPDF = async () => {
    const element = previewRef.current;

    console.log(element);

    if (!element) {
      console.error("Preview element not found");
      return;
    }

    const options = {
      margin: 0.5,
      filename: "my-cv.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
      },
    };
  
    console.log(previewRef.current);
    await html2pdf()
     .set(options)
     .from(element)
     .save();
  };

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

  if (!cv) {
    return <div className="p-6">Loading CV Builder...</div>;
  }
 return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT SIDE → Forms */}
        <div className="space-y-6">
          <PersonalInfoForm />
          <EducationForm />
          <ExperienceForm />
          <SkillsForm />
        </div>


        {/* RIGHT SIDE → Preview */}
        <div className="sticky top-6 h-fit">
          <CVPreview ref={previewRef} />
          <button
            onClick={handleDownloadPDF}
            className="mb-6 mt-4 px-5 py-3 bg-indigo-600 text-white rounded-xl"
          >
            Download PDF
          </button>
        </div>

      </div>
    </div>
  );
};

export default CVBuilderPage;