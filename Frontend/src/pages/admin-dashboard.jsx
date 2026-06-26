import React, { useState, useEffect } from "react";
import api from "../api";
import {
  Users,
  TrendingUp,
  BarChart3,
  BarChart2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  GraduationCap,
  Target,
  Shield,
  Award,
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCareerPaths: 0,
    totalSkills: 0,
    profileCompletion: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [careerDist, setCareerDist] = useState([]);
  const [topSkills, setTopSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get("/skills/admin/stats/");

        if (!res.data) {
          setError("No data received from server");
          return;
        }

        const data = res.data;
        console.log("API data:", JSON.stringify(data, null, 2));

        setStats({
          totalUsers: Number(data.users?.students ?? data.users?.total ?? 0),
          activeUsers: Number(data.users?.active ?? 0),
          totalCareerPaths: Number(
            data.career_paths_detail?.length ?? 0
          ),
          totalSkills: Number(data.total_skills_count ?? 0),
          profileCompletion: Math.round(
            (Number(data.users?.profile_complete ?? 0) /
              Math.max(Number(data.users?.total ?? 1), 1)) *
              100
          ),
        });

        // Handle both nested (data.users.recent) and flat (data.recent_users) formats
        const recent =
          data.users?.recent || data.recent_users || data.recentUsers || [];
        setRecentUsers(Array.isArray(recent) ? recent : []);

        const dist =
          data.career_path_distribution || data.careerDist || [];
        setCareerDist(Array.isArray(dist) ? dist : []);

        const skills = data.top_skills || data.topSkills || [];
        setTopSkills(Array.isArray(skills) ? skills : []);
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load dashboard";
        const status = err?.response?.status;
        console.error("Admin stats fetch failed:", status, err);

        if (status === 403) {
          setError(
            "Access denied. Your account does not have admin privileges."
          );
        } else if (status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError(
            msg +
              (status ? ` (HTTP ${status})` : "") +
              ". Is the backend server running?"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">
            Connection Error
          </h2>
          <p className="text-red-600 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Students",
      value: stats.totalUsers,
      icon: <GraduationCap size={20} />,
      color: "from-blue-500 to-blue-600",
      change: `${stats.activeUsers} active`,
    },
    {
      label: "Career Paths",
      value: stats.totalCareerPaths,
      icon: <Target size={20} />,
      color: "from-purple-500 to-purple-600",
      change: "Available tracks",
    },
    {
      label: "Skill Catalog",
      value: stats.totalSkills,
      icon: <Award size={20} />,
      color: "from-amber-500 to-amber-600",
      change: "Unique skills",
    },
    {
      label: "Profile Completion",
      value: `${stats.profileCompletion}%`,
      icon: <CheckCircle2 size={20} />,
      color: "from-emerald-500 to-emerald-600",
      change:
        stats.profileCompletion >= 50 ? "Good" : "Needs improvement",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Overview of platform metrics and user activity
            </p>
          </div>
          <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
            <Shield size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <BarChart3 size={18} />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                Career Path Distribution
              </h2>
            </div>
          </div>
          {careerDist.length > 0 ? (
            <div className="space-y-3">
              {careerDist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-24 text-right">
                    <span className="text-sm font-medium text-gray-600">
                      {item.career}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(
                            (item.count / (careerDist[0]?.count || 1)) * 100,
                            15
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-right">
                    <span className="text-sm font-bold text-gray-800">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <BarChart2
                size={36}
                className="text-gray-300 mx-auto mb-2"
              />
              <p className="text-sm text-gray-400">
                No career path selections yet
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <TrendingUp size={18} />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                Top Skills Among Students
              </h2>
            </div>
          </div>
          {topSkills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                      idx === 0
                        ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                        : idx === 1
                        ? "bg-gradient-to-br from-gray-400 to-gray-600"
                        : idx === 2
                        ? "bg-gradient-to-br from-amber-600 to-orange-600"
                        : "bg-gradient-to-br from-indigo-400 to-purple-500"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {skill.skill}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {skill.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <TrendingUp size={36} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No skills logged yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Target size={18} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Career Paths &amp; Required Skills
            </h2>
          </div>
          <a
            href="/admin-career-paths"
            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
          >
            Manage All →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <tr>
                <th className="pb-3 font-medium">Career Path</th>
                <th className="pb-3 font-medium">Required Skills</th>
                <th className="pb-3 font-medium">Adopted</th>
              </tr>
            </thead>
            <tbody>
              {stats.career_paths_detail?.map((cp, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3">
                    <p className="font-semibold text-gray-800">{cp.title}</p>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {cp.required_skills.slice(0, 4).map((s, si) => (
                        <span
                          key={si}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {s}
                        </span>
                      ))}
                      {cp.required_skills.length > 4 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded text-xs">
                          +{cp.required_skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="text-sm text-gray-500">
                      {careerDist.find((c) => c.career === cp.slug)
                        ?.count || 0}{" "}
                      students
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <Users size={18} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Users
            </h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <tr>
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Profile</th>
                <th className="pb-3 font-medium">Career Path</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length > 0 ? (
                recentUsers.map((user, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                          {(user.first_name?.[0] || "U")}
                          {(user.last_name?.[0] || "S")}
                        </div>
                        <span className="font-medium text-gray-800">
                          {user.first_name} {user.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-gray-600">{user.email}</span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-purple-50 text-purple-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3">
                      {user.is_profile_complete ? (
                        <CheckCircle2
                          size={16}
                          className="text-green-500"
                        />
                      ) : (
                        <Clock size={16} className="text-amber-500" />
                      )}
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-gray-500">
                        {user.selected_career || "—"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-gray-400"
                  >
                    <AlertCircle
                      size={36}
                      className="mx-auto mb-2 text-gray-300"
                    />
                    <p>No user data available</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;