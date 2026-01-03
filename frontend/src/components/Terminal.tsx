import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalProps {
    projectId: number;
    token: string;
}

const TerminalComponent: React.FC<TerminalProps> = ({ projectId, token }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<Terminal | null>(null);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!terminalRef.current) return;

        const term = new Terminal({
            theme: {
                background: '#0a0a0a',
                foreground: '#d4d4d4',
                cursor: '#ff3e3e',
                selectionBackground: '#333333',
            },
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            cursorBlink: true
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = term;

        // Connect WebSocket using environment variable
        const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';
        const wsUrl = `${wsBaseUrl}/ws/terminal/${projectId}?token=${token}`;
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
            term.writeln('\x1b[1;32m[CONNECTED TO PROJECT TERMINAL]\x1b[0m');
        };

        ws.onmessage = (event) => {
            term.write(event.data);
        };

        ws.onclose = () => {
            term.writeln('\x1b[1;31m[DISCONNECTED]\x1b[0m');
        };

        term.onData((data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data);
            }
        });

        const handleResize = () => fitAddon.fit();
        window.addEventListener('resize', handleResize);

        return () => {
            ws.close();
            term.dispose();
            window.removeEventListener('resize', handleResize);
        };
    }, [projectId, token]);

    return (
        <div ref={terminalRef} style={{ height: '100%', width: '100%' }} />
    );
};

export default TerminalComponent;
