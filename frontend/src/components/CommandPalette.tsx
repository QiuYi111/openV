import React from 'react';
import { Search, Zap, Code, Play } from 'lucide-react';

const CommandPalette: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [query, setQuery] = React.useState('');

    const commands = [
        { icon: <Zap size={16} />, label: 'Lint Design', cmd: '/lint', desc: 'Run verible-verilog-lint' },
        { icon: <Play size={16} />, label: 'Run Simulation', cmd: '/sim', desc: 'Execute cocotb testbench' },
        { icon: <Code size={16} />, label: 'Synthesize', cmd: '/synth', desc: 'Logical synthesis with Yosys' },
    ];

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.1)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '100px',
            zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                width: '600px',
                height: 'fit-content',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-medium)',
                border: '1px solid var(--border-soft)',
                overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-soft)', gap: '12px' }}>
                    <Search size={20} color="var(--text-tertiary)" />
                    <input
                        autoFocus
                        placeholder="Type a command or search..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        style={{
                            flex: 1, border: 'none', outline: 'none', fontSize: '16px',
                            backgroundColor: 'transparent', color: 'var(--text-primary)'
                        }}
                    />
                    <kbd style={{
                        fontSize: '11px', padding: '4px 8px', borderRadius: '4px',
                        backgroundColor: 'var(--bg-secondary)', color: 'var(--text-tertiary)', border: '1px solid var(--border-soft)'
                    }}>ESC</kbd>
                </div>
                <div style={{ padding: '8px' }}>
                    {commands.map((c, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                            borderRadius: '8px', cursor: 'pointer', hover: { backgroundColor: 'var(--bg-secondary)' }
                        } as any}>
                            <div style={{ color: 'var(--accent-color)' }}>{c.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: 600 }}>{c.label}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{c.desc}</div>
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)' }}>{c.cmd}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
