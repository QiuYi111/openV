import { create } from 'zustand';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
    setStage: (stage: ProjectStage, token?: string) => Promise<void>;
    setStats: (stats: { cpu: string; memory: string } | null) => void;
    addLog: (log: string) => void;
    clearLogs: () => void;
    runTestCase: (id: number, status: 'pass' | 'fail' | 'idle') => void;
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
    setStage: async (stage, token) => {
        const currentProject = useProjectStore.getState().currentProject;
        if (!currentProject) return;

        // Optimistic update
        set({ currentProject: { ...currentProject, stage } });

        if (token) {
            try {
                await fetch(`${API_BASE_URL}/projects/${currentProject.id}/stage`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ stage })
                });
            } catch (e) {
                console.error("Failed to persist stage", e);
                // Revert on failure if needed
            }
        }
    },
    setStats: (stats) => set({ stats }),
    addLog: (log) => set((state) => ({ lastLog: state.lastLog + (state.lastLog ? '\n' : '') + log })),
    clearLogs: () => set({ lastLog: '' }),
    runTestCase: (id, status) => set((state) => ({
        testCases: state.testCases.map(tc => tc.id === id ? { ...tc, status } : tc)
    })),
}));
