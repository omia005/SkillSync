import { useLocation } from "react-router-dom";
import { 
  UserCog, 
  BrainCog, 
  Route, 
  FileUser, 
  ChartLine, 
  MoveRight,
  Trophy,
  Briefcase,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Plus,
  Zap
} from 'lucide-react';

const iconMap = {
  UserCog, BrainCog, Route, FileUser, ChartLine, MoveRight,
  Trophy, Briefcase, CheckCircle, Sparkles, ArrowRight, Plus, Zap,
};

const Dashboard = () => {
  const location = useLocation();
  const firstName = sessionStorage.getItem("firstName") || "User";
  const steps = [
    {
      title: "Set Up Profile",
      description: "Add your details and academic info",
      icon: <UserCog size={24} />,
      link: "/setup-profile",
      status: "completed"
    },
    {
      title: "Choose Career Path",
      description: "Explore and select your ideal IT career",
      icon: <Route size={24} />,
      link: "/career-paths",
      status: "in-progress"
    },
    {
      title: "Log Your Skills",
      description: "Record skills you've acquired so far",
      icon: <BrainCog size={24} />,
      link: "/skills",
      status: "pending"
    },
    {
      title: "Generate CV",
      description: "Create a polished, tailored resume",
      icon: <FileUser size={24} />,
      link: "/generate-cv",
      status: "pending"
    },
    {
      title: "Skill Gap Analysis",
      description: "Identify areas for improvement in your skill set",
      icon: <ChartLine size={24} />,
      link: "/skill-gap-analysis",
      status: "pending"
    },
  ];

  // Stats data - connected to real data as features are implemented
  const stats = [
    {
      label: "Skills Learned",
      value: "12",
      icon: <BrainCog size={22} />,
      change: "+2 this week",
      positive: true
    },
    {
      label: "Career Paths Explored",
      value: "3",
      icon: <Route size={22} />,
      change: "1 selected",
      positive: true
    },
    {
      label: "CV Sections Completed",
      value: "5",
      icon: <FileUser size={22} />,
      change: "80% complete",
      positive: null
    },
    {
      label: "Profile Completion",
      value: "65%",
      icon: <UserCog size={22} />,
      change: "Almost there!",
      positive: null
    }
  ];

  const quickActions = [
    {
      label: "Add New Skill",
      description: "Log a skill you've learned",
      icon: <Plus size={20} />,
      link: "/skills",
      color: "from-blue-500 to-cyan-500"
    },
    {
      label: "View Career Matches",
      description: "See recommended paths",
      icon: <Briefcase size={20} />,
      link: "/career-paths",
      color: "from-purple-500 to-pink-500"
    },
    {
      label: "Generate CV",
      description: "Create your resume",
      icon: <Sparkles size={20} />,
      link: "/generate-cv",
      color: "from-amber-500 to-orange-500"
    },
    {
      label: "Run Gap Analysis",
      description: "Find skill gaps",
      icon: <Zap size={20} />,
      link: "/skill-gap-analysis",
      color: "from-emerald-500 to-teal-500"
    }
  ];

  // Helper for dynamic icons
  const DynamicIcon = ({ name, className }) => {
    const LucideIcon = iconMap[name];
    return LucideIcon ? <LucideIcon className={className} /> : null;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
            <CheckCircle size={12} />
            Completed
          </span>
        );
      case 'in-progress':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
            <Sparkles size={12} />
            In Progress
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            Not Started
          </span>
        );
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'in-progress': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="min-h-full">
      {/* Hero / Welcome Section */}
      <div className="relative mb-10 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20" />
        <div className="relative px-8 py-10 md:py-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-white/15 backdrop-blur-sm rounded-xl">
              <Sparkles className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Welcome back, <span className="text-indigo-200">{firstName}</span>
              </h1>
              <p className="text-indigo-200 text-sm md:text-base mt-1">
                Your IT career journey awaits — let's make progress today.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <a
              href="/skills"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 px-5 py-2.5 rounded-lg font-semibold text-sm shadow-lg shadow-indigo-900/30 hover:bg-indigo-50 transition-colors"
            >
              Log a Skill
              <ArrowRight size={16} />
            </a>
            <a
              href="/career-paths"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 rounded-lg font-semibold text-sm border border-white/20 hover:bg-white/20 transition-colors"
            >
              Explore Careers
            </a>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
                {stat.icon}
              </div>
              {stat.change && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  stat.positive
                    ? 'bg-emerald-50 text-emerald-600'
                    : stat.positive === false
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-gray-50 text-gray-500'
                }`}>
                  {stat.change}
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Onboarding Progress Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Onboarding Progress</h2>
            <p className="text-sm text-gray-500 mt-0.5">Complete these steps to get the most out of SkillSync</p>
          </div>
          <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            2 / 5 steps completed
          </span>
        </div>

        {/* Progress Steps */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: '40%' }}
            />
          </div>

          {/* Step Indicators */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  step.status === 'completed'
                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg'
                    : step.status === 'in-progress'
                    ? 'bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-lg ring-4 ring-indigo-100'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle size={18} />
                  ) : step.status === 'in-progress' ? (
                    <Sparkles size={18} />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                <span className="mt-2.5 text-xs font-semibold text-gray-700 text-center max-w-[80px]">
                  {step.title.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Steps Grid */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Getting Started</h2>
          <span className="text-sm text-gray-500">Click any step to begin</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((step, index) => (
            <a
              key={index}
              href={step.link}
              className="group relative flex flex-col bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg transition-colors ${
                  step.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-600'
                    : step.status === 'in-progress'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-gray-50 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                }`}>
                  {step.icon}
                </div>
                {getStatusBadge(step.status)}
              </div>
              
              <div className="mt-4">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-auto pt-4 flex items-center text-indigo-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all duration-200">
                Get Started
                <ArrowRight size={16} className="ml-1.5" />
              </div>

              {/* Decorative gradient ring on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 pointer-events-none transition-all duration-300" />
            </a>
          ))}
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <a
              key={idx}
              href={action.link}
              className="group relative flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-100 hover:-translate-y-1 transition-all duration-200 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-8 transition-opacity duration-300`} />
              <div className={`p-2.5 rounded-lg bg-gradient-to-br ${action.color} text-white relative z-10`}>
                {action.icon}
              </div>
              <div className="relative z-10">
                <p className="font-semibold text-gray-900 text-sm">{action.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
