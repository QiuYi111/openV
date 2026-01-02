import React from 'react';

interface WaveformSignal {
    name: string;
    data: number[]; // 0 or 1
}

const WaveformViewer: React.FC = () => {
    const signals: WaveformSignal[] = [
        { name: 'clk', data: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1] },
        { name: 'reset', data: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        { name: 'addr[7:0]', data: [0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 0, 0, 0] },
        { name: 'data_in[7:0]', data: [0, 0, 0, 10, 10, 20, 20, 30, 30, 40, 40, 0, 0, 0, 0, 0] },
        { name: 'ready', data: [0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0] },
    ];

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
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>WAVEFORM VIEW (alu.v)</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-soft)' }} />
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
                                {sig.data.map((val, stepIdx) => {
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
        </div>
    );
};

export default WaveformViewer;
