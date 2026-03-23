import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import Breadcrumbs from '../Components/Breadcrumbs';
import { Save, CheckCircle2, MessageSquare, ShieldCheck, Globe, Send, Loader2, AlertCircle } from 'lucide-react';

export default function WhatsappSettings({ auth, settings }) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        api_url: settings?.api_url || '',
        api_token: settings?.api_token || '',
        is_active: settings?.is_active ?? true,
    });

    const [triggerLoading, setTriggerLoading] = useState(false);
    const [triggerResult, setTriggerResult] = useState(null); // { count, message }
    const [triggerError, setTriggerError] = useState(null);

    const submit = (e) => {
        e.preventDefault();
        put(route('whatsapp-settings.update'));
    };

    const handleSendReminders = async () => {
        setTriggerLoading(true);
        setTriggerResult(null);
        setTriggerError(null);
        try {
            const res = await axios.post(route('whatsapp-settings.send-reminders'));
            setTriggerResult(res.data);
        } catch (err) {
            setTriggerError(err.response?.data?.message || 'Gagal mengirim notifikasi.');
        } finally {
            setTriggerLoading(false);
        }
    };

    return (
        <>
            <Head title="WhatsApp Settings" />
            <div className="min-h-screen flex flex-col">
                <Navbar user={auth.user} />
                <div className="flex-1 flex flex-col mesh-gradient overflow-x-hidden">
                    <div className="px-6 md:px-10 pt-6">
                        <Breadcrumbs items={[{ label: 'System Settings' }, { label: 'WhatsApp Configuration' }]} />
                    </div>

                    <main className="flex-1 p-6 md:p-10">
                        <div className="max-w-4xl mx-auto">
                            <header className="mb-10">
                                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full border border-primary/20 mb-4 uppercase tracking-widest">
                                    <MessageSquare size={12} />
                                    Communication Gateway
                                </div>
                                <h1 className="text-4xl font-black tracking-tighter text-foreground">WhatsApp API</h1>
                                <p className="text-muted-foreground mt-2 text-sm font-medium">Configure your outbound notification gateway</p>
                            </header>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-8">
                                    <form onSubmit={submit} className="glass-panel p-10 rounded-[3rem] border-white/40 shadow-2xl space-y-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none text-primary">
                                            <MessageSquare size={120} />
                                        </div>

                                        <div className="space-y-6 relative">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <Globe size={12} className="text-primary" />
                                                    Gateway API Endpoint
                                                </label>
                                                <input
                                                    type="url"
                                                    className="w-full bg-secondary/40 border-border/50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner text-foreground placeholder:opacity-30"
                                                    placeholder="https://api.fonnte.com/send"
                                                    value={data.api_url}
                                                    onChange={(e) => setData('api_url', e.target.value)}
                                                    required
                                                />
                                                {errors.api_url && <p className="text-xs text-destructive font-bold uppercase mt-2">{errors.api_url}</p>}
                                                <p className="text-[10px] text-muted-foreground font-medium pl-1">Standard REST API endpoint for message dispatch</p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <ShieldCheck size={12} className="text-primary" />
                                                    Authorization Token
                                                </label>
                                                <input
                                                    type="password"
                                                    className="w-full bg-secondary/40 border-border/50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner text-foreground"
                                                    placeholder="••••••••••••••••"
                                                    value={data.api_token}
                                                    onChange={(e) => setData('api_token', e.target.value)}
                                                    required
                                                />
                                                {errors.api_token && <p className="text-xs text-destructive font-bold uppercase mt-2">{errors.api_token}</p>}
                                            </div>

                                            <div className="pt-4">
                                                <label className="flex items-center gap-4 cursor-pointer group w-fit">
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only"
                                                            checked={data.is_active}
                                                            onChange={(e) => setData('is_active', e.target.checked)}
                                                        />
                                                        <div className={`w-14 h-8 rounded-full transition-all duration-300 ${data.is_active ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-secondary'}`} />
                                                        <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-all duration-300 shadow-md ${data.is_active ? 'translate-x-6' : ''}`} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">Dispatch Mode</span>
                                                        <span className="text-[10px] text-muted-foreground font-medium">{data.is_active ? 'Automated notifications enabled' : 'Gateway dormant - No messages will be sent'}</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="pt-6 flex items-center gap-4 border-t border-border/10">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="btn btn-primary px-8 py-4 h-auto rounded-2xl gap-3 text-xs font-black tracking-widest shadow-xl shadow-primary/20"
                                            >
                                                <Save size={16} />
                                                DEPLOY CONFIGURATION
                                            </button>

                                            {recentlySuccessful && (
                                                <div className="flex items-center gap-2 text-emerald-500 animate-in fade-in slide-in-from-left-4 duration-500">
                                                    <CheckCircle2 size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Applied to Production</span>
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                </div>

                                <div className="lg:col-span-4 space-y-6">
                                    <div className="glass-panel p-8 rounded-[2.5rem] border-white/40 shadow-xl overflow-hidden relative group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors" />
                                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-4">Payload Preview</h3>
                                        <div className="bg-black/5 rounded-2xl p-4 font-mono text-[10px] text-muted-foreground leading-relaxed border border-white/5">
                                            <p className="text-secondary-foreground font-bold mb-2">// Message Blueprint</p>
                                            <p>"Halo [User], Anda telah di-assign tugas baru: [Task Title]."</p>
                                            <div className="mt-4 pt-4 border-t border-border/10 opacity-50">
                                                <p>POST /send HTTP/1.1</p>
                                                <p>Authorization: Token ***</p>
                                                <p>Target: 62812...</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Manual Trigger Panel */}
                                    <div className="glass-panel p-8 rounded-[2.5rem] border-primary/20 bg-primary/[0.02] shadow-xl space-y-4">
                                        <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Manual Dispatch</h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                                            Kirim semua notifikasi reminder due date sekarang (H-2 s/d H+3) ke pengguna yang memiliki task aktif.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={handleSendReminders}
                                            disabled={triggerLoading}
                                            className="w-full btn btn-primary gap-3 py-4 h-auto rounded-2xl text-xs font-black tracking-widest shadow-lg shadow-primary/20 disabled:opacity-60"
                                        >
                                            {triggerLoading
                                                ? <><Loader2 size={16} className="animate-spin" /> MENGIRIM...</>
                                                : <><Send size={16} /> KIRIM REMINDER SEKARANG</>
                                            }
                                        </button>

                                        {triggerResult && (
                                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 fade-in">
                                                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-[11px] font-black mb-1">{triggerResult.count} Reminder Terkirim</p>
                                                    <p className="text-[10px] opacity-70">{triggerResult.message}</p>
                                                </div>
                                            </div>
                                        )}

                                        {triggerError && (
                                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive fade-in">
                                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                                <p className="text-[11px] font-semibold">{triggerError}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="glass-panel p-8 rounded-[2.5rem] border-amber-500/20 bg-amber-500/[0.02] shadow-xl">
                                        <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">Gateway Integrity</h3>
                                        <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                                            Ensure your API provider supports RESTful POST requests. International numbering format (E.164) is strictly required for recipient identification.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
