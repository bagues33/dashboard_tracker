import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 mesh-gradient selection:bg-primary/30">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="group transition-transform hover:scale-110 active:scale-95 duration-300">
                        <div className="bg-card w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border border-white/20 glass-panel">
                            <ApplicationLogo className="h-10 w-10 fill-current text-primary" />
                        </div>
                    </Link>
                </div>

                <div className="w-full overflow-hidden bg-card/60 backdrop-blur-xl border border-white/20 px-8 py-10 shadow-2xl rounded-[2rem] glass-panel">
                    {children}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                        &copy; {new Date().getFullYear()} Project Tracker &bull; Premium Access
                    </p>
                </div>
            </div>
        </div>
    );
}
