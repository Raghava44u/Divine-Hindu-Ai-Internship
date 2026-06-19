import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, KanbanSquare, TrendingUp, AlertCircle, CheckCircle2, Clock, Maximize2, X, PieChart as PieChartIcon } from 'lucide-react';
import AgentLeadsModal from '../components/AgentLeadsModal';

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    converted: 0,
    slaBreaches: 0,
    sources: [],
    agents: []
  });
  const [loading, setLoading] = useState(true);
  const [maximizedWidget, setMaximizedWidget] = useState(null); // 'sources' or 'agents'
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/v1/leads/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        const leads = response.data;
        
        const total = leads.length;
        const converted = leads.filter(l => l.status === 'CONVERTED').length;
        const pending = leads.filter(l => ['NEW', 'ASSIGNED', 'CONTACTED'].includes(l.status)).length;
        
        const sourceMap = {};
        leads.forEach(l => {
          const sourceName = l.source.charAt(0) + l.source.slice(1).toLowerCase();
          sourceMap[sourceName] = (sourceMap[sourceName] || 0) + 1;
        });
        
        const sources = Object.keys(sourceMap).map(key => ({
          name: key,
          value: sourceMap[key]
        }));
        // Sort sources by value descending
        sources.sort((a, b) => b.value - a.value);

        const [agentsResponse, pendingFollowupsResponse] = await Promise.all([
          axios.get('/api/v1/agents/'),
          axios.get('/api/v1/leads/followups/pending', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);
        const agents = agentsResponse.data;
        const actualPendingFollowups = pendingFollowupsResponse.data.length;

        setStats({
          total,
          pending: actualPendingFollowups,
          converted,
          slaBreaches: 0,
          sources,
          agents
        });
      } catch (err) {
        console.error("Failed to fetch leads for dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderSourcesWidget = (isMaximized) => {
    const totalLeads = stats.sources.reduce((sum, s) => sum + s.value, 0);
    return (
      <div className={`w-full ${isMaximized ? 'max-w-3xl mx-auto py-8' : ''}`}>
        {stats.sources.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 py-12">
            <PieChartIcon className="w-12 h-12 text-slate-200 mb-3" />
            <p className="font-medium">No lead data available yet.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {(isMaximized ? stats.sources : stats.sources.slice(0, 5)).map((source, i) => {
              const percentage = totalLeads > 0 ? Math.round((source.value / totalLeads) * 100) : 0;
              return (
                <div key={source.name} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-slate-700">{source.name}</span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-900 leading-none">{source.value}</span>
                      <span className="text-xs font-semibold text-slate-400 ml-1.5 bg-slate-100 px-1.5 py-0.5 rounded-md">{percentage}%</span>
                    </div>
                  </div>
                  <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${isMaximized ? 'h-4' : 'h-2.5'}`}>
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110"
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: COLORS[i % COLORS.length] 
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {!isMaximized && stats.sources.length > 5 && (
              <button 
                onClick={() => setMaximizedWidget('sources')}
                className="w-full mt-2 py-2 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-colors text-center uppercase tracking-wider"
              >
                View all {stats.sources.length} sources
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAgentsWidget = (isMaximized) => {
    return (
      <div className={`w-full ${isMaximized ? 'max-w-5xl mx-auto py-8' : ''}`}>
        {stats.agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 py-12">
            <Users className="w-12 h-12 text-slate-200 mb-3" />
            <p className="font-medium">No active agents found.</p>
          </div>
        ) : (
          <div className={`grid gap-3 ${isMaximized ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {(isMaximized ? stats.agents : stats.agents.slice(0, 5)).map((agent) => (
              <div 
                key={agent.id} 
                onClick={() => setSelectedAgent(agent)}
                className={`flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group ${isMaximized ? 'bg-white p-5' : 'bg-slate-50/80 hover:bg-white'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold ${isMaximized ? 'w-12 h-12 text-lg' : 'w-9 h-9 text-xs'}`}>
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className={`font-bold text-slate-800 ${isMaximized ? 'text-lg' : 'text-sm'}`}>{agent.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${agent.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      <p className="text-xs text-slate-500 font-medium">{agent.is_active ? 'Active' : 'Offline'}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <span className={`font-black text-slate-700 block leading-none ${isMaximized ? 'text-2xl' : 'text-lg'}`}>
                    {agent.workload}
                  </span>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Leads</p>
                </div>
              </div>
            ))}
            {!isMaximized && stats.agents.length > 5 && (
              <button 
                onClick={() => setMaximizedWidget('agents')}
                className="w-full mt-2 py-2 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-colors text-center uppercase tracking-wider"
              >
                View all {stats.agents.length} agents
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-2 font-medium">Real-time CRM insights and lead performance.</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <div className="bg-white/80 backdrop-blur p-5 rounded-2xl shadow-sm border border-slate-100/50 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md uppercase tracking-wider">
              Total
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {loading ? '-' : stats.total}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Leads Captured</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur p-5 rounded-2xl shadow-sm border border-slate-100/50 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300 group delay-75">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {loading ? '-' : stats.pending}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Pending Follow-ups</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur p-5 rounded-2xl shadow-sm border border-slate-100/50 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300 group delay-150">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {loading ? '-' : stats.converted}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Converted Leads</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur p-5 rounded-2xl shadow-sm border border-slate-100/50 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300 group delay-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-gradient-to-br from-rose-50 to-rose-100 text-rose-500 rounded-xl group-hover:scale-110 transition-transform">
              <AlertCircle size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {loading ? '-' : stats.slaBreaches}
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">SLA Breaches</p>
          </div>
        </div>
      </div>

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Compact Lead Sources */}
        <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-md transition-all duration-300 flex flex-col relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><PieChartIcon size={16} /></div>
              Lead Sources
            </h3>
            <button 
              onClick={() => setMaximizedWidget('sources')}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
              title="Maximize widget"
            >
              <Maximize2 size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {renderSourcesWidget(false)}
          </div>
        </div>

        {/* Agent Workload Widget */}
        <div className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-md transition-all duration-300 flex flex-col relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Users size={16} /></div>
              Agent Workload
            </h3>
            <button 
              onClick={() => setMaximizedWidget('agents')}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
              title="Maximize widget"
            >
              <Maximize2 size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {renderAgentsWidget(false)}
          </div>
        </div>
      </div>

      {/* Fullscreen Maximize Modal Overlay */}
      {maximizedWidget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 bg-slate-900/60 backdrop-blur-md animate-fade-in-up">
          <div className="bg-slate-50 w-full h-full max-w-7xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/20 transform transition-all">
            
            <div className="px-6 py-5 border-b border-slate-200/60 flex justify-between items-center bg-white/80 backdrop-blur sticky top-0 z-10 shadow-sm">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                {maximizedWidget === 'sources' ? (
                  <><PieChartIcon className="text-indigo-600" size={28} /> Lead Sources Detailed View</>
                ) : (
                  <><Users className="text-blue-600" size={28} /> Agent Workload Distribution</>
                )}
              </h2>
              <button 
                onClick={() => setMaximizedWidget(null)} 
                className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 md:p-8">
              {maximizedWidget === 'sources' ? renderSourcesWidget(true) : renderAgentsWidget(true)}
            </div>
            
          </div>
        </div>
      )}

      <AgentLeadsModal 
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />
    </div>
  );
}
