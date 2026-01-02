import { create } from 'zustand';

export type ProjectStage = 'IDLE' | 'LOCKED' | 'LINT_PASSED' | 'VERIFIED' | 'SYNTHESIZED';

interface ProjectState {
    stage: ProjectStage;
    testCases: { id: number; status: 'idle' | 'pass' | 'fail' }[];
    lastLog: string;
    setStage: (stage: ProjectStage) => void;
    runTestCase: (id: number, status: 'pass' | 'fail') => void;
    addLog: (log: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
    stage: 'LOCKED',
    testCases: [
        { id: 1, status: 'pass' },
        { id: 2, status: 'pass' },
        { id: 3, status: 'fail' },
        { id: 4, status: 'idle' },
        { id: 5, status: 'idle' },
    ],
    lastLog: '$ openv_run_sim --all\n[INFO] Running Test Case 3...\n[FAIL] Assertion error in ALU carry bit.',
    setStage: (stage) => set({ stage }),
    runTestCase: (id, status) => set((state) => ({
        testCases: state.testCases.map(tc => tc.id === id ? { ...tc, status } : tc)
    })),
    addLog: (log) => set((state) => ({ lastLog: state.lastLog + '\n' + log }))
}));
