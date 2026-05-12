import React from 'react'
import { Link } from 'react-router-dom'
import { icons } from 'lucide-react';
import { useCareerStore } from "../store/useCareerStore";


const DynamicIcon = ({ name, className}) => {
  const LucideIcon = icons[name]; // 'name' must match PascalCase icon name (e.g., 'Camera')
  return <LucideIcon className={className} />;
};


const CareerCard = ({ path , isSelected }) => {

  
  

  // Normalize tools
  const tools = Array.isArray(path.tools_needed)
    ? path.tools_needed
    : (path.tools_needed?.split(",").map(t => t.trim()) || []);

  return (
   <Link
     to={`/career-paths/${path.slug}`}
     className={`relative group block p-6 rounded-2xl transition-all duration-200
     ${
        isSelected
          ? "bg-white border-2 border-amber-400 shadow-md"
          : "bg-white border border-gray-200 ring-1 ring-gray-100 hover:shadow-md hover:border-gray-300 hover:-translate-y-1"
     }
     `}
    >
    <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold">
        {isSelected ? (
      <>
         <span className="text-amber-500">●</span>
         <span className="text-amber-600 uppercase tracking-wide">
           Selected Track
         </span>
      </>
      ) : (
        <span className="text-gray-400 uppercase tracking-wide">
         Track
        </span>
      )}
    </div>

    {/* Header */}
    <div className="flex items-start gap-4">
      <div className="p-3 bg-gray-100 rounded-lg">
        <DynamicIcon name={path.icon} className="w-6 h-6 text-gray-700" />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {path.title}
        </h2>
        <p className="text-gray-500 mt-2 text-sm leading-relaxed line-clamp-3">
          {path.description}
        </p>
      </div>
    </div>

    {/* Tools */}
    <div className="mt-5 flex flex-wrap gap-2">
  {tools.map((tool, idx) => (
    <span
      key={idx}
      className="inline-flex w-auto border px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
    >
      {tool}
    </span>
  ))}
</div>

    {/* Footer */}
    <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
      {<span className="flex items-center gap-2">
       <DynamicIcon name="BookOpen"/><span>3-stage path</span>
      </span>}

      <span className="flex items-center gap-1 font-medium text-gray-700 group-hover:text-black transition">
        Explore →
      </span>
    </div>
  </Link>
);
};


export default CareerCard