import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Lock, User } from "lucide-react";

export const LoginPage: React.FC = () => {
    const { loginOidc, loginLocal, isAuthenticated } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleLocalLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await loginLocal(username, password);
        } catch (err) {
            setError("Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-900 overflow-hidden relative">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-purple-500/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-h-[500px]">
                {/* Left Side: Branding */}
                <div className="p-8 md:p-12 flex flex-col justify-center items-start text-white bg-slate-900/50">
                    <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg mb-6 flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-full opacity-80" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Enterprise Starter</h1>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        Secure, scalable, and production-ready template featuring Hybrid Authentication logic.
                    </p>
                    <div className="mt-8 flex gap-2">
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold">Vite</span>
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold">React</span>
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold">FastAPI</span>
                    </div>
                </div>

                {/* Right Side: Login Options */}
                <div className="p-8 md:p-12 flex flex-col justify-center bg-white/5">
                    <h2 className="text-2xl font-bold mb-6 text-white">Welcome Back</h2>

                    {/* OIDC Button */}
                    <button
                        onClick={loginOidc}
                        className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-semibold py-3 px-4 rounded-lg hover:bg-slate-100 transition-all mb-6"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 21 21"><path fill="#f25022" d="M1 1h9v9H1z" /><path fill="#00a4ef" d="M1 11h9v9H1z" /><path fill="#7fba00" d="M11 1h9v9H11z" /><path fill="#ffb900" d="M11 11h9v9H11z" /></svg>
                        Sign in with Microsoft
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-slate-400 text-sm">Or with local account</span>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>

                    {/* Local Login Form */}
                    <form onSubmit={handleLocalLogin} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-500 transition-all"
                        >
                            Log In
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
