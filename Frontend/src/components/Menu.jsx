import React from 'react'
import { BiSolidDashboard } from "react-icons/bi";
import { FaUser } from "react-icons/fa";
import { MdWorkOutline } from "react-icons/md";
import { AiOutlineBook } from "react-icons/ai";
import { MdOutlineSettings } from "react-icons/md";
import { RiCustomerService2Line } from "react-icons/ri";
import Navbar from './sidebar';

function Menu() {
  return (
    <div>
      {/* Navbar */}
      <Navbar title="Dashboard" onMenuClick={() => {}} />

      {/* SideNavBar */}
      <aside className={"h-screen w-55 fixed left-0 top-0 bg-[#f2f3fb] dark:bg-slate-900 flex flex-col py-6 font-headline text-sm font-medium z-50"}>
        <nav className="flex-1 space-y-1">
          <a className="flex items-center px-6 py-3 border-l-4 border-[#00488d] text-blue-400 bg-white/50 dark:bg-slate-800/50 transition-colors duration-200" href="#">
            <span className="material-symbols-outlined mr-3">Dashboard</span>
          </a>
          <a className="flex items-center px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-[#00488d] hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors duration-200" href="#">
            <span className="material-symbols-outlined mr-3">Profile</span>
          </a>
          <a className="flex items-center px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-[#00488d] hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors duration-200" href="#">
            <span className="material-symbols-outlined mr-3">Career Paths</span>
          </a>
          <a className="flex items-center px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-[#00488d] hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors duration-200" href="#">
            <span className="material-symbols-outlined mr-3">Learning Hub</span>
          </a>
        </nav>
        <div className="px-6 mt-auto space-y-4">
          <div className="pt-6 border-t border-outline-variant/15 space-y-1">
            <a className="flex items-center py-2 text-slate-600 dark:text-slate-400 hover:text-[#00488d] transition-colors" href="#">
              <span className="material-symbols-outlined mr-3">Settings</span>
            </a>
            <a className="flex items-center py-2 text-slate-600 dark:text-slate-400 hover:text-[#00488d] transition-colors" href="#">
              <span className="material-symbols-outlined mr-3">Support</span>
            </a>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default Menu