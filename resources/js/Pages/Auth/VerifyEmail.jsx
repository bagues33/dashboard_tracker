import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Send, LogOut } from 'lucide-react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 mb-4 shadow-lg shadow-amber-500/10">
                    <Mail size={24} />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Verify Your Email</h1>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you?
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Send size={12} />
                    </div>
                    <span>A new verification link has been sent to your email address.</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div className="flex flex-col gap-3">
                    <button 
                        disabled={processing}
                        className="btn btn-primary w-full py-3.5 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group transition-all active:scale-95"
                    >
                        <span>Resend Verification Email</span>
                        <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                        <LogOut size={14} />
                        Log Out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
