import React, { useState } from 'react';
import { X, Users, CheckCircle2 } from 'lucide-react';

const ReassignModal = ({ isOpen, onClose, onConfirm, users, title = 'Reassign Task' }) => {
    const [selectedUser, setSelectedUser] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!selectedUser) return;
        onConfirm(selectedUser);
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-sm rounded-[2.5rem] border-white/40 shadow-2xl overflow-hidden flex flex-col scale-in">
                <div className="px-8 py-6 border-b border-border/30 bg-background/50 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                            {title}
                        </h2>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                            Mandatory Reassignment on Move
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-all text-muted-foreground">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Users size={14} className="text-primary" />
                            Select New Assignee
                        </label>
                        <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin">
                            {users?.map(user => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => setSelectedUser(user.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-[1.25rem] border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                                        selectedUser === user.id
                                        ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5'
                                        : 'bg-background/40 border-border/40 hover:bg-background/60 hover:border-border text-foreground hover:shadow-xl'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black uppercase ring-1 ${
                                            selectedUser === user.id ? 'bg-primary text-white ring-primary/20' : 'bg-primary/10 text-primary ring-primary/10'
                                        }`}>
                                            {user.username.charAt(0)}
                                        </div>
                                        <span className="text-sm font-bold">{user.username}</span>
                                    </div>
                                    {selectedUser === user.id && <CheckCircle2 size={16} className="text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        disabled={!selectedUser}
                        onClick={handleConfirm}
                        className="w-full btn btn-primary py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale transition-all"
                    >
                        CONFIRM & MOVE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReassignModal;
