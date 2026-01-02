import React, { useEffect } from 'react';
import { Play, Shield, Terminal } from 'lucide-react';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onAction: (action: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onAction }) => {
    useEffect(() => {
        const handleClick = () => onClose();
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed',
            top: y,
            left: x,
            width: '180px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-medium)',
            border: '1px solid var(--border-soft)',
            zIndex: 2000,
            padding: '4px'
        }} onClick={e => e.stopPropagation()}>
            <div
                onClick={() => onAction('lint')}
                style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
                <Shield size={14} color="var(--accent-color)" /> Run Lint
            </div>
            <div
                onClick={() => onAction('sim')}
                style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
                <Play size={14} color="var(--status-green)" /> Run Simulation
            </div>
            <div
                onClick={() => onAction('terminal')}
                style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', borderRadius: '4px', borderTop: '1px solid var(--border-soft)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
                <Terminal size={14} /> Open in Terminal
            </div>
        </div>
    );
};

export default ContextMenu;
