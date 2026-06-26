import { MoreVertical, ChevronLast, ChevronFirst } from "lucide-react"
import { useContext, createContext, useState, useEffect } from "react"
import { NavLink } from "react-router-dom"

const SidebarContext = createContext()
const SIDEBAR_KEY = "sidebar_expanded"

export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(() => {
    const saved = sessionStorage.getItem(SIDEBAR_KEY)
    return saved !== null ? JSON.parse(saved) : true
  })
  const firstName = sessionStorage.getItem("FIRST_NAME")
  const lastName = sessionStorage.getItem("LAST_NAME")
  const email = sessionStorage.getItem("email")

  useEffect(() => {
    sessionStorage.setItem(SIDEBAR_KEY, JSON.stringify(expanded))
  }, [expanded])

  return (
    <aside className="h-screen sticky top-0 bottom-0 left-0">
      <nav className="h-full flex flex-col bg-white border-r shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <span
            className={`whitespace-nowrap text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent overflow-hidden transition-all ${
              expanded ? "w-auto opacity-100" : "w-0 opacity-0"
            }`}
          >
            SkillSync
          </span>
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>

        <div className="border-t flex p-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {(firstName?.[0] || "A")}{(lastName?.[0] || "U")}
          </div>
          <div
            className={`
              flex justify-between items-center
              overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
            `}
          >
            <div className="leading-4">
              <h4 className="font-semibold">{firstName} {lastName}</h4>
              <span className="text-xs text-gray-600">{email }</span>
            </div>
            <MoreVertical size={20} className="hover:cursor-pointer "/>
          </div>
        </div>
      </nav>
    </aside>
  )
}

export function SidebarItem({ icon, text, alert, to }) {
  const { expanded } = useContext(SidebarContext)

  return (
    <NavLink
      to={to}
      className={({isActive}) =>
        `relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${
          isActive
              ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"

            : "hover:bg-indigo-50 text-gray-600"
        }
    `
      }
    >
      {icon}
      <span
        className={`overflow-hidden transition-all whitespace-nowrap ${
          expanded ? "w-52 ml-3" : "w-0"
        }`}
      >
        {text}
      </span>
      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-200 ${
            expanded ? "" : "top-2"
          }`}
        />
      )}

      {!expanded && (
        <div
          className={`
          absolute left-full rounded-md px-2 py-1 ml-6
          bg-indigo-100 text-indigo-800 text-sm
          invisible opacity-20 -translate-x-3 transition-all
          group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
      `}
        >
          {text}
        </div>
      )}
    </NavLink>
  )
}