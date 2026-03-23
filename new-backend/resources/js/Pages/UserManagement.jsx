import React, { useState } from 'react';
import { User, Mail, Shield, Trash2, Edit, Users, Settings, Plus, Save, X, Check, Search, Server, Eye, EyeOff, Clock } from 'lucide-react';
import { Head, router, usePage } from '@inertiajs/react';
import Navbar from '../Components/Navbar';
import Breadcrumbs from '../Components/Breadcrumbs';
import axios from 'axios';

const VALID_TABS = ['members', 'access', 'projects', 'groups', 'whatsapp', 'smtp'];

const UserManagement = ({ auth, users, boards, permissions, accessGroups, whatsappSettings }) => {
    const getInitialTab = () => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('tab');
        return VALID_TABS.includes(t) ? t : 'members';
    };
    const [activeTab, setActiveTab] = useState(getInitialTab);
    const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', email: '', phone: '', password: '', role: 'user' });
    const [editingGroup, setEditingGroup] = useState(null);
    const [groupFormData, setGroupFormData] = useState({ name: '', permissions: {} });
    const [smtpSettings, setSmtpSettings] = useState({
        host: '',
        port: 587,
        username: '',
        password: '',
        encryption: 'tls',
        from_address: '',
        from_name: 'Project Tracker'
    });
    const [showSmtpPassword, setShowSmtpPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // WhatsApp inline form state
    const initWa = usePage().props.whatsappSettings;
    const [waForm, setWaForm] = useState({
        api_url: initWa?.api_url || '',
        api_token: initWa?.api_token || '',
        is_active: initWa?.is_active ?? true,
    });
    const [waSubmitting, setWaSubmitting] = useState(false);
    const [waSuccess, setWaSuccess] = useState(false);
    const [waError, setWaError] = useState('');
    const [triggerLoading, setTriggerLoading] = useState(false);
    const [triggerResult, setTriggerResult] = useState(null);
    const [triggerError, setTriggerError] = useState(null);

    const handleWaSubmit = (e) => {
        e.preventDefault();
        setWaSubmitting(true);
        setWaSuccess(false);
        setWaError('');
        router.put(route('whatsapp-settings.update'), waForm, {
            onSuccess: () => { setWaSuccess(true); setWaSubmitting(false); },
            onError: (err) => { setWaError(Object.values(err)[0] || 'Gagal menyimpan.'); setWaSubmitting(false); },
        });
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

    const switchTab = (tab) => {
        setActiveTab(tab);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.pushState({}, '', url.toString());
    };

    const togglePermission = (role, key, currentStatus) => {
        router.put(route('permissions.update'), {
            role,
            permission_key: key,
            is_enabled: !currentStatus
        }, {
            preserveScroll: true
        });
    };

    const toggleProjectPermission = (userId, boardId, key, currentStatus) => {
        router.put(route('permissions.project.update'), {
            user_id: userId,
            board_id: boardId,
            permission_key: key,
            is_enabled: !currentStatus
        }, {
            preserveScroll: true
        });
    };

    const assignProjectGroup = (userId, boardId, groupId) => {
        router.put(route('permissions.project.update'), {
            user_id: userId,
            board_id: boardId,
            access_group_id: groupId === "" ? null : groupId
        }, {
            preserveScroll: true
        });
    };

    const handleSaveSmtp = (e) => {
        e.preventDefault();
        router.put(route('smtp-settings.update'), smtpSettings, {
            onSuccess: () => {
                alert('SMTP settings saved successfully!');
            },
            preserveScroll: true
        });
    };

    React.useEffect(() => {
        fetch(route('smtp-settings.index'))
            .then(res => res.json())
            .then(data => {
                if (data) setSmtpSettings(data);
            })
            .catch(err => console.error('Failed to fetch SMTP settings', err));
    }, []);

    const handleSaveGroup = (e) => {
        e.preventDefault();
        const action = editingGroup ? route('access-groups.update', editingGroup.id) : route('access-groups.store');
        const method = editingGroup ? 'put' : 'post';

        router[method](action, groupFormData, {
            onSuccess: () => {
                setEditingGroup(null);
                setGroupFormData({ name: '', permissions: {} });
            },
            preserveScroll: true
        });
    };

    const handleDeleteGroup = (id) => {
        if (!window.confirm('Are you sure? This group will be removed from all assigned projects.')) return;
        router.delete(route('access-groups.destroy', id), { preserveScroll: true });
    };

    const toggleGroupPermission = (key) => {
        setGroupFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [key]: !prev.permissions[key]
            }
        }));
    };

    const handleSubmitUser = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        
        const action = editingUser ? route('users.update', editingUser.id) : route('users.store');
        const method = editingUser ? 'put' : 'post';

        router[method](action, formData, {
            onSuccess: () => {
                setIsModalOpen(false);
                setEditingUser(null);
                setFormData({ username: '', email: '', phone: '', password: '', role: 'user' });
                setSubmitting(false);
            },
            onError: (err) => {
                setError(Object.values(err)[0] || 'Failed to process user');
                setSubmitting(false);
            }
        });
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            phone: user.phone || '',
            password: '', // Leave blank for security
            role: user.role
        });
        setIsModalOpen(true);
    };

    const handleRoleChange = (userId, newRole) => {
        router.put(route('users.update', userId), { role: newRole }, { preserveScroll: true });
    };

    const handleDeleteUser = (userId) => {
        if (!window.confirm('Are you sure you want to remove this team member?')) return;
        router.delete(route('users.destroy', userId), { preserveScroll: true });
    };

    // Helper to group permissions by role for the matrix
    const permissionMap = (permissions || []).reduce((acc, p) => {
        if (!acc[p.permission_key]) acc[p.permission_key] = {};
        acc[p.permission_key][p.role] = p.is_enabled;
        return acc;
    }, {});

    const roles = ['admin', 'manager', 'user'];
    const permissionKeys = ['manage_users', 'manage_boards', 'manage_cards', 'import_data', 'view_analytics'];

    return (
        <>
            <Head title="User Management" />
            <div className="min-h-screen flex flex-col">
                <Navbar user={auth.user} />
                <div className="flex-1 p-8 md:p-12 fade-in overflow-auto mesh-gradient">
                    <div className="max-w-[1200px] mx-auto">
                        <Breadcrumbs items={[{ label: 'Team Management' }]} className="mb-6" />
                        <header className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">Team Management</h1>
                                <p className="text-muted-foreground mt-1 text-sm font-medium">Configure user roles and manage organization access.</p>
                            </div>
                            {activeTab === 'members' && (
                                <button 
                                    onClick={() => setIsModalOpen(true)}
                                    className="btn btn-primary flex items-center gap-2 shadow-lg"
                                >
                                    <Users size={16} />
                                    Add Member
                                </button>
                            )}
                        </header>

                        <div className="flex gap-2 mb-6 p-1 bg-secondary/20 rounded-xl w-fit border border-border">
                            <button
                                onClick={() => switchTab('members')}
                                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'members' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Team Members
                            </button>
                            <button
                                onClick={() => switchTab('access')}
                                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'access' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Access Control
                            </button>
                            <button
                                onClick={() => switchTab('projects')}
                                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'projects' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Project Access
                            </button>
                            <button
                                onClick={() => switchTab('groups')}
                                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'groups' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Access Groups
                            </button>
                            {auth.user.role === 'admin' && (
                                <>
                                    <button
                                        onClick={() => switchTab('whatsapp')}
                                        className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'whatsapp' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        WhatsApp
                                    </button>
                                    <button
                                        onClick={() => switchTab('smtp')}
                                        className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'smtp' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        SMTP Settings
                                    </button>
                                </>
                            )}
                        </div>

                        {activeTab === 'members' && (
                            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden glass-panel">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/20">
                                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">User Profile</th>
                                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">System Role</th>
                                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {users.map(u => (
                                                <tr key={u.id} className="hover:bg-muted/10 transition-colors group">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground uppercase border border-border group-hover:border-primary/20 transition-colors">
                                                                {u.username.charAt(0)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{u.username}</span>
                                                                <span className="text-xs text-muted-foreground">{u.email}</span>
                                                                {u.phone && <span className="text-[10px] text-muted-foreground">WA: {u.phone}</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <select
                                                            className="bg-secondary/30 border border-border rounded-md px-3 py-1.5 text-[10px] font-bold uppercase focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer"
                                                            value={u.role}
                                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                        >
                                                            <option value="user">User</option>
                                                            <option value="admin">Admin</option>
                                                            <option value="manager">Manager</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                            <button 
                                                                onClick={() => handleEditUser(u)}
                                                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-all"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteUser(u.id)}
                                                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {activeTab === 'groups' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1 space-y-4">
                                        <div className="bg-card border border-border rounded-2xl p-4 glass-panel space-y-2">
                                            <div className="flex items-center justify-between mb-2 px-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Available Groups</p>
                                                <button onClick={() => { setEditingGroup(null); setGroupFormData({ name: '', permissions: {} }); }} className="p-1 hover:bg-primary/10 rounded-md text-primary transition-colors">
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            {(accessGroups || []).map(group => (
                                                <div key={group.id} className={`flex items-center justify-between p-3 rounded-xl transition-all border ${editingGroup?.id === group.id ? 'bg-primary/5 border-primary/20' : 'bg-secondary/20 border-transparent hover:bg-secondary/40'}`}>
                                                    <span className="text-sm font-bold truncate pr-2">{group.name}</span>
                                                    <div className="flex gap-1 shrink-0">
                                                        <button 
                                                            onClick={() => { setEditingGroup(group); setGroupFormData({ name: group.name, permissions: group.permissions }); }}
                                                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-all"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteGroup(group.id)}
                                                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden glass-panel h-full flex flex-col">
                                            <div className="p-5 border-b border-border bg-muted/20 flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-sm font-bold">{editingGroup ? 'Edit Group' : 'New Access Group'}</h3>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">Define granular group permissions</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {editingGroup && (
                                                        <button onClick={() => { setEditingGroup(null); setGroupFormData({ name: '', permissions: {} }); }} className="btn bg-secondary text-xs px-4 py-2 hover:bg-secondary/80">Cancel</button>
                                                    )}
                                                    <button onClick={handleSaveGroup} className="btn btn-primary text-xs px-4 py-2 flex items-center gap-2">
                                                        <Save size={14} />
                                                        {editingGroup ? 'Update Group' : 'Save Group'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-6 space-y-6 overflow-y-auto">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Group Name</label>
                                                        <input 
                                                            value={groupFormData.name} 
                                                            onChange={e => setGroupFormData({...groupFormData, name: e.target.value})}
                                                            className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                            placeholder="e.g., Senior Developer"
                                                        />
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {[
                                                            { label: 'Project Management', permissions: ['project_view', 'project_edit', 'project_delete', 'section_manage'] },
                                                            { label: 'Task Management', permissions: ['card_create', 'card_edit', 'card_delete', 'card_move'] },
                                                            { label: 'Detail Management', permissions: ['subtask_manage', 'qa_manage'] },
                                                            { label: 'Extras', permissions: ['data_import', 'analytics_view'] }
                                                        ].map(section => (
                                                            <div key={section.label} className="space-y-3 p-4 rounded-xl bg-secondary/10 border border-border/50">
                                                                <h4 className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">{section.label}</h4>
                                                                <div className="space-y-2">
                                                                    {section.permissions.map(key => (
                                                                        <label key={key} className="flex items-center justify-between group cursor-pointer">
                                                                            <span className="text-[11px] font-bold text-foreground/80 group-hover:text-primary transition-colors capitalize">{key.split('_').join(' ')}</span>
                                                                            <div 
                                                                                onClick={() => toggleGroupPermission(key)}
                                                                                className={`w-8 h-4 rounded-full relative transition-all ${groupFormData.permissions[key] ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                                                            >
                                                                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${groupFormData.permissions[key] ? 'left-[17px]' : 'left-0.5'}`} />
                                                                            </div>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'smtp' && (
                            <div className="max-w-3xl mx-auto">
                                <form onSubmit={handleSaveSmtp} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden glass-panel">
                                    <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold">Mail Server Configuration</h3>
                                            <p className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">Configure SMTP for system notifications and password resets</p>
                                        </div>
                                        <button type="submit" className="btn btn-primary text-xs px-6 py-2.5 flex items-center gap-2 shadow-lg">
                                            <Save size={14} />
                                            Save Settings
                                        </button>
                                    </div>
                                    <div className="p-8 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Server size={14} className="text-primary" />
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Server Details</h4>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">SMTP Host</label>
                                                    <input 
                                                        value={smtpSettings.host}
                                                        onChange={e => setSmtpSettings({...smtpSettings, host: e.target.value})}
                                                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                        placeholder="smtp.mailtrap.io"
                                                        required
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Port</label>
                                                        <input 
                                                            type="number"
                                                            value={smtpSettings.port}
                                                            onChange={e => setSmtpSettings({...smtpSettings, port: e.target.value})}
                                                            className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                            placeholder="587"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Encryption</label>
                                                        <select 
                                                            value={smtpSettings.encryption}
                                                            onChange={e => setSmtpSettings({...smtpSettings, encryption: e.target.value})}
                                                            className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer"
                                                        >
                                                            <option value="tls">TLS</option>
                                                            <option value="ssl">SSL</option>
                                                            <option value="none">None</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Shield size={14} className="text-primary" />
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Authentication</h4>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Username</label>
                                                    <input 
                                                        value={smtpSettings.username || ''}
                                                        onChange={e => setSmtpSettings({...smtpSettings, username: e.target.value})}
                                                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                        placeholder="smtp-user"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                                                    <div className="relative group/pass">
                                                        <input 
                                                            type={showSmtpPassword ? "text" : "password"}
                                                            value={smtpSettings.password || ''}
                                                            onChange={e => setSmtpSettings({...smtpSettings, password: e.target.value})}
                                                            className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium pr-10"
                                                            placeholder="••••••••"
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                                        >
                                                            {showSmtpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-border/50">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Mail size={14} className="text-primary" />
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sender Information</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">From Address</label>
                                                    <input 
                                                        type="email"
                                                        value={smtpSettings.from_address}
                                                        onChange={e => setSmtpSettings({...smtpSettings, from_address: e.target.value})}
                                                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                        placeholder="noreply@example.com"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">From Name</label>
                                                    <input 
                                                        value={smtpSettings.from_name}
                                                        onChange={e => setSmtpSettings({...smtpSettings, from_name: e.target.value})}
                                                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                        placeholder="Project Tracker"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-primary/5 border-t border-border flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Shield size={14} />
                                        </div>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
                                            Data encryption is applied for password storage. Ensure your SMTP provider allows connections from this server's IP address.
                                        </p>
                                    </div>
                                </form>
                            </div>
                        )}
                        {(activeTab === 'access' || activeTab === 'projects') && (
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-4 glass-panel max-h-[600px] overflow-y-auto divide-y divide-border/50">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 px-2">Select Team Member</p>
                                    {users.map(u => (
                                        <button
                                            key={u.id}
                                            onClick={() => setSelectedUserId(u.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedUserId === u.id ? 'bg-primary/10 border border-primary/20 shadow-sm' : 'hover:bg-secondary/50 border border-transparent'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border ${selectedUserId === u.id ? 'bg-primary text-white border-primary' : 'bg-secondary text-muted-foreground border-border'}`}>
                                                {u.username.charAt(0)}
                                            </div>
                                            <div className="text-left overflow-hidden">
                                                <p className={`text-xs font-bold truncate ${selectedUserId === u.id ? 'text-primary' : 'text-foreground'}`}>{u.username}</p>
                                                <p className="text-[10px] text-muted-foreground truncate uppercase">{u.role}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="lg:col-span-3">
                                    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden glass-panel">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-border bg-muted/20">
                                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Project Name</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Access Group</th>
                                                        {['view', 'create', 'edit', 'delete'].map(p => (
                                                            <th key={p} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center text-muted-foreground">{p}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {boards.map(board => {
                                                        const user = users.find(u => u.id === selectedUserId);
                                                        const userBoard = user?.assigned_boards?.find(ab => ab.id === board.id);
                                                        return (
                                                            <tr key={board.id} className="hover:bg-muted/10 transition-colors group">
                                                                <td className="px-6 py-5">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{board.name}</span>
                                                                        <span className="text-[10px] text-muted-foreground uppercase font-medium">#{board.id}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-5">
                                                                    <select
                                                                        disabled={user?.role === 'admin'}
                                                                        className="bg-secondary/30 border border-border rounded-md px-3 py-1.5 text-[10px] font-bold uppercase focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer disabled:opacity-30 w-full"
                                                                        value={userBoard?.pivot?.access_group_id || ""}
                                                                        onChange={(e) => assignProjectGroup(selectedUserId, board.id, e.target.value)}
                                                                    >
                                                                        <option value="">No Group (Manual)</option>
                                                                        {accessGroups.map(g => (
                                                                            <option key={g.id} value={g.id}>{g.name}</option>
                                                                        ))}
                                                                    </select>
                                                                </td>
                                                                {['can_view', 'can_create', 'can_edit', 'can_delete'].map(key => (
                                                                    <td key={key} className="px-6 py-5 text-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            disabled={user?.role === 'admin' || userBoard?.pivot?.access_group_id}
                                                                            title={user?.role === 'admin' ? "Admins have full access" : (userBoard?.pivot?.access_group_id ? "Managed by Group" : "")}
                                                                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer disabled:opacity-30"
                                                                            checked={user?.role === 'admin' || !!userBoard?.pivot?.[key]}
                                                                            onChange={() => toggleProjectPermission(selectedUserId, board.id, key, !!userBoard?.pivot?.[key])}
                                                                        />
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
                                        <div className="text-primary mt-0.5">
                                            <Shield size={14} />
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground leading-normal">
                                            <span className="text-primary uppercase">Security Protocol:</span> Permissions are enforced at the project level. Admins have implicit full access to all projects regardless of individual assignment states.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'whatsapp' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl">
                                {/* Settings Form */}
                                <form onSubmit={handleWaSubmit} className="lg:col-span-7 bg-card border border-border rounded-2xl p-8 space-y-6 shadow-sm">
                                    <div>
                                        <h3 className="text-base font-black tracking-tight">WhatsApp Gateway</h3>
                                        <p className="text-xs text-muted-foreground mt-1">Konfigurasi API untuk notifikasi WhatsApp otomatis</p>
                                    </div>

                                    {waError && <div className="p-3 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg">{waError}</div>}

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">API Endpoint URL</label>
                                        <input
                                            type="url"
                                            required
                                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="https://api.fonnte.com/send"
                                            value={waForm.api_url}
                                            onChange={(e) => setWaForm({ ...waForm, api_url: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Authorization Token</label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="••••••••••••"
                                            value={waForm.api_token}
                                            onChange={(e) => setWaForm({ ...waForm, api_token: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setWaForm({ ...waForm, is_active: !waForm.is_active })}
                                            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${waForm.is_active ? 'bg-primary' : 'bg-secondary'}`}
                                        >
                                            <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-all duration-300 shadow ${waForm.is_active ? 'translate-x-6' : ''}`} />
                                        </button>
                                        <span className="text-sm font-semibold">{waForm.is_active ? 'Notifikasi Aktif' : 'Notifikasi Non-aktif'}</span>
                                    </div>

                                    <div className="flex items-center gap-4 pt-2 border-t border-border">
                                        <button
                                            type="submit"
                                            disabled={waSubmitting}
                                            className="btn btn-primary gap-2"
                                        >
                                            <Save size={14} />
                                            {waSubmitting ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                                        </button>
                                        {waSuccess && (
                                            <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
                                                <Check size={14} /> Tersimpan!
                                            </span>
                                        )}
                                    </div>
                                </form>

                                {/* Manual Trigger Panel */}
                                <div className="lg:col-span-5 space-y-4">
                                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                                        <div>
                                            <h3 className="text-sm font-black tracking-tight">Kirim Reminder Manual</h3>
                                            <p className="text-xs text-muted-foreground mt-1">Kirim notifikasi due date sekarang (H-2 s/d H+3) untuk semua task aktif</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleSendReminders}
                                            disabled={triggerLoading}
                                            className="w-full btn btn-primary gap-2 disabled:opacity-60"
                                        >
                                            {triggerLoading
                                                ? <><Settings size={14} className="animate-spin" /> Mengirim...</>
                                                : <><Mail size={14} /> Kirim Reminder Sekarang</>
                                            }
                                        </button>
                                        {triggerResult && (
                                            <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                                                <Check size={14} className="shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-black">{triggerResult.count} Reminder Terkirim</p>
                                                    <p className="text-[10px] opacity-70 mt-0.5">{triggerResult.message}</p>
                                                </div>
                                            </div>
                                        )}
                                        {triggerError && (
                                            <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                                                <X size={14} className="shrink-0 mt-0.5" />
                                                <p className="text-xs font-semibold">{triggerError}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Jadwal Otomatis</h3>
                                        <div className="space-y-2 text-xs text-muted-foreground">
                                            <p className="text-[10px] mt-3 pt-3 border-t border-border">Notifikasi berhenti otomatis bila status task sudah <strong className="text-foreground">Done</strong></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}



                        {isModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6">
                                <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl scale-in overflow-hidden">
                                    <div className="p-6 border-b border-border bg-muted/50">
                                        <h2 className="text-xl font-bold">{editingUser ? 'Edit Team Member' : 'Add New Member'}</h2>
                                        <p className="text-xs text-muted-foreground mt-1">{editingUser ? `Updating details for ${editingUser.username}` : 'Create a user account for your team member.'}</p>
                                    </div>
                                    <form onSubmit={handleSubmitUser} className="p-6 space-y-4">
                                        {error && <div className="p-3 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg text-center">{error}</div>}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Username</label>
                                            <input
                                                required
                                                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="johndoe"
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">WhatsApp Number</label>
                                            <input
                                                type="text"
                                                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="628123456789"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{editingUser ? 'New Password (Optional)' : 'Initial Password'}</label>
                                            <input
                                                required={!editingUser}
                                                type="password"
                                                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder={editingUser ? 'Leave blank to keep current' : '••••••••'}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Access Role</label>
                                            <select
                                                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                                <option value="manager">Manager</option>
                                            </select>
                                        </div>
                                        <div className="pt-4 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => { setIsModalOpen(false); setEditingUser(null); }}
                                                className="btn flex-1 bg-secondary hover:bg-secondary/80 text-foreground"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="btn btn-primary flex-1"
                                            >
                                                {submitting ? (editingUser ? 'Updating...' : 'Creating...') : (editingUser ? 'Update Member' : 'Create Member')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserManagement;
