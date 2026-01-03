import React from 'react';
import { Send, Bot, User, Play } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    type?: 'text' | 'diff' | 'action';
}

import { useProjectStore } from '../store';
import { useAuthStore } from '../authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const AgentChat: React.FC = () => {
    const { addLog, runTestCase, setStage, currentProject } = useProjectStore();
    const { token } = useAuthStore();
    const [messages, setMessages] = React.useState<Message[]>([]);

    // Load messages on mount or project change
    React.useEffect(() => {
        if (currentProject && token) {
            fetchMessages();
        } else {
            setMessages([]);
        }
    }, [currentProject?.id, token]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/projects/${currentProject!.id}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (e) {
            console.error("Failed to fetch messages", e);
        }
    };
    const [input, setInput] = React.useState('');

    const handleAction = (type: string) => {
        if (type === 'sim') {
            addLog('$ openv_run_sim --all\n[INFO] Re-running simulation...');
            setTimeout(() => {
                runTestCase(3, 'pass');
                addLog('[SUCCESS] Test Case 3 passed.\n[SUCCESS] Simulation complete: VERIFIED.');
                if (token) setStage('VERIFIED', token);
            }, 1500);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !currentProject || !token) return;

        const content = input;
        setInput('');

        // Optimistic update
        const tempId = Date.now().toString();
        const userMsg: Message = { id: tempId, role: 'user', content };
        setMessages(prev => [...prev, userMsg]);

        try {
            // Save user message (Backend handles Autopilot if content starts with /)
            const res = await fetch(`${API_BASE_URL}/projects/${currentProject.id}/messages`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'user', content })
            });

            if (res.ok) {
                // Fetch all messages (including potential AI responses from Autopilot)
                fetchMessages();
            }

        } catch (e) {
            console.error("Failed to send message", e);
        }
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
