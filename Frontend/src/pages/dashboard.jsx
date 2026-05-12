import { useLocation } from "react-router-dom";
import { UserCog, BrainCog, Route, FileUser, ChartLine, MoveRight} from 'lucide-react';


const dashboard = () => {
  
  const location = useLocation();

  const steps = [
    {
      title: "Set Up Profile",
      description: "Add your details and academic info",
      icon: <UserCog size={24} />,
      link: "/setup-profile",
    },
    {
      title: "Choose Career Path",
      description: "Explore and select your ideal IT career",
      icon: <Route size={24} />,
      link: "/career-paths",
    },
    {
      title: "Log Your Skills",
      description: "Record skills you've acquired so far",
      icon: <BrainCog size={24} />,
      link: "/skills",
    },
    {
      title: "Generate CV",
      description: "Create a polished, tailored resume",
      icon: <FileUser size={24} />,
      link: "/generate-cv",
    },
    {
      title: "Skill Gap Analysis",
      description: "Identify areas for improvement in your skill set",
      icon: <ChartLine size={24} />,
      link: "/skill-gap-analysis",
    },
  ]

  return (

  
    <div >
        <h1 className="text-4xl font-bold"> Welcome to <span className="text-indigo-600">SkillSync</span> </h1>
        <p className="text-lg text-gray-600">Your personal guide to structuring your IT Career journey. Let's Get Started</p>
         
        {/* Progress Bar */}
        <div className="w-full max-w-3xl mb-8 mt-4 ">
          <h2 className="text-lg font-semibold mb-2">Onboarding Progress</h2>
          <div className="w-full bg-indigo-600 rounded-full h-3">
             <div className="bg-indigo-600 h-3 rounded-full" style={{ width: "0%" }}></div>
         </div>
         <p className="text-sm mt-2">0 / 4</p>
        </div>

      {/* Steps Grid */}
      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl overflow-y-auto">
        {steps.map((step, index) => (
      <a
         key={index}
         href={step.link}
         className="flex items-center justify-between bg-gray-800 p-8 rounded-xl shadow-lg hover:outline hover:outline-2 hover:outline-indigo-500 focus:outline-2 focus:outline-indigo-500 transition min-h-[180px]"
      >
      <div className="flex items-center gap-6">
        <div className="text-blue-400 text-3xl">{step.icon}</div>
        <div>
          <h3 className="text-lg font-bold whitespace-nowrap text-white">{step.title}</h3>
          <p className="text-md text-gray-400">{step.description}</p>
        </div>
      </div>
      <MoveRight className="text-gray-400 text-xl" />
      </a>
     ))}
     </div>
</div>
  )
}

export default dashboard
