import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, User, Building2, Lock, ChevronLeft } from "lucide-react";

export const LoginPage: React.FC = () => {
    const { loginLocal, loginOidc, isAuthenticated } = useAuth();
    const [view, setView] = useState<'selection' | 'local'>('selection');
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [mobileImgError, setMobileImgError] = useState(false);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleLocalLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        // Add a deliberate tiny delay for effect
        setTimeout(async () => {
            try {
                await loginLocal(username, password);
            } catch (err) {
                setError("Ogiltiga inloggningsuppgifter");
                setIsLoading(false);
            }
        }, 400);
    };

    return (
        <div className="min-h-screen bg-trollback-light-blue flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-trollback-blue/5 blur-[120px] mix-blend-multiply drop-shadow-lg" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-trollback-dark/5 blur-[150px] mix-blend-multiply drop-shadow-lg" />
            </div>

            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden z-10 animate-fade-in-up border border-white/50 backdrop-blur-sm">

                {/* Left Side: Branding Banner */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-trollback-dark to-trollback-blue p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
                    {/* Abstract water/river pattern overlay (Trollhättan theme) */}
                    <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4NiIgaGVpZ2h0PSI0MyI+PGRlZnM+PHBhdHRlcm4gaWQ9InBhdHRlcm4iIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI4NiIgaGVpZ2h0PSI0MyI+PHBhdGggZD0iTTQzIDAuNUMzMC45MiAwLjUgMjEuOSA0LjM4IDExLjEyIDguMjUgMC4yMiAxMi4yNiAwIDIxLjUgMCAyMS41czguOCAyMiA0MyAyMnM0My0yMiA0My0yMi0wLjIyLTkuMjQtMTEuMTItMTMuMjVTMzAuOTIgMC41IDQzIDAuNXoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+')] mix-blend-overlay"></div>

                    <div className="z-10 relative">
                        {imgError ? (
                            <div className="flex items-center gap-3 mb-8 text-white font-black tracking-widest uppercase text-3xl">
                                <span className="w-12 h-12 bg-white text-trollback-blue rounded-full flex items-center justify-center text-3xl shrink-0">T</span>
                                Trollhättan
                            </div>
                        ) : (
                            <img
                                src="https://www.trollhattan.se/templates/trollhattan/dist/images/logo.svg"
                                alt="Trollhättans Stad Logo"
                                className="h-14 mb-8 invert drop-shadow-md brightness-0"
                                onError={() => setImgError(true)}
                            />
                        )}
                        <h1 className="text-4xl font-black mb-4 leading-tight">Välkommen till<br />Mina sidor</h1>
                        <p className="text-blue-100 text-lg leading-relaxed max-w-sm">
                            Din personliga ingång till kommunens e-tjänster och ärenden. Säkert, enkelt och tillgängligt dygnet runt.
                        </p>
                    </div>

                    <div className="z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <ShieldCheck className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Säker inloggning</h4>
                                <p className="text-sm text-blue-100">Skyddat med e-legitimation</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Actions */}
                <div className="w-full md:w-7/12 p-8 md:p-16 bg-white flex flex-col justify-center relative">

                    {/* Mobile Logo */}
                    <div className="md:hidden flex justify-center mb-8">
                        {mobileImgError ? (
                            <div className="flex items-center gap-2 text-trollback-dark font-black tracking-widest uppercase text-xl">
                                <span className="w-8 h-8 bg-trollback-blue text-white rounded-full flex items-center justify-center text-xl shrink-0">T</span>
                                Trollhättan
                            </div>
                        ) : (
                            <img
                                src="https://www.trollhattan.se/templates/trollhattan/dist/images/logo.svg"
                                alt="Trollhättans Stad Logo"
                                className="h-12"
                                onError={() => setMobileImgError(true)}
                            />
                        )}
                    </div>

                    {view === 'selection' ? (
                        <div className="animate-fade-in w-full max-w-md mx-auto">
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Välj inloggning</h2>
                            <p className="text-gray-500 mb-10">Hur vill du logga in idag?</p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setView('local')}
                                    className="w-full group flex items-center p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-trollback-blue hover:shadow-[0_8px_30px_rgb(0,75,135,0.12)] hover:-translate-y-1 transition-all duration-300 text-left relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-trollback-light-blue to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <div className="flex bg-trollback-light-blue p-4 rounded-xl text-trollback-blue group-hover:bg-trollback-blue group-hover:text-white transition-colors duration-300 relative z-10 shrink-0">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div className="ml-5 flex-1 relative z-10">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-trollback-dark transition-colors">Privatperson</h3>
                                        <p className="text-sm text-gray-500 mt-1">Logga in med ditt personliga BankID</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center relative z-10 shadow-sm transition-colors duration-300">
                                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-trollback-blue transition-colors" />
                                    </div>
                                </button>

                                <button
                                    onClick={loginOidc}
                                    className="w-full group flex items-center p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-trollback-blue hover:shadow-[0_8px_30px_rgb(0,75,135,0.12)] hover:-translate-y-1 transition-all duration-300 text-left relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-trollback-light-blue to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <div className="flex bg-gray-50 p-4 rounded-xl text-gray-500 group-hover:bg-trollback-blue group-hover:text-white transition-colors duration-300 relative z-10 shrink-0">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div className="ml-5 flex-1 relative z-10">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-trollback-dark transition-colors">Tjänsteperson / Kommun</h3>
                                        <p className="text-sm text-gray-500 mt-1">Logga in internt med kommun-ID (OIDC)</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center relative z-10 shadow-sm transition-colors duration-300">
                                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-trollback-blue transition-colors" />
                                    </div>
                                </button>
                            </div>

                            <div className="mt-12 text-center text-sm">
                                <a href="#" className="font-semibold text-trollback-blue hover:text-trollback-dark hover:underline transition-colors decoration-2 underline-offset-4">
                                    Läs mer om hur vi hanterar personuppgifter
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-slide-in-right w-full max-w-md mx-auto">
                            <button
                                onClick={() => setView('selection')}
                                className="mb-8 flex items-center text-sm font-semibold text-gray-500 hover:text-trollback-blue transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-trollback-light-blue flex items-center justify-center mr-2 transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                </div>
                                Tillbaka
                            </button>

                            <h2 className="text-3xl font-black text-gray-900 mb-2">Logga in</h2>
                            <p className="text-gray-500 mb-8">Ange dina uppgifter för att fortsätta.</p>

                            <form onSubmit={handleLocalLogin} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Användarnamn</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="t.ex. raffi"
                                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white rounded-xl focus:ring-0 focus:border-trollback-blue outline-none transition-all font-medium text-gray-900 placeholder:font-normal placeholder:text-gray-400"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Lösenord</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white rounded-xl focus:ring-0 focus:border-trollback-blue outline-none transition-all font-medium text-gray-900 placeholder:font-normal placeholder:text-gray-400"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm font-semibold text-red-600 animate-fade-in flex items-start gap-2">
                                        <ShieldCheck className="w-5 h-5 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-trollback-blue text-white font-bold py-4 rounded-xl hover:bg-trollback-dark hover:shadow-lg hover:shadow-trollback-blue/20 focus:ring-4 focus:ring-trollback-light-blue transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                                >
                                    {isLoading ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Logga in"
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50 flex gap-4 items-start">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-blue-50 shrink-0">
                                    <ShieldCheck className="w-5 h-5 text-trollback-blue" />
                                </div>
                                <div className="text-sm text-blue-900 leading-relaxed">
                                    <strong>Testmiljö:</strong> Använd username <code className="bg-white px-1.5 py-0.5 rounded border border-blue-100 font-mono text-trollback-blue shadow-sm">raffi</code> och lösenord <code className="bg-white px-1.5 py-0.5 rounded border border-blue-100 font-mono text-trollback-blue shadow-sm">password123</code>.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="absolute bottom-6 text-center w-full text-xs font-medium text-gray-400 z-0">
                &copy; {new Date().getFullYear()} Trollhättans Stad
            </div>
        </div>
    );
};
