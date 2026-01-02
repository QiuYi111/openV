import React, { useState } from 'react';
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react';
import ContextMenu from './ContextMenu';
import { useProjectStore } from '../store';

interface FileNode {
    name: string;
    type: 'file' | 'folder';
    children?: FileNode[];
}

const SAMPLE_FILES: FileNode[] = [
    {
        name: 'src',
        type: 'folder',
        children: [
            { name: 'alu.v', type: 'file' },
            { name: 'control.v', type: 'file' },
        ]
    },
    {
        name: 'test',
        type: 'folder',
        children: [
            { name: 'alu_tb.py', type: 'file' },
        ]
    },
    { name: 'README.md', type: 'file' },
];

const FileTreeItem: React.FC<{
    node: FileNode;
    depth: number;
    onContextMenu: (e: React.MouseEvent, node: FileNode) => void
}> = ({ node, depth, onContextMenu }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px 4px ' + (depth * 16 + 12) + 'px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: node.type === 'folder' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    borderRadius: '4px',
                }}
                onClick={() => node.type === 'folder' && setIsOpen(!isOpen)}
                onContextMenu={(e) => onContextMenu(e, node)}
            >
                {node.type === 'folder' ? (
                    <>
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <Folder size={16} color="var(--accent-color)" />
                    </>
                ) : (
                    <>
                        <div style={{ width: '14px' }} />
                        <File size={16} />
                    </>
                )}
                {node.name}
            </div>
            {node.type === 'folder' && isOpen && node.children?.map((child, i) => (
                <FileTreeItem key={i} node={child} depth={depth + 1} onContextMenu={onContextMenu} />
            ))}
        </div>
    );
};

const FileTree: React.FC = () => {
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, node: FileNode } | null>(null);
    const { addLog } = useProjectStore();

    const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, node });
    };

    const handleAction = (action: string) => {
        if (!contextMenu) return;
        const { node } = contextMenu;
        if (action === 'lint') {
            addLog(`$ openv_lint ${node.name}\n[INFO] Linting ${node.name}...\n[SUCCESS] No violations found.`);
        } else if (action === 'sim') {
            addLog(`$ openv_run_sim --top ${node.name}\n[INFO] Starting simulation...`);
        }
        setContextMenu(null);
    };

    return (
        <div style={{ padding: '12px 0', position: 'relative' }}>
            <div style={{ padding: '0 12px 8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
                EXPLORER
            </div>
            {SAMPLE_FILES.map((node, i) => (
                <FileTreeItem key={i} node={node} depth={0} onContextMenu={handleContextMenu} />
            ))}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    onAction={handleAction}
                />
            )}
        </div>
    );
};

export default FileTree;
