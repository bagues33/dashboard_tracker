import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Recover Password</h1>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Forgot your password? No problem. Just let us know your email address and we will email you a link to reset it.
                </p>
            </div>

            {status && (
                <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <Send size={12} />
                    </div>
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-2 block">
                        Registered Email Address
                    </label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Mail size={18} />
                        </div>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="w-full bg-secondary/30 border border-border rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            autoFocus
                            placeholder="name@example.com"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="flex flex-col gap-4">
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="btn btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 group"
                    >
                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        <span>Send Reset Link</span>
                    </button>

                    <Link 
                        href={route('login')} 
                        className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                        <ArrowLeft size={14} />
                        Back to Login
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
