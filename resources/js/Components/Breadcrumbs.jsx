import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ items }) => {
    return (
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
            <Link href={route('dashboard')} className="flex items-center gap-1.5 hover:text-primary transition-colors shrink-0">
                <Home size={12} />
                DASHBOARD
            </Link>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight size={10} className="shrink-0 opacity-30" />
                    {item.href ? (
                        <Link href={item.href} className="hover:text-primary transition-colors shrink-0">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-foreground shrink-0 truncate max-w-[200px]">{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumbs;
