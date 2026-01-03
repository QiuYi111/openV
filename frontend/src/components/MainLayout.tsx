import React from 'react';
import { Layout, FileText, Terminal as TerminalIcon, Settings, Activity, ShieldCheck, ShieldAlert, LineChart, Play, Square, LogOut, User as UserIcon, Plus } from 'lucide-react';
import FileTree from './FileTree';
import AgentChat from './AgentChat';
import CommandPalette from './CommandPalette';
import WaveformViewer from './WaveformViewer';
import TerminalComponent from './Terminal';
import { useProjectStore } from '../store';
import { useAuthStore } from '../authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { projects, currentProject, setProjects, setCurrentProject, stats, setStats, setStage } = useProjectStore();
    const { token, logout, user } = useAuthStore();
    const [showCommandPalette, setShowCommandPalette] = React.useState(false);
    const [bottomPanelTab, setBottomPanelTab] = React.useState<'terminal' | 'waveform'>('terminal');

    React.useEffect(() => {
        if (token) fetchProjects();
    }, [token]);

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/projects/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setProjects(data);
            if (data.length > 0 && !currentProject) {
                setCurrentProject(data[0]);
            }
        } catch (e) {
            console.error('Failed to fetch projects', e);
        }
    };

    const handleCreateProject = async () => {
        const name = prompt('Enter project name:');
        if (!name || !token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/projects/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description: 'Created from web UI' })
            });
            const newProj = await res.json();
            setProjects([...projects, newProj]);
            setCurrentProject(newProj);
        } catch (e) {
            console.error('Failed to create project', e);
        }
    };

    const handleToggleProject = async () => {
        if (!currentProject || !token) return;
        const action = currentProject.status === 'RUNNING' ? 'stop' : 'start';
        try {
            const res = await fetch(`${API_BASE_URL}/projects/${currentProject.id}/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const updated = await res.json();
            setCurrentProject(updated);
            setProjects(projects.map(p => p.id === updated.id ? updated : p));
        } catch (e) {
            console.error(`Failed to ${action} project`, e);
        }
    };

    // Polling for stats when running
    React.useEffect(() => {
        let interval: any;
        if (currentProject?.status === 'RUNNING' && token) {
            const fetchStats = async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/projects/${currentProject.id}/stats`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    const mem = data.memory_stats?.usage ? `${(data.memory_stats.usage / 1024 / 1024).toFixed(1)}MB` : '...';
                    setStats({ cpu: 'OK', memory: mem });
                } catch (e) {
                    setStats(null);
                }
            };
            fetchStats();
            interval = setInterval(fetchStats, 5000);
        } else {
            setStats(null);
        }
        return () => clearInterval(interval);
    }, [currentProject?.id, currentProject?.status, token]);

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-secondary)' }}>
            {showCommandPalette && <CommandPalette onClose={() => setShowCommandPalette(false)} />}

            <aside style={{
                width: '56px',
                backgroundColor: 'var(--bg-primary)',
                borderRight: '1px solid var(--border-soft)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px 0',
                gap: '24px'
            }}>
                <div style={{ color: 'var(--accent-color)' }}><Layout size={22} /></div>
                <div style={{ color: 'var(--text-secondary)' }}><FileText size={20} /></div>
                <div style={{ color: 'var(--text-secondary)' }}><Activity size={20} /></div>
                <div style={{ marginTop: 'auto', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={logout} title="Logout">
                    <LogOut size={20} />
                </div>
            </aside>

            <aside style={{
                width: '240px',
                backgroundColor: 'var(--bg-primary)',
                borderRight: '1px solid var(--border-soft)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-soft)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <UserIcon size={14} color="var(--text-tertiary)" />
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user?.username}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select
                            value={currentProject?.id || ''}
                            onChange={(e) => setCurrentProject(projects.find(p => p.id === Number(e.target.value)) || null)}
                            style={{ flex: 1, padding: '6px', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-soft)' }}
                        >
                            <option value="">Select Project</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <button onClick={handleCreateProject} title="Create Project" style={{ padding: '4px', borderRadius: '4px', border: '1px solid var(--border-soft)', backgroundColor: 'var(--bg-secondary)', cursor: 'pointer', color: 'var(--text-primary)' }}>
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
                <FileTree />
            </aside>

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header style={{ padding: '12px 20px', backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{currentProject?.name || 'No Project Selected'}</span>
                        {currentProject && (
                            <div style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: currentProject.status === 'RUNNING' ? 'rgba(76, 175, 80, 0.1)' : 'var(--bg-secondary)',
                                color: currentProject.status === 'RUNNING' ? 'var(--status-green)' : 'var(--text-tertiary)',
                                border: '1px solid currentColor'
                            }}>
                                {currentProject.status}
                            </div>
                        )}
                    </div>
                    {currentProject && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {stats && (
                                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginRight: '16px' }}>
                                    CPU: {stats.cpu} | MEM: {stats.memory}
                                </div>
                            )}
                            <button
                                onClick={handleToggleProject}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '4px', border: 'none',
                                    backgroundColor: currentProject.status === 'RUNNING' ? 'rgba(244, 67, 54, 0.1)' : 'var(--accent-color)',
                                    color: currentProject.status === 'RUNNING' ? 'var(--status-red)' : 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 600
                                }}
                            >
                                {currentProject.status === 'RUNNING' ? <><Square size={13} /> STOP</> : <><Play size={13} /> START</>}
                            </button>
                        </div>
                    )}
                </header>

                <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
                    {currentProject ? children : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                            <Layout size={48} strokeWidth={1} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p>Select or create a project to start developing.</p>
                        </div>
                    )}
                </div>

                <div style={{
                    height: bottomPanelTab === 'terminal' ? '220px' : '320px',
                    backgroundColor: 'var(--bg-primary)',
                    borderTop: '1px solid var(--border-soft)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'height 0.3s ease'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '12px 20px', borderBottom: '1px solid var(--border-soft)' }}>
                        <span onClick={() => setBottomPanelTab('terminal')} style={{ fontSize: '12px', fontWeight: 700, color: bottomPanelTab === 'terminal' ? 'var(--accent-color)' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <TerminalIcon size={14} /> TERMINAL
                        </span>
                        <span onClick={() => setBottomPanelTab('waveform')} style={{ fontSize: '12px', fontWeight: 700, color: bottomPanelTab === 'waveform' ? 'var(--accent-color)' : 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <LineChart size={14} /> WAVEFORMS
                        </span>
                    </div>

                    <div style={{ flex: 1, backgroundColor: '#0a0a0a', overflow: 'hidden' }}>
                        {bottomPanelTab === 'terminal' ? (
                            (currentProject?.status === 'RUNNING' && token) ? (
                                <TerminalComponent projectId={currentProject.id} token={token} />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                                    Project is not running. Start the project to access terminal.
                                </div>
                            )
                        ) : (
                            <WaveformViewer />
                        )}
                    </div>
                </div>

                {currentProject && (
                    <div style={{
                        position: 'fixed',
                        bottom: '240px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'var(--bg-primary)',
                        padding: '8px 20px',
                        borderRadius: '32px',
                        boxShadow: 'var(--shadow-medium)',
                        border: '1px solid var(--border-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        zIndex: 100
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: currentProject.stage === 'LOCKED' ? 'var(--status-red)' : 'var(--status-green)',
                            fontSize: '12px',
                            fontWeight: 700
                        }}>
                            {currentProject.stage === 'LOCKED' ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                            {currentProject.stage}
                        </div>
                    </div>
                )}
            </main>

            <section style={{ width: '320px', backgroundColor: 'var(--bg-primary)', borderLeft: '1px solid var(--border-soft)', display: 'flex', flexDirection: 'column' }}>
                <AgentChat />
            </section>
        </div>
    );
};

export default MainLayout;
