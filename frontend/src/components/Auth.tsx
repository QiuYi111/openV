import React, { useState } from 'react';
import { useAuthStore } from '../authStore';

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const { setAuth } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const endpoint = isLogin ? '/auth/login' : '/auth/register';

        try {
            const body = isLogin
                ? new URLSearchParams({ username: email, password })
                : JSON.stringify({ email, password, username });

            const res = await fetch(`http://localhost:8000${endpoint}`, {
                method: 'POST',
                headers: isLogin ? { 'Content-Type': 'application/x-www-form-urlencoded' } : { 'Content-Type': 'application/json' },
                body
            });

            if (!res.ok) throw new Error('Authentication failed');

            const data = await res.json();
            if (isLogin) {
                // Fetch current user info after login
                const userRes = await fetch('http://localhost:8000/auth/me', {
                    headers: { 'Authorization': `Bearer ${data.access_token}` }
                });
                const userData = await userRes.json();
                setAuth(data.access_token, userData);
            } else {
                setIsLogin(true);
                alert('Project registered! Please login.');
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-secondary)'
        }}>
            <form onSubmit={handleSubmit} style={{
                backgroundColor: 'var(--bg-primary)',
                padding: '40px',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-large)',
                width: '320px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <h2 style={{ textAlign: 'center', color: 'var(--accent-color)' }}>{isLogin ? 'Login to OpenV' : 'Create Account'}</h2>

                {!isLogin && (
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        style={inputStyle}
                    />
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={inputStyle}
                />

                {error && <p style={{ color: 'var(--status-red)', fontSize: '12px' }}>{error}</p>}

                <button type="submit" style={buttonStyle}>
                    {isLogin ? 'Login' : 'Register'}
                </button>

                <p
                    onClick={() => setIsLogin(!isLogin)}
                    style={{ textAlign: 'center', fontSize: '12px', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                >
                    {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                </p>
            </form>
        </div>
    );
};

const inputStyle = {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid var(--border-soft)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    outline: 'none'
};

const buttonStyle = {
    padding: '12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'var(--accent-color)',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer'
};

export default Auth;
