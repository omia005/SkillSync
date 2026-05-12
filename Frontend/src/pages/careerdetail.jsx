import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api.js"
import { useCareerStore } from "../store/useCareerStore";

const CareerDetailPage = () => {
  const { slug } = useParams();
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);

  const { selectedSlug, selectCareer } = useCareerStore();

  useEffect(() => {
  const fetchCareer = async () => {
    try {
      const res = await api.get(`/skills/career-paths/${slug}/`);
      setCareer(res.data); // ✅ axios uses res.data
    } catch (err) {
      console.error("Error fetching career:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchCareer();
 }, [slug]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!career) return <div className="p-6">Not found</div>;

  const isSelected = selectedSlug === career.slug;

  return (
    <div className="max-w-5xl mx-auto p-6">

      {/* Back */}
      <Link to="/career-paths" className="text-gray-500 mb-6 block">
        ← Back to catalogue
      </Link>

      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-900">
        {career.title}
      </h1>

      <p className="text-gray-600 mt-4">
        {career.description}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="border p-4 rounded-lg">
          <p className="text-sm text-gray-400">Salary</p>
          <p className="font-semibold">{career.salary}</p>
        </div>
        <div className="border p-4 rounded-lg">
          <p className="text-sm text-gray-400">Outlook</p>
          <p className="font-semibold">{career.outlook}</p>
        </div>
        <div className="border p-4 rounded-lg">
          <p className="text-sm text-gray-400">Path</p>
          <p className="font-semibold">3 stages</p>
        </div>
      </div>

      {/* Select Button */}
      <button
        onClick={() => selectCareer(career.slug)}
        className={`mt-6 px-6 py-3 rounded-lg text-white font-medium transition
        ${
          isSelected
            ? "bg-red-600 hover:bg-red-700"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {isSelected
          ? "Unselect career path"
          : "Select this career path"}
      </button>

      {/* Skills */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Skills Required</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {career.skills_required?.map((skill, idx) => (
            <div
              key={idx}
              className="border p-4 rounded-lg flex justify-between"
            >
              <span>{skill.name}</span>
              <span className="text-xs text-gray-500">
                {skill.level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">
          Tools & Technologies
        </h2>
        <div className="flex flex-wrap gap-2">
          {career.tools_needed?.map((tool, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-gray-100 rounded-md text-sm"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
      
      {/* Applications + Industries */}
      <div className="mt-12 grid md:grid-cols-2 gap-10">

         {/* Applications */}
         <div>
             <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                🎯 Application Areas
             </h2>
             <ul className="space-y-2 text-gray-600">
                {career.applications?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                      {item}
                  </li>
                ))}
             </ul>
         </div>

         {/* Industries */}
         <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
               🏢 Industries
            </h2>
            <ul className="space-y-2 text-gray-600">
              {career.industries?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                    {item}
                </li>
              ))}
            </ul>
         </div>
         </div>
         {/* Learning Path */}
         <div className="mt-16">
            <h2 className="text-3xl font-semibold mb-8 flex items-center gap-2">
                🎓 Recommended Learning Path
            </h2>
            <div className="relative border-l border-gray-300 ml-4">
             {career.learning_path?.map((stage, idx) => (
                <div key={idx} className="mb-10 ml-6 relative">

                  {/* Circle */}
                  <div className="absolute -left-[30px] top-1 w-8 h-8 bg-indigo-900 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                     {idx + 1}
                  </div>

                  {/* Title */}
                  <div className="flex items-center gap-3">
                     <h3 className="text-xl font-semibold text-gray-900">
                       {stage.stage}
                     </h3>
                     <span className="text-sm text-gray-500">
                       ⏱ {stage.duration}
                     </span>
                  </div>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-2 mt-3">
                     {stage.topics?.map((topic, idx) => (
                       <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 rounded-md text-sm"
                       >
                          {typeof topic === "string" ? topic : topic.name}
                       </span>
                      ))}
                  </div>

                  {/* Resources */}
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                        Recommended Resources
                    </p>
                    <ul className="text-gray-600 text-sm space-y-1">
                       {stage.resources?.map((res, idx) => (
                         <li key={idx}>
                           •{" "}
                            <a
                               href={res.url}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="text-blue-600 hover:underline"
                            >
                               {res.name}
                            </a>
                         </li>
                        ))}
                   </ul>
                  </div>
                </div>
              ))}
           </div>
         </div>
    </div>
  );
};

export default CareerDetailPage;