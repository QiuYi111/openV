import React from 'react';
import { useProjectStore } from '../store';

interface WaveformSignal {
    name: string;
    data: number[]; // 0 or 1
}

const WaveformViewer: React.FC = () => {
    const { currentProject, vcdFiles, selectedVcdMetadata, fetchVcdFiles, fetchVcdMetadata } = useProjectStore();
    const token = localStorage.getItem('token') || ''; // Fallback for token

    React.useEffect(() => {
        if (currentProject && token && vcdFiles.length === 0) {
            fetchVcdFiles(token);
        }
    }, [currentProject?.id, token]);

    const handleFileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value && token) {
            fetchVcdMetadata(e.target.value, token);
        }
    };

    const signals: WaveformSignal[] = selectedVcdMetadata?.signals?.map((s: any) => ({
        name: s.name,
        data: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
    })) || [
            { name: 'No VCD Loaded', data: [0, 0, 0, 0] }
        ];

    const filename = selectedVcdMetadata?.filename || 'No File Selected';
    const timescale = selectedVcdMetadata?.timescale || '1ns';

    const stepWidth = 40;
    const signalHeight = 30;
    const signalPadding = 20;

    return (
        <div style={{
            flex: 1,
            backgroundColor: 'var(--bg-primary)',
            padding: '20px',
            overflowY: 'auto',
            borderTop: '1px solid var(--border-soft)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>WAVEFORM VIEW</span>
                <select
                    onChange={handleFileChange}
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-soft)',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px'
                    }}
                >
                    <option value="">Select VCD...</option>
                    {vcdFiles.map(f => <option key={f.path} value={f.name}>{f.name}</option>)}
                </select>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-soft)' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{filename} ({timescale})</span>
            </div>

            <div style={{ display: 'flex' }}>
                {/* Signal Names Column */}
                <div style={{ width: '120px', borderRight: '1px solid var(--border-soft)', paddingRight: '12px' }}>
                    {signals.map((sig, i) => (
                        <div key={i} style={{
                            height: signalHeight + signalPadding,
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            color: 'var(--text-secondary)'
                        }}>
                            {sig.name}
                        </div>
                    ))}
                </div>

                {/* Waveform Area (Scrollable) */}
                <div style={{ flex: 1, overflowX: 'auto', paddingLeft: '12px' }}>
                    <svg width={signals[0].data.length * stepWidth} height={signals.length * (signalHeight + signalPadding)}>
                        {signals.map((sig, sigIdx) => (
                            <g key={sigIdx} transform={`translate(0, ${sigIdx * (signalHeight + signalPadding)})`}>
                                {sig.data.map((val: number, stepIdx: number) => {
                                    const x = stepIdx * stepWidth;
                                    const nextVal = sig.data[stepIdx + 1];
                                    const y = val === 1 ? 5 : signalHeight - 5;

                                    return (
                                        <React.Fragment key={stepIdx}>
                                            {/* Horizontal line */}
                                            <line
                                                x1={x} y1={y}
                                                x2={x + stepWidth} y2={y}
                                                stroke="var(--accent-color)"
                                                strokeWidth="2"
                                            />
                                            {/* Vertical line (transition) */}
                                            {nextVal !== undefined && nextVal !== val && (
                                                <line
                                                    x1={x + stepWidth} y1={5}
                                                    x2={x + stepWidth} y2={signalHeight - 5}
                                                    stroke="var(--accent-color)"
                                                    strokeWidth="2"
                                                />
                                            )}
                                            {/* Bus values (simplified) */}
                                            {sig.name.includes('[') && val !== 0 && (
                                                <rect
                                                    x={x + 2} y={5}
                                                    width={stepWidth - 4} height={signalHeight - 10}
                                                    fill="var(--accent-soft)"
                                                    stroke="var(--accent-color)"
                                                    strokeWidth="1"
                                                />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </g>
                        ))}
                    </svg>
                </div>
            </div>
        </div >
    );
};

export default WaveformViewer;
