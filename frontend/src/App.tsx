import React from 'react';
import MainLayout from './components/MainLayout';
import { useAuthStore } from './authStore';
import Auth from './components/Auth';

const App: React.FC = () => {
    const { token } = useAuthStore();

    if (!token) {
        return <Auth />;
    }

    return (
        <MainLayout>
            <div style={{ padding: '20px', color: 'var(--text-primary)' }}>
                <h2>Welcome to OpenV</h2>
                <p>Select a project to get started.</p>
            </div>
        </MainLayout>
    );
};

export default App;
