import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Phone, Mail, Globe, MapPin, Clock, Activity as ActivityIcon, CalendarPlus } from 'lucide-react';
import { format } from 'date-fns';

export default function LeadProfilePanel({ leadId, onClose }) {
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpRemarks, setFollowUpRemarks] = useState('');

  useEffect(() => {
    if (leadId) {
      fetchLeadDetails();
    }
  }, [leadId]);

  const fetchLeadDetails = async () => {
    setLoading(true);
    try {
      const [leadRes, activitiesRes] = await Promise.all([
        axios.get(`/api/v1/leads/${leadId}`),
        axios.get(`/api/v1/leads/${leadId}/activities`)
      ]);
      setLead(leadRes.data);
      setActivities(activitiesRes.data);
      setShowFollowUpForm(false);
      setFollowUpDate('');
      setFollowUpTime('');
      setFollowUpRemarks('');
    } catch (error) {
      console.error("Failed to fetch lead details", error);
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

  const getActivityIconColor = (action) => {
    if (action.includes('CREATED')) return 'bg-blue-100 text-blue-600';
    if (action.includes('ASSIGNED')) return 'bg-indigo-100 text-indigo-600';
    if (action.includes('STATUS')) return 'bg-amber-100 text-amber-600';
    if (action.includes('BREACH')) return 'bg-rose-100 text-rose-600';
    if (action.includes('CONVERTED')) return 'bg-emerald-100 text-emerald-600';
    return 'bg-slate-100 text-slate-600';
  };

  const handleScheduleFollowUp = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/v1/leads/${leadId}/followups`, {
        follow_up_date: followUpDate,
        follow_up_time: followUpTime,
        remarks: followUpRemarks,
        reminder_type: 'NONE'
      });
      // Refresh the timeline
      fetchLeadDetails();
    } catch (err) {
      console.error("Failed to schedule follow up", err);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${leadId ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-slate-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${leadId ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {loading || !lead ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white px-6 py-5 border-b border-slate-100 flex justify-between items-start sticky top-0 z-10 shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 uppercase tracking-wider">
                    {lead.lead_id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md border border-transparent uppercase tracking-wider ${getStatusColor(lead.status)}`}>
                    {lead.status.replace('_', ' ')}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{lead.customer_name}</h2>
                <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><Globe size={14} /> {lead.source}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5"><Clock size={14} /> Score: {lead.lead_score}</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Contact Details Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                  Contact Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><Phone size={16} /></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Phone Number</p>
                      <p className="text-sm font-medium text-slate-800">{lead.phone_number}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><Mail size={16} /></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Email Address</p>
                      <p className="text-sm font-medium text-slate-800">{lead.email || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><MapPin size={16} /></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Product Interested</p>
                      <p className="text-sm font-medium text-slate-800">{lead.product_interested || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Follow-up Section */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                    <CalendarPlus size={16} className="text-blue-500" />
                    Follow-ups
                  </h3>
                  <button 
                    onClick={() => setShowFollowUpForm(!showFollowUpForm)}
                    className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {showFollowUpForm ? 'Cancel' : 'Schedule'}
                  </button>
                </div>

                {showFollowUpForm && (
                  <form onSubmit={handleScheduleFollowUp} className="space-y-4 animate-fade-in-up mt-4 pt-4 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                        <input 
                          type="date" 
                          required
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Time</label>
                        <input 
                          type="time" 
                          required
                          value={followUpTime}
                          onChange={(e) => setFollowUpTime(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Remarks</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Discuss pricing options..."
                        value={followUpRemarks}
                        onChange={(e) => setFollowUpRemarks(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors"
                    >
                      Save Follow-up
                    </button>
                  </form>
                )}
              </div>

              {/* Activity Timeline */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2 uppercase tracking-wide px-1">
                  <ActivityIcon size={16} className="text-blue-500" />
                  Activity Timeline
                </h3>
                <div className="relative pl-4 border-l-2 border-slate-200 ml-3 space-y-6">
                  {activities.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No activities recorded yet.</p>
                  ) : (
                    activities.map((activity, index) => (
                      <div key={activity.id} className="relative">
                        <div className={`absolute -left-[25px] top-1 w-6 h-6 rounded-full border-4 border-slate-50 flex items-center justify-center ${getActivityIconColor(activity.action)}`}>
                          <div className="w-1.5 h-1.5 bg-current rounded-full" />
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-bold text-slate-800">
                              {activity.action.replace(/_/g, ' ')}
                            </h4>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          {activity.remarks && (
                            <p className="text-sm text-slate-600 mt-2 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                              {activity.remarks}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </>
  );
}
