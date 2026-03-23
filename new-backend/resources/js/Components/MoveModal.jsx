import React, { useState, useEffect } from 'react';
import { X, Search, ChevronRight, Briefcase, FileText, CheckSquare, Loader2 } from 'lucide-react';

const MoveModal = ({ isOpen, onClose, onMove, currentData, users, targetLevel = 'checklist', title = 'Move Item' }) => {
    const [step, setStep] = useState(1); // 1: Board, 2: Card, 3: Checklist, 4: User
    const [boards, setBoards] = useState([]);
    const [cards, setCards] = useState([]);
    const [checklists, setChecklists] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchBoards();
            setStep(1);
            setSelectedBoard(null);
            setSelectedCard(null);
            setSelectedChecklist(null);
            setSelectedUser(null);
        }
    }, [isOpen]);

    const fetchBoards = async () => {
        setLoading(true);
        try {
            const resp = await fetch(route('api.boards'));
            const data = await resp.json();
            setBoards(data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const fetchCards = async (boardId) => {
        setLoading(true);
        try {
            const resp = await fetch(route('api.board-cards', boardId));
            const data = await resp.json();
            setCards(data);
            setStep(2);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const fetchChecklists = async (cardId) => {
        setLoading(true);
        try {
            const resp = await fetch(route('api.card-checklists', cardId));
            const data = await resp.json();
            setChecklists(data);
            setStep(3);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    if (!isOpen) return null;

    const filteredItems = () => {
        const items = step === 1 ? boards : step === 2 ? cards : step === 3 ? checklists : (users || []);
        if (!search) return items;
        return items.filter(item => 
            (item.name || item.title || item.content || item.username)?.toLowerCase().includes(search.toLowerCase())
        );
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-lg rounded-[2.5rem] border-white/40 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="px-8 py-6 border-b border-border/30 bg-background/50 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                            {title}
                        </h2>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                            {step === 1 ? 'Select Target Board' : step === 2 ? 'Select Target Task (Card)' : step === 3 ? 'Select Target Subtask' : 'Mandatory: Select New User'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-all text-muted-foreground">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-hidden flex flex-col">
                    {/* Breadcrumbs Selection */}
                    <div className="flex items-center gap-2 px-2 overflow-x-auto pb-1 scrollbar-hide">
                        <button 
                            onClick={() => setStep(1)}
                            className={`whitespace-nowrap text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${step === 1 ? 'bg-primary text-white' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
                        >
                            Board: {selectedBoard?.name || '...'}
                        </button>
                        {(step >= 2 || selectedCard) && (
                            <>
                                <ChevronRight size={12} className="text-muted-foreground/40 shrink-0" />
                                <button 
                                    onClick={() => step > 2 && setStep(2)}
                                    className={`whitespace-nowrap text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${step === 2 ? 'bg-primary text-white' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
                                >
                                    Task: {selectedCard?.title || '...'}
                                </button>
                            </>
                        )}
                        {(step === 3 || selectedChecklist) && (targetLevel === 'checklist') && (
                            <>
                                <ChevronRight size={12} className="text-muted-foreground/40 shrink-0" />
                                <button
                                    onClick={() => step > 3 && setStep(3)}
                                    className={`whitespace-nowrap text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${step === 3 ? 'bg-primary text-white' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
                                >
                                    Subtask: {selectedChecklist?.content || '...'}
                                </button>
                            </>
                        )}
                        {(step === 4 || selectedUser) && (
                            <>
                                <ChevronRight size={12} className="text-muted-foreground/40 shrink-0" />
                                <div className={`whitespace-nowrap text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${step === 4 ? 'bg-primary text-white' : 'bg-primary/5 text-primary'}`}>
                                    Assignee: {selectedUser?.username || '...'}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                        <input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={`Search ${step === 1 ? 'boards' : step === 2 ? 'tasks' : step === 3 ? 'subtasks' : 'users'}...`}
                            className="w-full bg-background/50 border border-border rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                        />
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar min-h-[300px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground font-bold text-sm gap-3">
                                <Loader2 size={32} className="animate-spin text-primary" />
                                Loading options...
                            </div>
                        ) : filteredItems().length > 0 ? (
                            filteredItems().map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setSearch('');
                                        if (step === 1) {
                                            setSelectedBoard(item);
                                            fetchCards(item.id);
                                        } else if (step === 2) {
                                            setSelectedCard(item);
                                            if (targetLevel === 'checklist') {
                                                fetchChecklists(item.id);
                                            } else { // targetLevel === 'card'
                                                setStep(4);
                                            }
                                        } else if (step === 3) {
                                            setSelectedChecklist(item);
                                            setStep(4);
                                        } else { // step === 4
                                            setSelectedUser(item);
                                        }
                                    }}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.01] active:scale-[0.99] ${
                                        (step === 1 && selectedBoard?.id === item.id) || 
                                        (step === 2 && selectedCard?.id === item.id) || 
                                        (step === 3 && selectedChecklist?.id === item.id) ||
                                        (step === 4 && selectedUser?.id === item.id)
                                        ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5'
                                        : 'bg-background/40 border-border/40 hover:bg-background/60 hover:border-border text-foreground hover:shadow-xl'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 text-left overflow-hidden">
                                        <div className={`p-2 rounded-xl shrink-0 ${
                                            step === 1 ? 'bg-indigo-500/10 text-indigo-500' :
                                            step === 2 ? 'bg-purple-500/10 text-purple-500' :
                                            step === 3 ? 'bg-emerald-500/10 text-emerald-500' :
                                            'bg-rose-500/10 text-rose-500'
                                        }`}>
                                            {step === 1 ? <Briefcase size={16} /> : step === 2 ? <FileText size={16} /> : step === 3 ? <CheckSquare size={16} /> : <Users size={16} />}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[13px] font-bold truncate">{item.name || item.title || item.content || item.username}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-muted-foreground/30" />
                                </button>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground font-bold text-sm">
                                No options found matching "{search}"
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-8 py-5 border-t border-border/30 bg-background/50 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="btn btn-ghost px-6">Cancel</button>
                    <button 
                        disabled={loading || !selectedUser || (targetLevel === 'checklist' && !selectedChecklist) || (targetLevel === 'card' && !selectedCard)}
                        onClick={() => onMove(targetLevel === 'card' ? selectedCard.id : selectedChecklist.id, selectedUser.id)}
                        className="btn btn-primary px-8 gap-2 shadow-xl shadow-primary/20"
                    >
                        Confirm Move
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MoveModal;
