import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import Navbar from '../Components/Navbar';
import Breadcrumbs from '../Components/Breadcrumbs';
import { Save, CheckCircle2, Send, ShieldCheck, Cpu, MessageSquare, BellRing } from 'lucide-react';

export default function TelegramSettings({ auth, settings }) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        bot_token: settings?.bot_token || '',
        chat_id: settings?.chat_id || '',
        is_active: settings?.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('telegram-settings.update'));
    };

    return (
        <>
            <Head title="Telegram Notifications" />
            <div className="min-h-screen flex flex-col">
                <Navbar user={auth.user} />
                <div className="flex-1 flex flex-col mesh-gradient overflow-x-hidden">
                    <div className="px-6 md:px-10 pt-6">
                        <Breadcrumbs items={[{ label: 'System Settings' }, { label: 'Telegram Configuration' }]} />
                    </div>

                    <main className="flex-1 p-6 md:p-10">
                        <div className="max-w-4xl mx-auto">
                            <header className="mb-10">
                                <div className="inline-flex items-center gap-2 bg-sky-500/10 text-sky-600 text-[10px] font-black px-3 py-1 rounded-full border border-sky-500/20 mb-4 uppercase tracking-widest">
                                    <Send size={12} />
                                    Real-time Activity Feed
                                </div>
                                <h1 className="text-4xl font-black tracking-tighter text-foreground">Telegram Integration</h1>
                                <p className="text-muted-foreground mt-2 text-sm font-medium">Stream activity logs and transactions directly to your Telegram channel</p>
                            </header>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-8">
                                    <form onSubmit={submit} className="glass-panel p-10 rounded-[3rem] border-white/40 shadow-2xl space-y-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none text-sky-500">
                                            <Send size={120} />
                                        </div>

                                        <div className="space-y-6 relative">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <ShieldCheck size={12} className="text-sky-500" />
                                                    Bot API Token
                                                </label>
                                                <input
                                                    type="password"
                                                    className="w-full bg-secondary/40 border-border/50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition-all shadow-inner text-foreground placeholder:opacity-30"
                                                    placeholder="123456789:ABCDefgh..."
                                                    value={data.bot_token}
                                                    onChange={(e) => setData('bot_token', e.target.value)}
                                                    required
                                                />
                                                {errors.bot_token && <p className="text-xs text-destructive font-bold uppercase mt-2">{errors.bot_token}</p>}
                                                <p className="text-[10px] text-muted-foreground font-medium pl-1">Generate this via @BotFather on Telegram</p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <MessageSquare size={12} className="text-sky-500" />
                                                    Target Chat / Channel ID
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-secondary/40 border-border/50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition-all shadow-inner text-foreground"
                                                    placeholder="-100123456789"
                                                    value={data.chat_id}
                                                    onChange={(e) => setData('chat_id', e.target.value)}
                                                    required
                                                />
                                                {errors.chat_id && <p className="text-xs text-destructive font-bold uppercase mt-2">{errors.chat_id}</p>}
                                                <p className="text-[10px] text-muted-foreground font-medium pl-1">Unique identifier for the destination chat or channel</p>
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
                                                        <div className={`w-14 h-8 rounded-full transition-all duration-300 ${data.is_active ? 'bg-sky-500 shadow-lg shadow-sky-500/20' : 'bg-secondary'}`} />
                                                        <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-all duration-300 shadow-md ${data.is_active ? 'translate-x-6' : ''}`} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black uppercase tracking-widest text-foreground group-hover:text-sky-500 transition-colors">Integration Status</span>
                                                        <span className="text-[10px] text-muted-foreground font-medium">{data.is_active ? 'Streaming all activities to Telegram' : 'Integration paused'}</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="pt-6 flex items-center gap-4 border-t border-border/10">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="btn bg-sky-500 hover:bg-sky-600 text-white border-none px-8 py-4 h-auto rounded-2xl gap-3 text-xs font-black tracking-widest shadow-xl shadow-sky-500/20"
                                            >
                                                <Save size={16} />
                                                SAVE CONFIGURATION
                                            </button>

                                            {recentlySuccessful && (
                                                <div className="flex items-center gap-2 text-emerald-500 animate-in fade-in slide-in-from-left-4 duration-500">
                                                    <CheckCircle2 size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Settings Applied</span>
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                </div>

                                <div className="lg:col-span-4 space-y-6">
                                    <div className="glass-panel p-8 rounded-[2.5rem] border-white/40 shadow-xl overflow-hidden relative group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-sky-500/10 transition-colors" />
                                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-4">Feed Details</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600">
                                                    <BellRing size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-wider mb-0.5">Navigation Events</p>
                                                    <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">Logs every menu transition to track user journey within the platform.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600">
                                                    <Cpu size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-wider mb-0.5">Data Transactions</p>
                                                    <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">Real-time alerts for create, update, and delete actions on boards and cards.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="glass-panel p-8 rounded-[2.5rem] border-sky-500/20 bg-sky-500/[0.02] shadow-xl">
                                        <h3 className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-3">Setup Guide</h3>
                                        <ol className="text-[10px] font-medium text-muted-foreground space-y-3 list-decimal pl-4">
                                            <li>Search for <span className="font-bold text-foreground">@BotFather</span> on Telegram and create a new bot.</li>
                                            <li>Copy the <span className="font-bold text-foreground">API Token</span> and paste it here.</li>
                                            <li>Add your bot to a group or channel.</li>
                                            <li>Use <span className="font-bold text-foreground">@userinfobot</span> to find the Chat ID of your target group/channel.</li>
                                            <li>Ensure the bot has permission to send messages.</li>
                                        </ol>
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
