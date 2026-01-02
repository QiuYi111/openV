import React from 'react';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';

const FileTree: React.FC = () => {
    return (
        <div style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                EXPLORER
            </div>
            {/* Mock Structure */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 0' }}>
                <ChevronDown size={14} /> <Folder size={14} color="var(--accent-color)" /> src
            </div>
            <div style={{ paddingLeft: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 0' }}>
                    <File size={14} /> main.v
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 0' }}>
                    <File size={14} /> alu.v
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 0' }}>
                <ChevronRight size={14} /> <Folder size={14} /> tb
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 0' }}>
                <File size={14} /> README.md
            </div>
        </div>
    );
};

export default FileTree;
