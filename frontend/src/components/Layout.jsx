import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  KanbanSquare, 
  Search, 
  Bell, 
  UserCircle,
  Menu,
  X
} from 'lucide-react';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeenLeadCount, setLastSeenLeadCount] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkNewLeads = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await axios.get('/api/v1/leads/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const currentCount = response.data.length;
        
        // If we have a baseline and the count went up, increment the unread badge
        if (lastSeenLeadCount !== null && currentCount > lastSeenLeadCount) {
          setUnreadCount(prev => prev + (currentCount - lastSeenLeadCount));
        }
        
        setLastSeenLeadCount(currentCount);
      } catch (e) {
        console.error("Notification poll failed", e);
      }
    };
    
    // Initial fetch
    if (lastSeenLeadCount === null) { checkNewLeads(); }
    
    // Poll every 3 seconds for new leads
    const interval = setInterval(checkNewLeads, 3000);
    return () => clearInterval(interval);
  }, [lastSeenLeadCount]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'All Leads', path: '/leads', icon: Users },
    { name: 'Kanban Board', path: '/kanban', icon: KanbanSquare },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
          D
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">Divine CRM</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Icon size={20} />
              {link.name}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-100">
        <div className="text-center text-xs text-slate-400 font-medium pb-2">
          v1.0.0 (Dev Mode)
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex font-sans text-slate-800">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-md border-r border-slate-200/50 h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-64 h-full bg-white shadow-2xl flex flex-col transform transition-transform" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-20 px-6 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="relative hidden sm:block group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search leads..." 
                className="pl-11 pr-4 py-2.5 w-72 bg-slate-100/50 border border-slate-200/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setUnreadCount(0)}
              className="relative p-2.5 text-slate-400 hover:bg-white hover:shadow-sm hover:text-blue-600 rounded-xl transition-all border border-transparent hover:border-slate-200/50"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 rounded-full border-2 border-white text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent hidden sm:block"></div>
            <button className="flex items-center gap-3 p-1.5 pr-4 hover:bg-white hover:shadow-sm rounded-2xl transition-all border border-transparent hover:border-slate-200/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <UserCircle size={24} />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-700 leading-tight">Admin User</p>
                <p className="text-xs text-slate-500 font-medium">admin@divinehindu.com</p>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
