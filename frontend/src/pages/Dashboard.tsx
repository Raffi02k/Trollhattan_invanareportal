import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    LayoutDashboard,
    FileText,
    ClipboardList,
    CreditCard,
    User as UserIcon,
    LogOut,
    ExternalLink,
    Bell,
    ChevronRight,
    Search
} from "lucide-react";
import { CaseList } from "../components";
import { DocumentCard } from "../components/DocumentCard";

type Tab = 'overview' | 'cases' | 'documents' | 'invoices' | 'profile';

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get("tab") as Tab) || "overview";

    const setActiveTab = (tab: Tab) => {
        setSearchParams({ tab });
    };
    const [portalData, setPortalData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    // Profile State
    const [profileEmail, setProfileEmail] = useState("");
    const [profilePhone, setProfilePhone] = useState("");
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [globalDocuments, setGlobalDocuments] = useState<any[]>([]);
    const [docsLoading, setDocsLoading] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const response = await fetch("http://localhost:4000/api/me", {
                    credentials: 'include'
                });
                const data = await response.json();
                setPortalData(data);
                setProfileEmail(data.email || "");
                setProfilePhone(data.phone_number || "");
            } catch (err) {
                console.error("Failed to fetch portal data", err);
            } finally {
                setLoading(false);
            }
        };
        const fetchDocs = async () => {
            setDocsLoading(true);
            try {
                const response = await fetch("http://localhost:4000/api/documents", {
                    credentials: 'include' // Ensure withCredentials is true
                });
                const data = await response.json();
                setGlobalDocuments(data);
            } catch (err) {
                console.error("Failed to fetch documents", err);
            } finally {
                setDocsLoading(false);
            }
        };

        if (user) {
            fetchMe();
            fetchDocs();
        } else {
            setLoading(false);
        }
    }, [user]);

    const tabs = [
        { id: 'overview', label: 'Översikt', icon: LayoutDashboard },
        { id: 'cases', label: 'Ärenden', icon: ClipboardList },
        { id: 'documents', label: 'Beslut & dokument', icon: FileText },
        { id: 'invoices', label: 'Fakturor', icon: CreditCard },
        { id: 'profile', label: 'Profil', icon: UserIcon },
    ];

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        setSaveSuccess(false);
        try {
            const response = await fetch("http://localhost:4000/api/me", {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email: profileEmail || null, phone_number: profilePhone || null })
            });
            if (response.ok) {
                const data = await response.json();
                setPortalData((prev: any) => ({ ...prev, ...data }));
                setIsEditingProfile(false);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch (err) {
            console.error("Failed to save profile", err);
        } finally {
            setIsSavingProfile(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-trollback-blue/20 border-t-trollback-blue"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans">
            {/* Top Navigation Bar */}
            <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-white border-b border-gray-200/80 py-4'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-5">
                        <img
                            src="https://www.trollhattan.se/templates/trollhattan/dist/images/logo.svg"
                            alt="Trollhättans Stad Logo"
                            className="h-9 hover:opacity-90 transition-opacity cursor-pointer"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/150x50/004B87/white?text=Trollhättan';
                            }}
                        />
                        <div className="h-8 w-[2px] bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
                        <span className="font-extrabold text-gray-800 tracking-tight text-lg">Mina sidor</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex bg-gray-100/80 p-1 rounded-full text-sm font-bold border border-gray-200/50">
                            <button className="px-5 py-2 rounded-full bg-white text-trollback-blue shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all">Privat</button>
                            <button className="px-5 py-2 rounded-full text-gray-500 hover:text-gray-800 transition-colors">Företag</button>
                        </div>

                        <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                            <a href="#" className="hidden sm:flex text-sm font-semibold text-gray-600 hover:text-trollback-blue items-center gap-1.5 transition-colors bg-gray-50 hover:bg-trollback-light-blue px-3 py-2 rounded-lg">
                                E-tjänster <ExternalLink className="w-4 h-4" />
                            </a>
                            <button onClick={logout} className="text-sm font-semibold text-gray-600 hover:text-red-600 flex items-center gap-1.5 transition-colors hover:bg-red-50 px-3 py-2 rounded-lg group">
                                Logga ut <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-trollback-dark via-trollback-blue to-[#0060ad] pt-32 pb-16 px-6 relative overflow-hidden mt-16 md:mt-0">
                {/* Abstract pattern overlay */}
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4NiIgaGVpZ2h0PSI0MyI+PGRlZnM+PHBhdHRlcm4gaWQ9InBhdHRlcm4iIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI4NiIgaGVpZ2h0PSI0MyI+PHBhdGggZD0iTTQzIDAuNUMzMC45MiAwLjUgMjEuOSA0LjM4IDExLjEyIDguMjUgMC4yMiAxMi4yNiAwIDIxLjUgMCAyMS41czguOCAyMiA0MyAyMnM0My0yMiA0My0yMi0wLjIyLTkuMjQtMTEuMTItMTMuMjVTMzAuOTIgMC41IDQzIDAuNXoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+')] mix-blend-overlay"></div>

                <div className="max-w-7xl mx-auto relative z-10 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm">
                        <UserIcon className="w-4 h-4" /> Privatperson
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                                Hej {portalData?.given_name || (portalData?.full_name ? portalData.full_name.split(' ')[0] : (user?.name || 'Välkommen'))}!
                            </h1>
                            <p className="text-blue-100 text-lg md:text-xl max-w-2xl font-light">
                                Här hittar du information om dina pågående och avslutade ärenden hos Trollhättans Stad.
                            </p>
                        </div>

                        {/* Quick Stats or Actions could go here */}
                        <div className="hidden lg:flex gap-4">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white text-center min-w-[120px]">
                                <div className="text-3xl font-black mb-1">0</div>
                                <div className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Nya meddelanden</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout Container */}
            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 pb-24">

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-64 shrink-0">
                        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-3 sticky top-24">
                            <ul className="space-y-1">
                                {tabs.map(tab => {
                                    const isActive = activeTab === tab.id;
                                    const Icon = tab.icon;
                                    return (
                                        <li key={tab.id}>
                                            <button
                                                onClick={() => setActiveTab(tab.id as Tab)}
                                                className={`
                                                    w-full flex items-center justify-between p-3 rounded-xl font-bold transition-all duration-200 group
                                                    ${isActive
                                                        ? 'bg-trollback-light-blue text-trollback-blue'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className={`w-5 h-5 ${isActive ? 'text-trollback-blue' : 'text-gray-400 group-hover:text-trollback-blue'}`} />
                                                    {tab.label}
                                                </div>
                                                {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>

                            <hr className="my-4 border-gray-100" />

                            <div className="px-3 pb-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Hjälp & Stöd</h4>
                                <a href="#" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-trollback-blue transition-colors mb-2">
                                    Så fungerar Mina sidor
                                </a>
                                <a href="https://www.trollhattan.se/startsida/kontakta-oss/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-trollback-blue transition-colors">
                                    Kontakta Kontaktcenter
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* Content Section */}
                    <main className="flex-1 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-10 min-h-[600px]">

                            {activeTab === 'overview' && (
                                <div className="space-y-8 animate-fade-in-up">
                                    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                                        <div>
                                            <h2 className="text-3xl font-black text-gray-900">Att göra</h2>
                                            <p className="text-gray-500 mt-1">Saker som kräver din uppmärksamhet.</p>
                                        </div>
                                    </header>

                                    <div className="p-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-dashed border-gray-300 text-center flex flex-col items-center justify-center">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                            <Bell className="w-10 h-10 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Inga nya händelser</h3>
                                        <p className="text-gray-500 max-w-sm">
                                            Du har inga ärenden som väntar på din hantering eller komplettering just nu.
                                        </p>
                                    </div>

                                    {/* Quick links card */}
                                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-6 rounded-2xl bg-trollback-light-blue/50 border border-trollback-blue/10 flex hover:bg-trollback-light-blue transition-colors cursor-pointer group">
                                            <div className="bg-white p-3 rounded-xl shadow-sm h-fit shrink-0">
                                                <Search className="w-6 h-6 text-trollback-blue" />
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="font-bold text-gray-900 group-hover:text-trollback-blue transition-colors">Hitta e-tjänst</h4>
                                                <p className="text-sm text-gray-600 mt-1">Sök bland alla våra e-tjänster och blanketter.</p>
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex hover:bg-gray-100 transition-colors cursor-pointer group">
                                            <div className="bg-white p-3 rounded-xl shadow-sm h-fit shrink-0">
                                                <UserIcon className="w-6 h-6 text-gray-600 group-hover:text-trollback-blue transition-colors" />
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="font-bold text-gray-900 group-hover:text-trollback-blue transition-colors">Dina uppgifter</h4>
                                                <p className="text-sm text-gray-600 mt-1">Se och hantera dina kontaktuppgifter.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'cases' && (
                                <div className="animate-fade-in-up">
                                    <CaseList />
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <div className="space-y-8 animate-fade-in-up max-w-3xl">
                                    <header className="border-b border-gray-100 pb-6">
                                        <h2 className="text-3xl font-black text-gray-900">Min Profil</h2>
                                        <p className="text-gray-500 mt-1">Här kan du se och uppdatera dina kontaktuppgifter.</p>
                                    </header>

                                    {saveSuccess && (
                                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="font-semibold">Dina uppgifter har sparats!</span>
                                        </div>
                                    )}

                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 md:p-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                                <UserIcon className="w-6 h-6 text-trollback-blue" />
                                                Personuppgifter
                                            </h3>
                                            {!isEditingProfile ? (
                                                <button
                                                    onClick={() => setIsEditingProfile(true)}
                                                    className="text-sm font-bold text-trollback-blue hover:text-trollback-dark transition-colors px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm"
                                                >
                                                    Redigera
                                                </button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setIsEditingProfile(false);
                                                            setProfileEmail(portalData?.email || "");
                                                            setProfilePhone(portalData?.phone_number || "");
                                                        }}
                                                        className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors px-4 py-2 border border-transparent"
                                                        disabled={isSavingProfile}
                                                    >
                                                        Avbryt
                                                    </button>
                                                    <button
                                                        onClick={handleSaveProfile}
                                                        className="text-sm font-bold text-white bg-trollback-blue hover:bg-trollback-dark transition-colors px-4 py-2 rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2"
                                                        disabled={isSavingProfile}
                                                    >
                                                        {isSavingProfile ? (
                                                            <>
                                                                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                                                Sparar...
                                                            </>
                                                        ) : 'Spara'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Namn</label>
                                                <div className="text-gray-900 font-medium text-lg">{portalData?.full_name || portalData?.username}</div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Personnummer</label>
                                                <div className="text-gray-900 font-medium text-lg">{portalData?.personnummer || 'Saknas'}</div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">PartyId (Tekniskt ID)</label>
                                                <div className="text-gray-900 font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block">{portalData?.party_id || 'Saknas'}</div>
                                            </div>

                                            <div className="md:col-span-2 pt-4 border-t border-gray-200"></div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">E-postadress</label>
                                                {isEditingProfile ? (
                                                    <input
                                                        type="email"
                                                        value={profileEmail}
                                                        onChange={(e) => setProfileEmail(e.target.value)}
                                                        className="w-full bg-white border border-trollback-blue focus:border-trollback-dark focus:ring-2 focus:ring-trollback-blue/20 rounded-xl px-4 py-2 text-gray-900 font-medium transition-all outline-none"
                                                        placeholder="t.ex. namn@exempel.se"
                                                    />
                                                ) : (
                                                    <div className="text-gray-900 font-medium text-lg">{portalData?.email || <span className="text-gray-400 italic">Ej angiven</span>}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Telefonnummer</label>
                                                {isEditingProfile ? (
                                                    <input
                                                        type="tel"
                                                        value={profilePhone}
                                                        onChange={(e) => setProfilePhone(e.target.value)}
                                                        className="w-full bg-white border border-trollback-blue focus:border-trollback-dark focus:ring-2 focus:ring-trollback-blue/20 rounded-xl px-4 py-2 text-gray-900 font-medium transition-all outline-none"
                                                        placeholder="t.ex. 070-123 45 67"
                                                    />
                                                ) : (
                                                    <div className="text-gray-900 font-medium text-lg">{portalData?.phone_number || <span className="text-gray-400 italic">Ej angivet</span>}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'documents' && (
                                <div className="space-y-8 animate-fade-in-up">
                                    <header className="border-b border-gray-100 pb-6">
                                        <h2 className="text-3xl font-black text-gray-900">Beslut & dokument</h2>
                                        <p className="text-gray-500 mt-1">Här hittar du alla dina officiella beslut och handlingar från staden.</p>
                                    </header>

                                    {docsLoading ? (
                                        <div className="py-20 text-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-trollback-blue/20 border-t-trollback-blue mx-auto mb-4"></div>
                                            <p className="text-gray-500 font-medium tracking-wide">Hämtar dina dokument...</p>
                                        </div>
                                    ) : globalDocuments.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {globalDocuments.map((doc: any) => (
                                                <DocumentCard key={doc.id} document={doc} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300 text-center flex flex-col items-center justify-center">
                                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                                <FileText className="w-10 h-10 text-gray-300" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">Inga dokument än</h3>
                                            <p className="text-gray-500 max-w-sm">
                                                När du får beslut eller handlingar i dina ärenden kommer de att dyka upp här.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'invoices' && (
                                <div className="h-[400px] flex flex-col items-center justify-center text-center animate-fade-in-up">
                                    <div className="w-24 h-24 bg-trollback-light-blue rounded-3xl rotate-3 flex items-center justify-center mx-auto mb-8 shadow-inner">
                                        {React.createElement(tabs.find(t => t.id === activeTab)?.icon || FileText, { className: "w-10 h-10 text-trollback-blue -rotate-3" })}
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 mb-4">Snart här!</h2>
                                    <p className="text-gray-500 max-w-md text-lg">
                                        Vi arbetar för fullt med att bygga denna del av portalen. Den kommer att bli tillgänglig i en framtida uppdatering.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className="mt-8 px-6 py-3 bg-white border-2 border-gray-200 font-bold text-gray-700 rounded-xl hover:border-trollback-blue hover:text-trollback-blue transition-colors"
                                    >
                                        Gå tillbaka till översikt
                                    </button>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                        <div className="lg:col-span-2">
                            <img
                                src="https://www.trollhattan.se/templates/trollhattan/dist/images/logo.svg"
                                className="h-10 mb-6"
                                alt="Trollhättans Stad Logo"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/150x50/004B87/white?text=Trollhättan';
                                }}
                            />
                            <p className="text-gray-500 leading-relaxed max-w-sm">
                                Mina sidor är en säker tjänst för dig som invånare i Trollhättan.
                                Här samlar vi dina e-tjänster och ärenden på ett och samma ställe.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">Besök oss</h4>
                            <ul className="space-y-3 text-gray-600">
                                <li className="font-medium">Stadshuset, Trollhättan</li>
                                <li>Gärdhemsvägen 9</li>
                                <li>461 83 Trollhättan</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">Kontakta oss</h4>
                            <ul className="space-y-3 text-gray-600">
                                <li>
                                    <strong className="block text-gray-900 mb-1">Telefon</strong>
                                    0520-49 50 00
                                </li>
                                <li>
                                    <strong className="block text-gray-900 mb-1">E-post</strong>
                                    <a href="mailto:kontaktcenter@trollhattan.se" className="text-trollback-blue hover:underline">kontaktcenter@trollhattan.se</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 py-6 border-t border-gray-100">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-medium">
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            <a href="#" className="hover:text-trollback-blue transition-colors">Om webbplatsen</a>
                            <a href="#" className="hover:text-trollback-blue transition-colors">Kakor (Cookies)</a>
                            <a href="#" className="hover:text-trollback-blue transition-colors">Tillgänglighet</a>
                            <a href="#" className="hover:text-trollback-blue transition-colors">Personuppgifter</a>
                        </div>
                        <p>&copy; {new Date().getFullYear()} Trollhättans Stad</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
