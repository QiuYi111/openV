import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
    fileName: string;
    code: string;
    language: string;
    onChange?: (value: string | undefined) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ fileName, code, language, onChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            {/* Editor Tab Header */}
            <div style={{
                height: '40px',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                borderBottom: '1px solid var(--border-soft)'
            }}>
                <div style={{
                    backgroundColor: 'var(--bg-primary)',
                    padding: '8px 16px',
                    borderRadius: '8px 8px 0 0',
                    fontSize: '13px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '1px solid var(--border-soft)',
                    borderBottom: 'none',
                    marginBottom: '-1px'
                }}>
                    {fileName}
                </div>
            </div>

            {/* Monaco Editor Instance */}
            <div style={{ flex: 1 }}>
                <Editor
                    height="100%"
                    language={language}
                    value={code}
                    theme="vs-light" // We can add a custom theme later
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 20 }
                    }}
                    onChange={onChange}
                />
            </div>
        </div>
    );
};

export default CodeEditor;
