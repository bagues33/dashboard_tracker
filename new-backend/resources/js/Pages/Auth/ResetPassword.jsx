import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Lock, Mail, Key, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <div className="mb-8 text-center sm:text-left">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Create New Password</h1>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Set a secure password for your account to regain access.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <input type="hidden" value={data.token} />

                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-2 block">
                        Account Email
                    </label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                            <Mail size={18} />
                        </div>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="w-full bg-secondary/10 border border-border rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium opacity-60 cursor-not-allowed"
                            readOnly
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="space-y-5 pt-2">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-2 block">
                            New Password
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="w-full bg-secondary/30 border border-border rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                autoComplete="new-password"
                                autoFocus
                                placeholder="••••••••"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                        </div>
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-2 block">
                            Confirm New Password
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <ShieldCheck size={18} />
                            </div>
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="w-full bg-secondary/30 border border-border rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                autoComplete="new-password"
                                placeholder="••••••••"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>
                </div>

                <div className="pt-6">
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="btn btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 group transition-all active:scale-95"
                    >
                        <span>Update Password</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <div className="mt-6 flex items-center justify-center gap-2 p-3 bg-secondary/20 rounded-xl border border-border/50">
                        <Key size={12} className="text-primary" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                            Password must be at least 8 characters long.
                        </p>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
