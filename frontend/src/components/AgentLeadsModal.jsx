import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Calendar, User, LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';

export default function AgentLeadsModal({ agent, onClose }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (agent) {
      fetchAgentLeads();
    }
  }, [agent]);

  const fetchAgentLeads = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/agents/${agent.id}/leads`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLeads(response.data);
    } catch (error) {
      console.error("Failed to fetch agent leads", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'NEW': 'bg-blue-100 text-blue-700',
      'ASSIGNED': 'bg-indigo-100 text-indigo-700',
      'CONTACTED': 'bg-amber-100 text-amber-700',
      'IN_PROGRESS': 'bg-purple-100 text-purple-700',
      'CONVERTED': 'bg-emerald-100 text-emerald-700',
      'LOST': 'bg-rose-100 text-rose-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  if (!agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
              {agent.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{agent.name}</h2>
              <p className="text-sm font-medium text-slate-500">Currently managing {leads.length} leads</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full shadow-sm transition-colors border border-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : leads.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center shadow-sm">
              <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <LayoutDashboard size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-700">No leads assigned</h3>
              <p className="text-slate-500 mt-1">This agent is completely free and ready for new assignments.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {leads.map((lead) => (
                <div key={lead.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-200 transition-colors">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                        {lead.lead_id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getStatusColor(lead.status)}`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <User size={16} className="text-slate-400" />
                      {lead.customer_name}
                    </h4>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      Interested in: {lead.product_interested || 'Unspecified'}
                    </p>
                  </div>
                  
                  <div className="text-right sm:border-l border-slate-100 sm:pl-6">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center justify-end gap-1.5 mb-1">
                      <Calendar size={12} />
                      Submitted On
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {lead.created_at ? format(new Date(lead.created_at), 'MMM d, yyyy h:mm a') : 'Unknown'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
