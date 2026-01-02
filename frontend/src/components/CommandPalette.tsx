import React from 'react';

interface CommandPaletteProps {
    onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: '0', left: '0', right: '0', bottom: '0',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '100px'
        }} onClick={onClose}>
            <div style={{
                width: '600px',
                height: '400px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-large)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>
                <input
                    autoFocus
                    placeholder="Type a command or search..."
                    style={{
                        padding: '16px',
                        fontSize: '16px',
                        border: 'none',
                        borderBottom: '1px solid var(--border-soft)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        outline: 'none'
                    }}
                />
                <div style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
                    <div style={{ padding: '8px', cursor: 'pointer', ':hover': { backgroundColor: 'var(--bg-secondary)' } } as any}>
                        Fetch Projects
                    </div>
                    <div style={{ padding: '8px', cursor: 'pointer' }}>
                        Start Container
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
