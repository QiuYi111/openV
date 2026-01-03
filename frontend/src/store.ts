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

interface VcdFile {
    name: string;
    path: string;
    size: number;
}

interface ProjectState {
    currentProject: Project | null;
    projects: Project[];
    testCases: { id: number; status: 'idle' | 'pass' | 'fail'; name: string }[];
    vcdFiles: VcdFile[];
    selectedVcdMetadata: any | null; // Added for metadata
    lastLog: string;
    stats: { cpu: string; memory: string } | null;

    setProjects: (projects: Project[]) => void;
    setCurrentProject: (project: Project | null) => void;
    setStage: (stage: ProjectStage, token?: string) => Promise<void>;
    fetchVcdFiles: (token: string) => Promise<void>;
    fetchVcdMetadata: (filename: string, token: string) => Promise<void>; // Added
    setStats: (stats: { cpu: string; memory: string } | null) => void;
    addLog: (log: string) => void;
    clearLogs: () => void;
    runTestCase: (id: number, status: 'pass' | 'fail' | 'idle') => void;
    syncProjectData: (token: string) => Promise<void>; // Added for test_results
}

export const useProjectStore = create<ProjectState>((set) => ({
    currentProject: null,
    projects: [],
    testCases: [], // Cleared mocks
    vcdFiles: [],
    selectedVcdMetadata: null,
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
            }
        }
    },
    fetchVcdFiles: async (token) => {
        const currentProject = useProjectStore.getState().currentProject;
        if (!currentProject) return;

        try {
            const res = await fetch(`${API_BASE_URL}/vcd/${currentProject.id}/list`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const files = await res.json();
            set({ vcdFiles: files });
        } catch (e) {
            console.error("Failed to fetch VCD files", e);
        }
    },
    fetchVcdMetadata: async (filename, token) => {
        const currentProject = useProjectStore.getState().currentProject;
        if (!currentProject) return;

        try {
            const res = await fetch(`${API_BASE_URL}/vcd/${currentProject.id}/metadata?filename=${encodeURIComponent(filename)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const metadata = await res.json();
            set({ selectedVcdMetadata: metadata });
        } catch (e) {
            console.error("Failed to fetch VCD metadata", e);
        }
    },
    syncProjectData: async (token) => {
        const currentProject = useProjectStore.getState().currentProject;
        if (!currentProject) return;

        try {
            const res = await fetch(`${API_BASE_URL}/projects/${currentProject.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.test_results) {
                const parsed = JSON.parse(data.test_results);
                set({ testCases: parsed });
            }
        } catch (e) {
            console.error("Failed to sync project data", e);
        }
    },
    setStats: (stats) => set({ stats }),
    addLog: (log) => set((state) => ({ lastLog: state.lastLog + (state.lastLog ? '\n' : '') + log })),
    clearLogs: () => set({ lastLog: '' }),
    runTestCase: (id, status) => set((state) => ({
        testCases: state.testCases.map(tc => tc.id === id ? { ...tc, status } : tc)
    })),
}));
