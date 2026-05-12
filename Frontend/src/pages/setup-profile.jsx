import { useState, useEffect } from "react";
import api from "../api";
import { UserCog, Save, Loader2, Edit } from "lucide-react";

function SetupProfile() {

  const [bio, setBio] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [university, setUniversity] = useState("")
  const [major, setMajor] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
     const fetchProfile = async () => {
       try {
          const res = await api.get("/users/profile/", { withCredentials: true });
          const data = res.data;
          setBio(data.bio || "");
          setLinkedIn(data.linkedIn || "");
          setGithub(data.github || "");
          setPortfolio(data.portfolio || "");
          setUniversity(data.university || "");
          setMajor(data.major || "");
          setGraduationYear(data.graduationYear || "");
          setYearOfStudy(data.yearOfStudy || "");
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setEmail(data.email || "");
          setProfilePicture(data.profilePicture || "");
      
          if (res.data.is_profile_complete) {
             setSubmitted(true);
          }
        }
        catch (err) {
           console.error("Failed to fetch profile:", err);
        }
      }
    fetchProfile();
  },[] 
  );

  

  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);

   try{
      await api.put(
      "/users/profile/",
      { bio, linkedIn, github, portfolio, university, major, graduationYear, yearOfStudy, firstName, lastName, profilePicture },
      { withCredentials: true }
    );
    setSubmitted(true);
   }catch(err){
    console.error("Error saving profile:", err.response?.data || err.message);
   }finally{
      setLoading(false);
   }
    
    
  };

  const handleEdit = () =>{
    setSubmitted(false);
  }

  return (

    <div className="-full h-screen p-3 overflow-y-auto">
      <div className="mb-6 ml-3">
        <div className="w-16 h-16 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center">
          <UserCog size={32} />
        </div>
        <div>
         <h1 className="text-3xl font-bold">Your Profile</h1>
         <p>Set up your academic and personal details</p>
        </div>
      </div>
      
      {submitted ? (
        
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-700 p-4 rounded-lg">
             <p className="text-sm text-gray-400">First Name</p>
             <p className="text-lg font-semibold text-white">{firstName}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Last Name</p>
            <p className="text-lg font-semibold text-white">{lastName}</p>
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Email</p>
          <p className="text-lg font-semibold text-white">{email}</p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
           <p className="text-sm text-gray-400">University</p>
           <p className="text-lg font-semibold text-white">{university}</p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Program / Major</p>
          <p className="text-lg font-semibold text-white">{major}</p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
           <p className="text-sm text-gray-400">Year of Study</p>
           <p className="text-lg font-semibold text-white">{yearOfStudy}</p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
           <p className="text-sm text-gray-400">Graduation Year</p>
           <p className="text-lg font-semibold text-white">{graduationYear}</p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
           <p className="text-sm text-gray-400">LinkedIn Profile</p>
           <p className="text-lg font-semibold text-white">{linkedIn}</p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
           <p className="text-sm text-gray-400">GitHub Profile</p>
           <p className="text-lg font-semibold text-white">{github}</p>
        </div>

        <button
            onClick={handleEdit}
            className="flex items-center justify-center gap-2 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-md transition"
        >
           <Edit size={20} />
              Edit Profile
        </button>
      </div>
      ) : (
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 max-w-3xl">
         <div>
            <h2 className="text-2xl mb-2 font-bold">Personal Information</h2>
            <p className="text-gray-600 mb-4">This info helps tailor your career recommendations</p>
         </div>
        
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-medium mb-1">First Name</label>
               <input
                    type="text"
                    name="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="John"
               />
            </div>

            <div>
               <label className="block text-sm font-medium mb-1">Last Name</label>
               <input
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Doe"
               />
             </div>
             <div>
               <label className="block text-sm font-medium mb-1">Email</label>
               <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="john.doe@example.com"
               />
             </div>
  
             <div>
               <label className="block text-sm font-medium mb-1">University</label>
               <input
                   type="text"
                   name="university"
                   value={university}
                   onChange={(e) => setUniversity(e.target.value)}
                   className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   placeholder="e.g., University of Technology"
               />
             </div>

             <div>
               <label className="block text-sm font-medium mb-1">Major</label>
               <input
                  type="text"
                  name="major"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Computer Science"
               />
             </div>
             <div>
               <label className="block text-sm font-medium mb-1">Year of Graduation</label>
               <input
                  type="text"
                  name="graduationYear"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 2024"
               />
             </div>
             <div>
               <label className="block text-sm font-medium mb-1">Current Year of Study</label>
               <input
                  type="text"
                  name="currentYear"
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 2023"
               />
             </div>
              
             
              <div>
                 <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                 <input
                    type="text"
                    name="linkedIn"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GitHub URL</label>
                <input
                  type="text"                  
                  name="github"
                  value={github}
                  className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setGithub(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Portfolio URL</label>
                <input
                   type="text"
                   name="portfolio"
                   value={portfolio}
                   className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   onChange={(e) => setPortfolio(e.target.value)}
                />
             </div>
             <div>
                 <label className="block text-sm font-medium mb-1">Profile Picture</label>
                 <input
                    type="file"
                    name="profilePicture"
                    value={profilePicture}
                    onChange={(e) => setProfilePicture(e.target.value)}
                    className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 />
             </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            type="text"
            name="bio"
            value={bio}
            className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setBio(e.target.value)}
            placeholder="A brief description about you and your career aspirations"
                  
          />
        </div>
        
        <button
           type="submit"
           className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-md transition mt-6 w-full"
        >
          {loading ? 
          <>
             <Loader2 className="animate-spin" size={18} />
             <span>Saving...</span>           
          </>
          :
          <>
            <Save size={18} />
            <span>Save Profile</span>
          </>
          }
           
        </button>
      </form>)  
 }
 </div> 
)}

export default SetupProfile;