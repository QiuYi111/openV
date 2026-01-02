import React from 'react';
import { Send, Bot, User, Play } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    type?: 'text' | 'diff' | 'action';
}

import { useProjectStore } from '../store';

const AgentChat: React.FC = () => {
    const { addLog, runTestCase, setStage } = useProjectStore();
    const [messages, setMessages] = React.useState<Message[]>([
        { id: '1', role: 'assistant', content: 'How can I help with your Verilog design today?' }
    ]);
    const [input, setInput] = React.useState('');

    const handleAction = (type: string) => {
        if (type === 'sim') {
            addLog('$ openv_run_sim --all\n[INFO] Re-running simulation...');
            setTimeout(() => {
                runTestCase(3, 'pass');
                addLog('[SUCCESS] Test Case 3 passed.\n[SUCCESS] Simulation complete: VERIFIED.');
                setStage('VERIFIED');
            }, 1500);
        }
    };

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Mock AI response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'I see you want to run simulation. Should I trigger `openv_run_sim` for `alu.v`?',
                type: 'action'
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={18} color="var(--accent-color)" />
                <span style={{ fontWeight: 600 }}>OpenV Agent</span>
            </div>

            {/* Messages area */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map(msg => (
                    <div key={msg.id} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        gap: '8px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--text-tertiary)'
                        }}>
                            {msg.role === 'assistant' ? <><Bot size={12} /> OPENV AGENT</> : <><User size={12} /> YOU</>}
                        </div>
                        <div style={{
                            maxWidth: '90%',
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: msg.role === 'user' ? 'var(--accent-color)' : 'var(--bg-secondary)',
                            color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            boxShadow: msg.role === 'assistant' ? 'none' : 'var(--shadow-soft)'
                        }}>
                            {msg.content}
                        </div>

                        {/* If action message, show buttons */}
                        {msg.type === 'action' && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <button
                                    onClick={() => handleAction('sim')}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '16px',
                                        border: '1px solid var(--accent-color)',
                                        backgroundColor: 'transparent',
                                        color: 'var(--accent-color)',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        cursor: 'pointer'
                                    }}>
                                    <Play size={12} /> Run Simulation
                                </button>
                                <button style={{
                                    padding: '6px 12px',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--text-secondary)',
                                    fontSize: '12px',
                                    fontWeight: 600
                                }}>
                                    Ignore
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Input area */}
            <div style={{ padding: '20px', borderTop: '1px solid var(--border-soft)' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '4px 12px',
                    borderRadius: '24px',
                    border: '1px solid var(--border-soft)'
                }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask OpenV Agent..."
                        style={{
                            flex: 1,
                            padding: '8px 4px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            outline: 'none',
                            fontSize: '14px',
                            color: 'var(--text-primary)'
                        }}
                    />
                    <button
                        onClick={handleSend}
                        style={{
                            backgroundColor: 'var(--accent-color)',
                            color: '#fff',
                            border: 'none',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgentChat;
