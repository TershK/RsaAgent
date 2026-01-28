
import React from 'react';
import { LayoutDashboard, Map as MapIcon, BellRing, LogOut, Shield, User, Library as LibraryIcon } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onLogout }) => {
  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => onViewChange(view)}
      className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
          : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
      }`}
    >
      <Icon className={`w-6 h-6 shrink-0 ${currentView === view ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
      <span className="font-bold text-sm tracking-tight truncate">{label}</span>
    </button>
  );

  return (
    <aside className="w-64 bg-slate-900 border-r border-white/5 flex flex-col h-full shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/40">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="overflow-hidden">
          <h2 className="text-lg font-black italic text-white uppercase leading-none truncate">RSA Agent</h2>
          <div className="flex items-center gap-1 mt-0.5">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">System Active</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-3">
        <NavItem view="DASHBOARD" icon={LayoutDashboard} label="Command Hub" />
        <NavItem view="MAP" icon={MapIcon} label="Safety Network" />
        <NavItem view="SOS" icon={BellRing} label="Emergency Pulse" />
        <NavItem view="LIBRARY" icon={LibraryIcon} label="Library" />
        <NavItem view="PROFILE" icon={User} label="Profile" />
      </nav>

      <div className="p-4 space-y-2 border-t border-white/5">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut className="w-6 h-6 shrink-0" />
          <span className="font-bold text-sm">Terminate Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
