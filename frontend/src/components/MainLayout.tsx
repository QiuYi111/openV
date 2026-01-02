import React from 'react';
import { Layout, FileText, Terminal, Settings, Activity, ShieldCheck, ShieldAlert, LineChart } from 'lucide-react';
import FileTree from './FileTree';
import AgentChat from './AgentChat';
import CommandPalette from './CommandPalette';
import WaveformViewer from './WaveformViewer';
import { useProjectStore } from '../store';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { stage, testCases, lastLog } = useProjectStore();
    const [showCommandPalette, setShowCommandPalette] = React.useState(false);
    const [bottomPanelTab, setBottomPanelTab] = React.useState<'terminal' | 'waveform'>('terminal');

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowCommandPalette(true);
            }
            if (e.key === 'Escape') {
                setShowCommandPalette(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-secondary)' }}>
            {showCommandPalette && <CommandPalette onClose={() => setShowCommandPalette(false)} />}
            {/* Left Sidebar: Navigation (Narrow) */}
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
                <div style={{ marginTop: 'auto', color: 'var(--text-secondary)' }}><Settings size={20} /></div>
            </aside>

            {/* File Explorer Sidebar */}
            <aside style={{
                width: '240px',
                backgroundColor: 'var(--bg-primary)',
                borderRight: '1px solid var(--border-soft)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <FileTree />
            </aside>

            {/* Primary Workspace Area */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Editor Area */}
                <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
                    {children}
                </div>

                {/* Bottom Panel: Terminal/Pipeline/Waveform */}
                <div style={{
                    height: bottomPanelTab === 'terminal' ? '180px' : '320px',
                    backgroundColor: 'var(--bg-primary)',
                    borderTop: '1px solid var(--border-soft)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'height 0.3s ease'
                }}>
                    {/* Tabs Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px',
                        padding: '12px 20px',
                        borderBottom: '1px solid var(--border-soft)'
                    }}>
                        <span
                            onClick={() => setBottomPanelTab('terminal')}
                            style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                color: bottomPanelTab === 'terminal' ? 'var(--accent-color)' : 'var(--text-tertiary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            <Terminal size={14} /> TERMINAL
                        </span>
                        <span
                            onClick={() => setBottomPanelTab('waveform')}
                            style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                color: bottomPanelTab === 'waveform' ? 'var(--accent-color)' : 'var(--text-tertiary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            <LineChart size={14} /> WAVEFORMS
                        </span>
                    </div>

                    {/* Tab Content */}
                    <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
                        {bottomPanelTab === 'terminal' ? (
                            <div style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                                {lastLog}
                            </div>
                        ) : (
                            <WaveformViewer />
                        )}
                    </div>
                </div>

                {/* Floating TDD Pipeline */}
                <div style={{
                    position: 'fixed',
                    bottom: '160px',
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
                        color: stage === 'LOCKED' ? 'var(--status-red)' : 'var(--status-green)',
                        fontSize: '12px',
                        fontWeight: 700
                    }}>
                        {stage === 'LOCKED' ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                        {stage === 'LOCKED' ? 'TDD LOCK' : 'VERIFIED'}
                    </div>
                    <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-soft)' }} />
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {testCases.map(tc => (
                            <div key={tc.id}
                                title={`Test Case ${tc.id}: ${tc.status}`}
                                style={{
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '50%',
                                    backgroundColor: tc.status === 'pass' ? 'var(--status-green)' : tc.status === 'fail' ? 'var(--status-red)' : 'var(--status-gray)',
                                    border: '2px solid var(--bg-primary)',
                                    boxShadow: '0 0 0 1px var(--border-soft)'
                                }}
                            />
                        ))}
                    </div>
                </div>
            </main>

            {/* Right Sidebar: AI Agent */}
            <section style={{
                width: '320px',
                backgroundColor: 'var(--bg-primary)',
                borderLeft: '1px solid var(--border-soft)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <AgentChat />
            </section>
        </div>
    );
};

export default MainLayout;
