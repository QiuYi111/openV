import { create } from 'zustand';

export type ProjectStage = 'IDLE' | 'LOCKED' | 'LINT_PASSED' | 'VERIFIED' | 'SYNTHESIZED';

interface Project {
    id: number;
    name: string;
    status: 'RUNNING' | 'IDLE';
    stage: ProjectStage;
    container_id?: string;
}

interface ProjectState {
    currentProject: Project | null;
    projects: Project[];
    testCases: { id: number; status: 'idle' | 'pass' | 'fail' }[];
    lastLog: string;
    stats: { cpu: string; memory: string } | null;

    setProjects: (projects: Project[]) => void;
    setCurrentProject: (project: Project | null) => void;
    setStage: (stage: ProjectStage) => void;
    setStats: (stats: { cpu: string; memory: string } | null) => void;
    addLog: (log: string) => void;
    clearLogs: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
    currentProject: null,
    projects: [],
    testCases: [
        { id: 1, status: 'pass' },
        { id: 2, status: 'pass' },
        { id: 3, status: 'fail' },
        { id: 4, status: 'idle' },
        { id: 5, status: 'idle' },
    ],
    lastLog: '',
    stats: null,

    setProjects: (projects) => set({ projects }),
    setCurrentProject: (project) => set({ currentProject: project }),
    setStage: (stage) => set({ currentProject: stage ? { ...useProjectStore.getState().currentProject!, stage } : null }),
    setStats: (stats) => set({ stats }),
    addLog: (log) => set((state) => ({ lastLog: state.lastLog + (state.lastLog ? '\n' : '') + log })),
    clearLogs: () => set({ lastLog: '' }),
}));
