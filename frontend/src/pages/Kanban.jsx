import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Maximize2, X } from 'lucide-react';
import LeadProfilePanel from '../components/LeadProfilePanel';

const STATUS_COLUMNS = ['NEW', 'ASSIGNED', 'CONTACTED', 'IN_PROGRESS', 'CONVERTED', 'LOST'];

const getColumnColor = (status) => {
  const colors = {
    'NEW': 'border-l-blue-500',
    'ASSIGNED': 'border-l-indigo-500',
    'CONTACTED': 'border-l-amber-500',
    'IN_PROGRESS': 'border-l-purple-500',
    'CONVERTED': 'border-l-emerald-500',
    'LOST': 'border-l-rose-500'
  };
  return colors[status] || 'border-l-slate-500';
};

export default function Kanban() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [maximizedStatus, setMaximizedStatus] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await axios.get('/api/v1/leads/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLeads(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getLeadsByStatus = (status) => leads.filter(l => l.status === status);

  // Drag and Drop Handlers
  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow drop
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    
    // Optimistic UI update
    setLeads(prev => prev.map(lead => {
      if (lead.id.toString() === leadId) {
        return { ...lead, status: newStatus };
      }
      return lead;
    }));

    // Update Backend
    try {
      await axios.put(`/api/v1/leads/${leadId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (err) {
      console.error("Failed to update lead status", err);
      // Revert if failed
      fetchLeads();
    }
  };

  const renderLeadCard = (lead, isMaximized) => (
    <div 
      key={lead.id} 
      draggable={true}
      onDragStart={(e) => handleDragStart(e, lead.id)}
      onClick={() => setSelectedLeadId(lead.id)}
      className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-md transition-all group ${isMaximized ? 'p-6' : ''}`}
    >
      <div className="flex justify-between items-start mb-2.5">
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 uppercase tracking-wider">
          {lead.lead_id}
        </span>
        <span className="text-xs text-slate-400 font-semibold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">Score: {lead.lead_score}</span>
      </div>
      <h4 className={`font-bold text-slate-800 ${isMaximized ? 'text-lg' : ''}`}>{lead.customer_name}</h4>
      <p className="text-sm text-slate-500 mt-1 font-medium truncate">{lead.product_interested || 'No product specified'}</p>
    </div>
  );

  const renderStatusSection = (status, isMaximized = false) => {
    const statusLeads = getLeadsByStatus(status);
    
    return (
      <div 
        key={status} 
        className={
          isMaximized 
            ? `flex flex-col w-full h-full bg-slate-50/95 backdrop-blur-md p-8 border border-slate-200/60 shadow-sm overflow-y-auto` 
            : `flex items-center justify-between w-full bg-slate-50/50 hover:bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm border-l-4 ${getColumnColor(status)} cursor-pointer transition-colors group`
        }
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
        onClick={() => !isMaximized && setMaximizedStatus(status)}
      >
        <div className={`flex items-center ${isMaximized ? 'justify-between mb-8' : 'w-full justify-between'}`}>
          <div className="flex items-center gap-4">
            <h3 className={`font-black text-slate-800 tracking-wide ${isMaximized ? 'text-3xl' : 'text-base'}`}>
              {status.replace('_', ' ')}
            </h3>
            <span className={`bg-slate-200/70 text-slate-600 font-bold px-3 py-1 rounded-full border border-slate-300/50 ${isMaximized ? 'text-lg' : 'text-xs'}`}>
              {statusLeads.length} leads
            </span>
          </div>
          
          {isMaximized ? (
            <button 
              onClick={(e) => { e.stopPropagation(); setMaximizedStatus(null); }}
              className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full shadow-sm transition-colors"
            >
              <X size={24} />
            </button>
          ) : (
            <div className="flex items-center gap-4">
               {statusLeads.length === 0 && <span className="text-xs text-slate-400 font-medium italic">Drop leads here</span>}
               <button 
                 onClick={(e) => { e.stopPropagation(); setMaximizedStatus(status); }}
                 className="p-1.5 text-slate-400 group-hover:text-blue-600 rounded-lg transition-colors"
                 title="Maximize Section"
               >
                 <Maximize2 size={18} />
               </button>
            </div>
          )}
        </div>
        
        {isMaximized && (
          <>
            {loading ? (
              <div className="text-sm text-slate-400 font-medium py-4">Loading leads...</div>
            ) : statusLeads.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200/80 rounded-xl h-32 flex items-center justify-center text-sm text-slate-400 font-medium bg-white/50">
                Drop leads here
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {statusLeads.map(lead => renderLeadCard(lead, isMaximized))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col animate-fade-in-up relative overflow-hidden">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">Lead Pipeline</h1>
          <p className="text-slate-500 mt-2 font-medium">Vertical swimlanes. Drag and drop leads between sections to update their status.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        <div className="flex flex-col gap-3">
          {STATUS_COLUMNS.map(status => renderStatusSection(status, false))}
        </div>
      </div>

      {/* Maximized Modal Overlay */}
      {maximizedStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-8">
          <div className="bg-slate-50 w-full h-full rounded-3xl shadow-2xl overflow-y-auto">
            {renderStatusSection(maximizedStatus, true)}
          </div>
        </div>
      )}

      <LeadProfilePanel 
        leadId={selectedLeadId} 
        onClose={() => setSelectedLeadId(null)} 
      />
    </div>
  );
}
