import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

export const LoginPage: React.FC = () => {
    const { loginOidc, isAuthenticated } = useAuth();
    const [imgError, setImgError] = useState(false);
    const [mobileImgError, setMobileImgError] = useState(false);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

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
                    <div className="animate-fade-in w-full max-w-md mx-auto">
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Välj inloggning</h2>
                        <p className="text-gray-500 mb-10">Hur vill du logga in idag?</p>

                        <div className="space-y-4">
                            <button
                                onClick={() => window.location.href = "http://localhost:4000/api/auth/saml/login"}
                                className="w-full group flex items-center p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-trollback-blue hover:shadow-[0_8px_30px_rgb(0,75,135,0.12)] hover:-translate-y-1 transition-all duration-300 text-left relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-trollback-light-blue to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-sm relative z-10 shrink-0 w-20 h-20 items-center justify-center overflow-hidden">
                                    <img
                                        src="/assets/BankID_logo.webp"
                                        alt="BankID"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement?.classList.add('bg-trollback-light-blue');
                                        }}
                                    />
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

                                <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-sm relative z-10 shrink-0 w-20 h-20 items-center justify-center overflow-hidden">
                                    <img
                                        src="/assets/angular-auth-logo.png"
                                        alt="OIDC Entra"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement?.classList.add('bg-gray-50');
                                        }}
                                    />
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

                        {/* [DEVELOPMENT ONLY] Dev Login Shortcut */}
                        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                            <p className="text-xs text-gray-400 mb-4 uppercase tracking-widest font-bold">Utveckling</p>
                            <div className="flex flex-col gap-2">
                                <a
                                    href="http://localhost:4000/api/auth/dev-login?pnr=199001019802"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-50 text-trollback-blue rounded-xl border border-gray-100 hover:border-trollback-blue hover:shadow-[0_8px_30px_rgb(0,75,135,0.12)] hover:-translate-y-1 transition-all duration-300 font-semibold text-sm group"
                                >
                                    Snabb-inloggning (Raffi)
                                    <ArrowRight className="w-4 h-4 ml-2 text-gray-400 group-hover:text-trollback-blue group-hover:translate-x-0.5 transition-all" />
                                </a>
                                <a
                                    href="http://localhost:4000/api/auth/dev-login?pnr=198001019804"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-trollback-light-blue/10 text-trollback-blue rounded-xl border border-trollback-blue/20 hover:border-trollback-blue hover:shadow-[0_8px_30px_rgb(0,75,135,0.12)] hover:-translate-y-1 transition-all duration-300 font-bold text-sm group"
                                >
                                    Snabb-inloggning (Gustav - Ny ID-test)
                                    <ArrowRight className="w-4 h-4 ml-2 text-gray-400 group-hover:text-trollback-blue group-hover:translate-x-0.5 transition-all" />
                                </a>
                            </div>
                        </div>

                        <div className="mt-8 text-center text-sm">
                            <a href="#" className="font-semibold text-trollback-blue hover:text-trollback-dark hover:underline transition-colors decoration-2 underline-offset-4">
                                Läs mer om hur vi hanterar personuppgifter
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 text-center w-full text-xs font-medium text-gray-400 z-0">
                &copy; {new Date().getFullYear()} Trollhättans Stad
            </div>
        </div>
    );
};
