import React, { forwardRef } from "react";
import { useCVStore } from "../../store/useCVStore";

const CVPreview = forwardRef((props, ref) => {

  const { cv } = useCVStore();

  const personal = cv?.personal || {};

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        width: "100%",
        maxWidth: "210mm",
        margin: "0 auto",
        padding: "30px",
        boxSizing: "border-box",
      }}
    >

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: "bold", fontSize: "32px", flexShrink: 0 }}>
            {(personal.full_name || "?")[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: "30px", fontWeight: "bold", color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {personal.full_name || "Your Name"}
            </h1>
            <p style={{ color: "#4f46e5", fontWeight: 500, marginTop: "2px" }}>
              {personal.role || "Professional Title"}
            </p>
            <div style={{ marginTop: "8px", fontSize: "14px", color: "#6b7280" }}>
              {personal.email && <p style={{ margin: "4px 0" }}>{personal.email}</p>}
              {personal.phone && <p style={{ margin: "4px 0" }}>{personal.phone}</p>}
              {personal.location && <p style={{ margin: "4px 0" }}>{personal.location}</p>}
              {personal.linkedin && (
                <p style={{ color: "#4f46e5", margin: "4px 0" }}>
                  {personal.linkedin}
                </p>
              )}
            </div>
          </div>
        </div>

        {personal.summary && (
          <p style={{ marginTop: "16px", color: "#4b5563", lineHeight: 1.6, fontSize: "14px" }}>
            {personal.summary}
          </p>
        )}
      </div>

      {/* EXPERIENCE */}
      {cv.experience && cv.experience.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#1f2937", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px" }}>
            Professional Experience
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {cv.experience.map((exp) => (
              <div key={exp.id} style={{ borderLeft: "3px solid #818cf8", paddingLeft: "16px", paddingY: "4px", marginLeft: "-1px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: 0 }}>
                    {exp.role}
                  </h3>
                  <span style={{ fontSize: "12px", color: "#6b7280", backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: "9999px" }}>
                    {exp.start_date} – {exp.end_date}
                  </span>
                </div>

                <p style={{ color: "#4b5563", fontWeight: 500, fontSize: "14px", marginTop: "2px" }}>
                  {exp.company}
                </p>

                {exp.description && (
                  <p style={{ marginTop: "6px", color: "#4b5563", fontSize: "14px", lineHeight: 1.6 }}>
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDUCATION */}
      {cv.education && cv.education.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#1f2937", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px" }}>
            Education
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {cv.education.map((edu) => (
              <div key={edu.id} style={{ borderLeft: "3px solid #fbbf24", paddingLeft: "16px", paddingY: "4px", marginLeft: "-1px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: 0 }}>
                    {edu.degree}
                  </h3>
                  <span style={{ fontSize: "12px", color: "#6b7280", backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: "9999px" }}>
                    {edu.start_date} – {edu.end_date}
                  </span>
                </div>

                <p style={{ color: "#4b5563", fontWeight: 500, fontSize: "14px", marginTop: "2px" }}>
                  {edu.school}
                </p>

                {edu.field_of_study && (
                  <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                    {edu.field_of_study}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SKILLS */}
      {cv.skills && cv.skills.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#1f2937", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px" }}>
            Skills
          </h2>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {cv.skills.map((skill) => (
              <span
                key={skill.id}
                style={{
                  padding: "6px 12px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                  borderRadius: "9999px",
                  background: "linear-gradient(135deg, #eef2ff, #f3e8ff)",
                  border: "1px solid #e0e7ff",
                }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #f3f4f6", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#9ca3af" }}>
          Generated with SkillSync • {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

    </div>
  );
});

CVPreview.displayName = "CVPreview";

export default CVPreview;