import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Search } from 'lucide-react';
import LeadProfilePanel from '../components/LeadProfilePanel';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await axios.get('/api/v1/leads/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Sort by newest first (descending ID)
      const sortedLeads = response.data.sort((a, b) => b.id - a.id);
      setLeads(sortedLeads);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const term = searchTerm.toLowerCase();
    return (
      (lead.customer_name && lead.customer_name.toLowerCase().includes(term)) ||
      (lead.email && lead.email.toLowerCase().includes(term)) ||
      (lead.phone_number && lead.phone_number.includes(term)) ||
      (lead.lead_id && lead.lead_id.toLowerCase().includes(term)) ||
      (lead.source && lead.source.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-6 lg:p-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">All Leads</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage and view all incoming leads.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all shadow-md shadow-blue-500/20 whitespace-nowrap hover:-translate-y-0.5">
            <Plus size={18} />
            Add Lead
          </button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-slate-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100/50">
              <tr>
                <th className="px-6 py-4 font-medium">Lead ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Source</th>
                <th className="px-6 py-4 font-medium">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400 font-medium">Loading leads...</td></tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">
                    {searchTerm ? "No leads match your search criteria." : "No leads found. Waiting for real-time integration..."}
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr 
                    key={lead.id} 
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">{lead.lead_id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{lead.customer_name}</td>
                    <td className="px-6 py-4">
                      <div className="text-slate-700 font-medium">{lead.phone_number}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{lead.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        lead.status === 'NEW' ? 'bg-blue-50 text-blue-600' :
                        lead.status === 'ASSIGNED' ? 'bg-amber-50 text-amber-600' :
                        lead.status === 'CONVERTED' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{lead.source}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{lead.lead_score}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <LeadProfilePanel 
        leadId={selectedLeadId} 
        onClose={() => setSelectedLeadId(null)} 
      />
    </div>
  );
}
