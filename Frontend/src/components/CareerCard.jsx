import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Code,
  Zap,
  BrainCog,
  Target,
  Route,
  GraduationCap,
  Award,
  Briefcase,
  CheckCircle2,
  FileUser,
  UserCog,
  ChartLine,
  Plus,
  Sparkles,
  MoveRight,
  Trophy,
  Shield,
  BarChart2,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  AlertCircle,
  Loader2,
  Star,
  ArrowUpRight,
} from "lucide-react";
import { useCareerStore } from "../store/useCareerStore";

const iconMap = {
  BookOpen,
  Code,
  Zap,
  BrainCog,
  Target,
  Route,
  GraduationCap,
  Award,
  Briefcase,
  CheckCircle2,
  FileUser,
  UserCog,
  ChartLine,
  Plus,
  Sparkles,
  MoveRight,
  Trophy,
  Shield,
  BarChart2,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  AlertCircle,
  Loader2,
  Star,
  ArrowUpRight,
};

const DynamicIcon = ({ name, className }) => {
  const LucideIcon = iconMap[name];
  if (!LucideIcon) return null;
  return <LucideIcon className={className} />;
};

/* Soft background colors keyed by icon name so each career has its own tint */
const ICON_BG = {
  Code: "bg-blue-50 text-blue-600",
  BrainCog: "bg-indigo-50 text-indigo-600",
  Briefcase: "bg-purple-50 text-purple-600",
  Route: "bg-teal-50 text-teal-600",
  Target: "bg-rose-50 text-rose-600",
  GraduationCap: "bg-amber-50 text-amber-600",
  Award: "bg-yellow-50 text-yellow-600",
  Shield: "bg-emerald-50 text-emerald-600",
  FileUser: "bg-sky-50 text-sky-600",
  TrendingUp: "bg-lime-50 text-lime-600",
  Clock: "bg-orange-50 text-orange-600",
  Users: "bg-fuchsia-50 text-fuchsia-600",
  BookOpen: "bg-cyan-50 text-cyan-600",
  ChartLine: "bg-green-50 text-green-600",
  UserCog: "bg-violet-50 text-violet-600",
  CheckCircle2: "bg-emerald-50 text-emerald-600",
  Sparkles: "bg-indigo-50 text-indigo-600",
  Award: "bg-yellow-50 text-yellow-600",
};

const CareerCard = ({ path, isSelected }) => {
  // Normalize tools
  const tools = Array.isArray(path.tools_needed)
    ? path.tools_needed
    : path.tools_needed?.split(",").map((t) => t.trim()) || [];

  // Pick icon style; fall back to gray
  const iconStyle = ICON_BG[path.icon] || "bg-gray-100 text-gray-600";

  // Selected-card accent border color
  const selectedAccent =
    "from-amber-400 to-orange-400";
  const defaultAccent = "from-indigo-400 to-indigo-600";

  return (
    <Link
      to={`/career-paths/${path.slug}`}
      className={`
        group relative flex flex-col p-6 rounded-2xl transition-all duration-300
        ring-1 ring-black/[0.04]
        ${
          isSelected
            ? "bg-amber-50/80 border-2 border-amber-400 shadow-lg shadow-amber-200/50"
            : "bg-white border border-gray-200 hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1 hover:shadow-indigo-100/60"
        }
      `}
    >
      {/* Selected badge */}
      {isSelected && (
        <div className="absolute -top-3 right-4 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
          <Star size={11} fill="white" />
          Selected
        </div>
      )}

      {/* Category pill */}
      {path.category && (
        <span className="mb-3 self-start inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
          <Briefcase size={10} />
          {path.category}
        </span>
      )}

      {/* Header with icon + title + description */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className={`
            p-3 rounded-xl transition-all duration-300
            ${isSelected ? "bg-amber-100 text-amber-700" : iconStyle}
            group-hover:scale-110
          `}
        >
          <DynamicIcon name={path.icon} className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg font-bold text-gray-900 truncate leading-snug">
              {path.title}
            </h2>
          </div>
          <p className="text-gray-500 text-sm mt-1 leading-relaxed line-clamp-2">
            {path.description}
          </p>
        </div>
      </div>

      {/* Dotted separator */}
      <div className="my-4 border-t border-dashed border-gray-200" />

      {/* Tools / skills needed */}
      {tools.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tools.slice(0, 5).map((tool, idx) => (
            <span
              key={idx}
              className={`
                inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border
                ${
                  isSelected
                    ? "bg-amber-100/70 text-amber-800 border-amber-200"
                    : "bg-gray-50 text-gray-600 border-gray-200 group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-200"
                }
                transition-colors duration-200
              `}
            >
              {tool}
            </span>
          ))}
          {tools.length > 5 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold text-gray-400">
              +{tools.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div
        className={`
          mt-5 pt-4 flex items-center justify-between
          ${isSelected ? "border-t border-amber-200/60" : "border-t border-gray-100"}
        `}
      >
        <span
          className={`
            text-xs font-semibold flex items-center gap-1.5
            ${isSelected ? "text-amber-600" : "text-gray-500 group-hover:text-indigo-600"}
            transition-colors duration-200
          `}
        >
          <ArrowUpRight size={13} />
          View details
        </span>
        <span
          className={`
            text-xs flex items-center gap-1 font-medium transition-colors duration-200
            ${
              isSelected
                ? "text-amber-600"
                : "text-gray-400 group-hover:text-indigo-600"
            }
          `}
        >
          Explore
          <MoveRight
            size={13}
            className={`transition-transform duration-200 ${
              isSelected ? "" : "group-hover:translate-x-1"
            }`}
          />
        </span>
      </div>

      {/* Hover glow background */}
      <div
        className={`
          absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300
          bg-gradient-to-br ${isSelected ? "from-amber-400/5 to-orange-400/5" : "from-indigo-500/0 to-purple-500/0"}
          group-hover:opacity-100 group-hover:from-indigo-500/5 group-hover:to-purple-500/5
          ${isSelected ? "opacity-100" : "opacity-0"}
        `}
      />
    </Link>
  );
};

export default CareerCard;
