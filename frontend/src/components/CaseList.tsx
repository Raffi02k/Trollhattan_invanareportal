import React, { useState, useEffect } from "react";
import {
    Clock,
    ChevronRight,
    FileText,
    Calendar,
    AlertCircle,
    ArrowLeft,
    MessageSquare,
    Paperclip,
    Send,
    Upload
} from "lucide-react";
import { DocumentCard } from "./DocumentCard";
import { useAuth } from "../context/AuthContext";

interface Document {
    id: string;
    filename: string;
    type: string;
    created: string;
    linked_to?: string;
}

interface Message {
    id: string;
    sender: string;
    sender_role: string;
    content: string;
    created: string;
}

interface Case {
    caseId: string;
    flowInstanceId: string;
    title: string;
    status: string;
    externalStatus: string;
    system: string;
    created: string;
    updated: string;
    documents: Document[];
    messages: Message[];
}

export const CaseList: React.FC = () => {
    const { user } = useAuth();
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCase, setSelectedCase] = useState<Case | null>(null);
    const [activeCaseTab, setActiveCaseTab] = useState<'timeline' | 'documents' | 'messages'>('timeline');
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const response = await fetch("http://localhost:4000/api/cases", {
                    credentials: 'include'
                });
                if (!response.ok) throw new Error("Failed to fetch cases");
                const data = await response.json();
                setCases(data);
            } catch (err) {
                setError("Kunde inte hämta dina ärenden just nu.");
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchCases();
    }, [user]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedCase) return;
        setIsSending(true);
        try {
            const response = await fetch(`http://localhost:4000/api/cases/${selectedCase.caseId}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify({ content: newMessage })
            });
            if (response.ok) {
                const sentMsg = await response.json();
                setSelectedCase({
                    ...selectedCase,
                    messages: [...(selectedCase.messages || []), sentMsg]
                });
                setNewMessage("");
            }
        } catch (err) {
            console.error("Failed to send message", err);
        } finally {
            setIsSending(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !selectedCase) return;

        setIsUploading(true);
        const file = files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`http://localhost:4000/api/cases/${selectedCase.caseId}/documents`, {
                method: "POST",
                credentials: 'include',
                body: formData
            });

            if (response.ok) {
                const newDoc = await response.json();
                setSelectedCase({
                    ...selectedCase,
                    documents: [newDoc, ...(selectedCase.documents || [])]
                });
            } else {
                alert("Kunde inte ladda upp dokumentet.");
            }
        } catch (err) {
            console.error("Upload failed", err);
            alert("Ett fel uppstod vid uppladdning.");
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    const ongoingCases = cases.filter(c => c.status !== 'Avslutad');
    const completedCases = cases.filter(c => c.status === 'Avslutad');

    if (loading) return <div className="p-8 text-center text-gray-500">Hämtar ärenden...</div>;
    if (error) return (
        <div className="p-6 bg-red-50 text-red-700 rounded-lg flex gap-3 items-center border border-red-100">
            <AlertCircle className="w-5 h-5" />
            {error}
        </div>
    );

    if (selectedCase) {
        // Generate mock events for the timeline based on case data
        const events = [
            {
                date: new Date(selectedCase.created).toLocaleDateString('sv-SE'),
                title: "Ansökan mottagen",
                description: "Din ansökan har tagits emot och registrerats i vårt system.",
                isDone: true
            }
        ];

        if (selectedCase.status !== "Ny") {
            const upDate = new Date(selectedCase.updated);
            const midDate = new Date(new Date(selectedCase.created).getTime() + (upDate.getTime() - new Date(selectedCase.created).getTime()) / 2);

            events.push({
                date: midDate.toLocaleDateString('sv-SE'),
                title: "Handläggning påbörjad",
                description: "En handläggare har tilldelats ditt ärende och påbörjat granskningen.",
                isDone: true
            });
            events.push({
                date: upDate.toLocaleDateString('sv-SE'),
                title: selectedCase.externalStatus,
                description: selectedCase.status === 'Avslutad' ? "Ditt ärende är nu avslutat. Se under fliken Dokument för eventuella beslut." : "Vi har uppdaterat statusen på ditt ärende enligt ovanstående. Vid eventuella frågor, kontakta kontaktcenter.",
                isDone: selectedCase.status === 'Avslutad'
            });
        }

        return (
            <div className="animate-fade-in-up">
                <button
                    onClick={() => setSelectedCase(null)}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-trollback-blue transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Tillbaka till ärenden
                </button>

                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 px-6 py-8 md:p-12 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-trollback-light-blue rounded-full blur-[80px] opacity-40 -mr-20 -mt-20 pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10 mb-8">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">{selectedCase.title}</h2>
                            <p className="text-gray-600 md:text-lg max-w-2xl leading-relaxed">
                                {selectedCase.title.toLowerCase().includes('bygglov')
                                    ? "Ansökan om bygglov för tillbyggnad av enbostadshus på fastigheten Trollhättan 5:42."
                                    : "Ärende inkommet via digitala tjänster för Trollhättans Stad."}
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full font-bold text-sm shrink-0 shadow-sm border ${selectedCase.status === 'Avslutad' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-trollback-blue text-white border-trollback-dark'}`}>
                            {selectedCase.status === 'Avslutad' ? 'Avslutad' : 'Under handläggning'}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-medium text-gray-500 mb-10 pb-8 border-b border-gray-100 relative z-10">
                        <span className="flex items-center gap-2">
                            <span className="text-gray-400">Referens:</span>
                            <span className="text-gray-900 bg-gray-50 px-2 py-1 rounded-md font-bold">BN-{new Date(selectedCase.created).getFullYear()}-{selectedCase.caseId.substring(0, 6)}</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="text-gray-400">System:</span>
                            <span className="text-gray-900 font-bold">{selectedCase.system}</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="text-gray-400">Skapad:</span>
                            <span className="text-gray-900 font-bold">{new Date(selectedCase.created).toLocaleDateString('sv-SE')}</span>
                        </span>
                    </div>

                    {/* Tabs area */}
                    <div className="flex gap-8 border-b border-gray-100 mb-10 relative z-10 overflow-x-auto pb-[2px]">
                        <button
                            onClick={() => setActiveCaseTab('timeline')}
                            className={`pb-4 font-bold border-b-[3px] flex items-center gap-2 shrink-0 transition-colors ${activeCaseTab === 'timeline' ? 'text-trollback-blue border-trollback-blue' : 'text-gray-400 hover:text-gray-700 border-transparent'}`}
                        >
                            <Clock className="w-5 h-5" /> Tidslinje
                        </button>
                        <button
                            onClick={() => setActiveCaseTab('documents')}
                            className={`pb-4 font-bold border-b-[3px] flex items-center gap-2 shrink-0 transition-colors ${activeCaseTab === 'documents' ? 'text-trollback-blue border-trollback-blue' : 'text-gray-400 hover:text-gray-700 border-transparent'}`}
                        >
                            <Paperclip className="w-5 h-5" /> Dokument
                        </button>
                        <button
                            onClick={() => setActiveCaseTab('messages')}
                            className={`pb-4 font-bold border-b-[3px] flex items-center gap-2 shrink-0 transition-colors ${activeCaseTab === 'messages' ? 'text-trollback-blue border-trollback-blue' : 'text-gray-400 hover:text-gray-700 border-transparent'}`}
                        >
                            <MessageSquare className="w-5 h-5" /> Meddelanden
                        </button>
                    </div>

                    {/* Timeline */}
                    {activeCaseTab === 'timeline' && (
                        <div className="relative pl-1 md:pl-6 py-4 z-10 animate-fade-in-up">
                            <div className="absolute left-[13px] md:left-[33px] top-6 bottom-6 w-[2px] bg-gray-100"></div>

                            <div className="space-y-10">
                                {events.map((event, index) => (
                                    <div key={index} className="relative flex items-start gap-6 md:gap-10 group">
                                        <div className={`absolute -left-[3px] md:-left-1.5 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border-[3px] z-10 bg-white transition-colors duration-300 ${event.isDone ? 'border-trollback-blue' : 'border-gray-200'}`}>
                                            <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${event.isDone ? 'bg-trollback-blue' : 'bg-transparent'}`}></div>
                                        </div>
                                        <div className="pl-12 w-full max-w-3xl">
                                            <div className="bg-white group-hover:bg-gray-50 transition-colors p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <time className="text-xs font-black text-gray-400 uppercase tracking-wider">{event.date}</time>
                                                    {!event.isDone && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-trollback-blue opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-trollback-blue"></span></span>}
                                                </div>
                                                <h4 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{event.title}</h4>
                                                <p className="text-gray-600 leading-relaxed">{event.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Documents */}
                    {activeCaseTab === 'documents' && (
                        <div className="space-y-6 relative z-10 animate-fade-in-up">
                            {/* Upload Section */}
                            <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl p-6 transition-all hover:bg-gray-50 hover:border-trollback-blue/30 group">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className={`w-6 h-6 ${isUploading ? 'text-gray-400 animate-bounce' : 'text-trollback-blue'}`} />
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-1">Ladda upp dokument</h4>
                                    <p className="text-sm text-gray-500 mb-4 max-w-xs">
                                        Behöver du komplettera ditt ärende? Ladda upp bilagor eller intyg här.
                                    </p>

                                    <label className={`cursor-pointer bg-white border border-gray-200 px-6 py-2.5 rounded-lg text-sm font-bold text-gray-700 hover:border-trollback-blue hover:text-trollback-blue transition-all shadow-sm flex items-center gap-2 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                            disabled={isUploading}
                                        />
                                        {isUploading ? 'Laddar upp...' : 'Välj fil'}
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selectedCase.documents && selectedCase.documents.length > 0 ? (
                                    selectedCase.documents.map((doc) => (
                                        <DocumentCard
                                            key={doc.id}
                                            document={doc}
                                            onDelete={(id) => {
                                                setSelectedCase({
                                                    ...selectedCase,
                                                    documents: selectedCase.documents.filter(d => d.id !== id)
                                                });
                                            }}
                                        />
                                    ))
                                ) : (
                                    <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <Paperclip className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="font-medium">Inga dokument hittades på detta ärende.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {activeCaseTab === 'messages' && (
                        <div className="space-y-6 relative z-10 animate-fade-in-up max-w-4xl">
                            {/* Message history */}
                            <div className="space-y-4">
                                {(selectedCase.messages && selectedCase.messages.length > 0) ? (
                                    selectedCase.messages.map((msg) => (
                                        <div key={msg.id} className="bg-white border border-gray-100 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
                                            <div className={`p-6 ${msg.sender_role === 'Sökande' ? 'border-l-4 border-l-trollback-blue' : 'bg-gray-50/50'}`}>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                                    <span className={msg.sender_role !== 'Sökande' ? 'text-trollback-dark' : 'text-trollback-blue'}>
                                                        {msg.sender_role}: {msg.sender}
                                                    </span>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span>{new Date(msg.created).toLocaleDateString('sv-SE', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-gray-900 leading-relaxed font-medium text-[15px]">
                                                    {msg.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="font-medium">Inga meddelanden har skickats i detta ärende.</p>
                                    </div>
                                )}
                            </div>

                            {/* Message input */}
                            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] mt-8">
                                <h4 className="font-bold text-gray-900 mb-4">Skicka meddelande</h4>
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 focus:border-trollback-blue focus:ring-2 focus:ring-trollback-blue/20 outline-none transition-all resize-none mb-4"
                                    placeholder="Skriv ditt meddelande..."
                                    disabled={isSending}
                                ></textarea>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={isSending || !newMessage.trim()}
                                        className="bg-trollback-dark text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-trollback-blue transition-colors shadow-md disabled:opacity-50"
                                    >
                                        {isSending ? (
                                            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        {isSending ? 'Skickar...' : 'Skicka'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}



                </div>
            </div>
        );
    }

    const CaseItem = ({ item }: { item: Case }) => (
        <div
            onClick={() => setSelectedCase(item)}
            className="group border border-gray-100 rounded-xl mb-3 hover:border-trollback-blue/30 hover:shadow-[0_4px_20px_rgb(0,75,135,0.08)] bg-white transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-0.5"
        >
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-4 sm:gap-5 items-start">
                    <div className={`p-3 rounded-2xl shrink-0 transition-colors duration-300 ${item.status === 'Avslutad' ? 'bg-green-50 group-hover:bg-green-100' : 'bg-trollback-light-blue group-hover:bg-trollback-blue/10'}`}>
                        <FileText className={`w-6 h-6 ${item.status === 'Avslutad' ? 'text-green-600' : 'text-trollback-blue'}`} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-trollback-blue transition-colors duration-200">
                            {item.title}
                        </h3>
                        <div className="flex flex-wrap gap-y-2 gap-x-5 mt-2.5 text-sm font-medium text-gray-500">
                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className={item.status === 'Avslutad' ? 'text-green-700' : 'text-trollback-dark'}>{item.externalStatus}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                Uppdaterad {new Date(item.updated).toLocaleDateString('sv-SE')}
                            </span>
                            <span className="text-gray-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                {item.system}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end sm:justify-start">
                    <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-trollback-light-blue flex items-center justify-center transition-colors duration-300">
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-trollback-blue group-hover:translate-x-0.5 transition-all" />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-12">
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-3xl font-bold">Dina ärenden</h2>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    Pågående
                    <span className="bg-trollback-blue text-white text-xs px-2 py-0.5 rounded-full font-black">
                        {ongoingCases.length}
                    </span>
                </h3>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                    {ongoingCases.length > 0 ? (
                        ongoingCases.map(c => <CaseItem key={c.caseId} item={c} />)
                    ) : (
                        <div className="p-10 text-center text-gray-500 bg-gray-50/50">
                            Det finns inga pågående ärenden.
                        </div>
                    )}
                </div>
            </section>

            <section>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    Avslutade
                    <span className="bg-gray-400 text-white text-xs px-2 py-0.5 rounded-full font-black">
                        {completedCases.length}
                    </span>
                </h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                    {completedCases.length > 0 ? (
                        completedCases.map(c => <CaseItem key={c.caseId} item={c} />)
                    ) : (
                        <div className="p-10 text-center text-gray-500 bg-gray-50/50">
                            Det finns inga avslutade ärenden.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};
