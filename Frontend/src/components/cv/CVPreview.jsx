import React, { forwardRef } from "react";
import { useCVStore } from "../../store/useCVStore";

const CVPreview = forwardRef((props, ref) => {

  const { cv } = useCVStore();

  const personal = cv?.personal || {};

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl shadow-lg p-10 border border-gray-200 text-gray-900"
    >

      {/* HEADER */}
      <div className="border-b pb-6">

        <h1 className="text-4xl font-bold">
          {personal.full_name || "Your Name"}
        </h1>

        <div className="mt-3 text-sm text-gray-600 space-y-1">

          <p>{personal.email}</p>

          <p>{personal.phone}</p>

          <p>{personal.location}</p>

        </div>

        <p className="mt-4 text-gray-700 leading-relaxed">
          {personal.summary}
        </p>

      </div>

      {/* EXPERIENCE */}
      <div className="mt-8">

        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">
          Experience
        </h2>

        <div className="space-y-6">

          {cv.experience?.map((exp) => (

            <div key={exp.id}>

              <div className="flex items-center justify-between">

                <h3 className="text-lg font-semibold">
                  {exp.role}
                </h3>

                <span className="text-sm text-gray-500">
                  {exp.start_date} - {exp.end_date}
                </span>

              </div>

              <p className="text-gray-700 font-medium">
                {exp.company}
              </p>

              <p className="mt-2 text-gray-600 leading-relaxed">
                {exp.description}
              </p>

            </div>

          ))}

        </div>

      </div>

      {/* EDUCATION */}
      <div className="mt-8">

        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">
          Education
        </h2>

        <div className="space-y-6">

          {cv.education?.map((edu) => (

            <div key={edu.id}>

              <div className="flex items-center justify-between">

                <h3 className="text-lg font-semibold">
                  {edu.degree}
                </h3>

                <span className="text-sm text-gray-500">
                  {edu.start_date} - {edu.end_date}
                </span>

              </div>

              <p className="text-gray-700 font-medium">
                {edu.school}
              </p>

              <p className="mt-2 text-gray-600">
                {edu.field_of_study}
              </p>

            </div>

          ))}

        </div>

      </div>

      {/* SKILLS */}
      <div className="mt-8">

        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">
          Skills
        </h2>

        <div className="flex flex-wrap gap-2">

          {cv.skills?.map((skill, idx) => (

            <span
              key={idx}
              className="px-3 py-1 bg-gray-100 rounded-md text-sm"
            >
              {skill.name}
            </span>

          ))}

        </div>

      </div>

    </div>
  );
});

CVPreview.displayName = "CVPreview";

export default CVPreview;