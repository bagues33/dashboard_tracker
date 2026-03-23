import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Layout, AlertCircle, X, Trash2, Grid, List as ListIcon, Calendar } from 'lucide-react';
import Navbar from '../../Components/Navbar';
import Breadcrumbs from '../../Components/Breadcrumbs';

const BoardIndex = ({ auth, boards }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    const handleCreateBoard = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        router.post(route('boards.store'), formData, {
            onSuccess: () => {
                setIsModalOpen(false);
                setFormData({ name: '', description: '' });
                setLoading(false);
            },
            onError: (err) => {
                setError(err.name || 'Failed to create workspace');
                setLoading(false);
            }
        });
    };

    const handleDeleteBoard = (e, boardId) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (confirm('Are you sure you want to delete this workspace? All tasks inside will be permanently lost.')) {
            router.delete(route('boards.destroy', boardId));
        }
    };

    return (
        <>
            <Head title="Workspaces" />
            <div className="min-h-screen mesh-gradient flex flex-col">
                <Navbar user={auth.user} />
                <div className="flex-1 p-6 md:p-10 max-w-[1200px] mx-auto w-full fade-in">
                    <Breadcrumbs items={[{ label: 'Workspaces' }]} className="mb-6" />
                    <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-foreground">Your Workspaces</h1>
                            <p className="text-muted-foreground mt-2 text-sm font-medium">Select a project to view tasks, or create a new one.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-background border border-border/50 rounded-xl p-1 shadow-sm">
                                <button 
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
                                >
                                    <Grid size={16} />
                                </button>
                                <button 
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
                                >
                                    <ListIcon size={16} />
                                </button>
                            </div>
                            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary gap-2 shadow-lg shadow-primary/20 h-10 px-4">
                                <Plus size={16} />
                                New Workspace
                            </button>
                        </div>
                    </header>

                    {boards && boards.length > 0 ? (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {boards.map(board => (
                                    <Link 
                                        key={board.id} 
                                        href={route('boards.show', board.id)}
                                        className="glass-panel p-6 rounded-3xl border border-white/40 shadow-xl shadow-primary/5 hover:border-primary/30 hover:shadow-primary/10 transition-all hover:-translate-y-1 group cursor-pointer flex flex-col relative"
                                    >
                                        <button 
                                            onClick={(e) => handleDeleteBoard(e, board.id)}
                                            className="absolute top-4 right-4 p-2 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                                            title="Delete Workspace"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                            <Layout size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors pr-8">{board.name}</h3>
                                        <p className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-widest line-clamp-2 mb-4">{board.description || 'No description provided'}</p>
                                        <div className="mt-auto pt-4 border-t border-border/10 flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-muted-foreground inline-flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-md">
                                                <Calendar size={10} />
                                                {new Date(board.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-panel rounded-3xl border border-white/40 shadow-xl shadow-primary/5 overflow-hidden">
                                <div className="divide-y divide-border/30">
                                    {boards.map(board => (
                                        <Link 
                                            key={board.id} 
                                            href={route('boards.show', board.id)}
                                            className="flex items-center p-4 hover:bg-secondary/30 transition-colors group cursor-pointer"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mr-4 group-hover:scale-105 transition-transform shrink-0">
                                                <Layout size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0 pr-4">
                                                <h3 className="text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors truncate">{board.name}</h3>
                                                <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">{board.description || 'No description provided'}</p>
                                            </div>
                                            <div className="hidden sm:flex items-center gap-4 mr-6">
                                                <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                                                    <Calendar size={12} />
                                                    Created {new Date(board.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={(e) => handleDeleteBoard(e, board.id)}
                                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                title="Delete Workspace"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="glass-panel mt-10 p-12 rounded-[2.5rem] border-white/40 text-center flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-20 h-20 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mb-6 shadow-inner ring-1 ring-border">
                                <AlertCircle size={32} />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">No active workspaces</h2>
                            <p className="text-sm text-muted-foreground max-w-sm mb-8">You haven't created any projects yet. Initialize your first workspace to start collaborating.</p>
                            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary gap-2 px-8 py-3 h-auto rounded-xl">
                                <Plus size={18} />
                                Create First Project
                            </button>
                        </div>
                    )}
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6 fade-in">
                        <div className="bg-card w-full max-w-md rounded-[2rem] border border-border shadow-2xl scale-in overflow-hidden">
                            <div className="p-8 border-b border-border bg-muted/20 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                                        <Layout size={18} className="text-primary" />
                                        New Workspace
                                    </h2>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-widest">Create a new project environment</p>
                                </div>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-muted-foreground hover:text-foreground transition-all hover:bg-secondary rounded-xl">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateBoard} className="p-8 space-y-5 bg-background">
                                {error && <div className="p-3 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg text-center">{error}</div>}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Workspace Name</label>
                                    <input
                                        required
                                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-semibold"
                                        placeholder="e.g. Q4 Marketing Campaign"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description (Optional)</label>
                                    <textarea
                                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none font-medium min-h-[100px]"
                                        placeholder="Brief details about this project's goals..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary w-full py-4 h-auto rounded-xl text-xs font-black tracking-widest uppercase shadow-lg shadow-primary/20"
                                    >
                                        {loading ? (
                                            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mx-auto" />
                                        ) : 'Initialize Project'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default BoardIndex;
