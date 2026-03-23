import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Navbar from '../../Components/Navbar';
import Breadcrumbs from '../../Components/Breadcrumbs';
import { 
    Activity as ActivityIcon, 
    MessageSquare, 
    Search, 
    RefreshCcw, 
    User, 
    Calendar, 
    History, 
    Filter,
    ArrowRight,
    Navigation,
    Database,
    Send,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react';
import axios from 'axios';

export default function LogsIndex({ auth, activities, notifications }) {
    const [activeTab, setActiveTab] = useState('activities');
    const [resendingLogId, setResendingLogId] = useState(null);

    const handleResend = async (logId) => {
        setResendingLogId(logId);
        try {
            const res = await axios.post(route('notification-logs.resend', logId));
            if (res.data.success) {
                router.reload({ only: ['notifications'] });
            }
        } catch (err) {
            alert('Failed to resend notification');
        } finally {
            setResendingLogId(null);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            sent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            failed: 'bg-rose-100 text-rose-700 border-rose-200',
            scheduled: 'bg-amber-100 text-amber-700 border-amber-200'
        };
        const icons = {
            sent: <CheckCircle2 size={12} />,
            failed: <XCircle size={12} />,
            scheduled: <Clock size={12} />
        };
        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {icons[status]}
                {status || 'unknown'}
            </div>
        );
    };

    return (
        <>
            <Head title="System Audit Logs" />
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
                <Navbar user={auth.user} />
                
                <div className="flex-1 flex flex-col p-6 md:p-10">
                    <div className="max-w-6xl mx-auto w-full">
                        <header className="mb-8">
                            <Breadcrumbs items={[{ label: 'System Administration' }, { label: 'Audit Logs' }]} />
                            <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                                        <History size={32} className="text-primary" />
                                        Audit Logs
                                    </h1>
                                    <p className="text-slate-500 font-medium mt-2">Comprehensive track of system activities and communications.</p>
                                </div>
                                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
                                    <button 
                                        onClick={() => setActiveTab('activities')}
                                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center ${activeTab === 'activities' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                                    >
                                        <ActivityIcon size={16} />
                                        Activities
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('notifications')}
                                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center ${activeTab === 'notifications' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                                    >
                                        <MessageSquare size={16} />
                                        Communications
                                    </button>
                                </div>
                            </div>
                        </header>

                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="relative flex-1 max-w-md group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Search logs by keyword or user..." 
                                        className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all font-medium placeholder:text-slate-400 shadow-sm"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 transition-all shadow-sm">
                                        <Filter size={18} />
                                    </button>
                                    <button 
                                        onClick={() => router.reload()}
                                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-primary transition-all shadow-sm hover:rotate-180 duration-500"
                                    >
                                        <RefreshCcw size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80">
                                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">User & Context</th>
                                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Event Details</th>
                                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Timestamp</th>
                                            {activeTab === 'notifications' && <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Status</th>}
                                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {activeTab === 'activities' ? (
                                            activities.data.length > 0 ? (
                                                activities.data.map(item => (
                                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${item.type === 'Navigation' ? 'bg-indigo-500' : 'bg-primary'}`}>
                                                                    {item.type === 'Navigation' ? <Navigation size={20} /> : <Database size={20} />}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{item.user?.username || 'System'}</div>
                                                                    <div className="flex items-center gap-1.5 mt-1">
                                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${item.type === 'Navigation' ? 'bg-indigo-50 text-indigo-600' : 'bg-primary/5 text-primary'}`}>
                                                                            {item.type}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <p className="text-sm font-medium text-slate-600 max-w-md leading-relaxed">
                                                                {item.content}
                                                            </p>
                                                            {item.card && (
                                                                <div className="mt-2 flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-wider">
                                                                    <ArrowRight size={12} />
                                                                    Card: {item.card.title}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                                                                    <Calendar size={14} className="text-slate-400" />
                                                                    {new Date(item.created_at).toLocaleDateString()}
                                                                </div>
                                                                <div className="mt-1 text-[10px] font-medium text-slate-400">
                                                                    {new Date(item.created_at).toLocaleTimeString()}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <button 
                                                                onClick={() => { if(confirm('Delete log?')) router.delete(route('activities.destroy', item.id)) }}
                                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                            >
                                                                <ArrowRight size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-400 italic">No activity logs found.</td></tr>
                                            )
                                        ) : (
                                            notifications.data.length > 0 ? (
                                                notifications.data.map(item => (
                                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${item.type === 'whatsapp' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                                                                    {item.type === 'whatsapp' ? <Send size={20} /> : <MessageSquare size={20} />}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{item.user?.username || 'Guest'}</div>
                                                                    <div className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.recipient}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-wider">{item.task_type}</span>
                                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-wider">{item.purpose}</span>
                                                                </div>
                                                                <p className="text-sm font-medium text-slate-600 max-w-md line-clamp-1 italic">
                                                                    "{item.content}"
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex flex-col">
                                                                <div className="text-slate-700 font-bold text-xs">{new Date(item.created_at).toLocaleDateString()}</div>
                                                                <div className="text-[10px] font-medium text-slate-400 mt-0.5">{new Date(item.created_at).toLocaleTimeString()}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <StatusBadge status={item.status} />
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <button 
                                                                onClick={() => handleResend(item.id)}
                                                                disabled={resendingLogId === item.id}
                                                                className="btn btn-primary px-5 py-2.5 h-auto rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                                                            >
                                                                {resendingLogId === item.id ? 'Sending...' : 'Resend'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 italic">No communication logs found.</td></tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Displaying {activeTab === 'activities' ? activities.data.length : notifications.data.length} records
                                </div>
                                <div className="flex gap-4">
                                    {/* Pagination logic here - using simple prev/next for brevity */}
                                    <button 
                                        disabled={activeTab === 'activities' ? !activities.prev_page_url : !notifications.prev_page_url}
                                        onClick={() => router.get(activeTab === 'activities' ? activities.prev_page_url : notifications.prev_page_url)}
                                        className="btn bg-white border border-slate-200 text-slate-600 px-6 py-2.5 h-auto text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all disabled:opacity-30"
                                    >
                                        Previous
                                    </button>
                                    <button 
                                        disabled={activeTab === 'activities' ? !activities.next_page_url : !notifications.next_page_url}
                                        onClick={() => router.get(activeTab === 'activities' ? activities.next_page_url : notifications.next_page_url)}
                                        className="btn bg-white border border-slate-200 text-slate-600 px-6 py-2.5 h-auto text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all disabled:opacity-30"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center gap-4 bg-sky-50 border border-sky-100 p-4 rounded-3xl">
                            <div className="w-10 h-10 rounded-2xl bg-sky-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-sky-200">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-sky-900 uppercase tracking-widest">Archive Policy</h4>
                                <p className="text-[10px] text-sky-700/70 font-medium leading-relaxed mt-0.5">
                                    Audit logs are retained for 90 days. Transactional data is preserved until manually purged or archived by an administrator.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
