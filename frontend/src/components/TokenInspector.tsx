import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Bug } from "lucide-react";

export const TokenInspector: React.FC = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-indigo-600 p-3 rounded-full shadow-lg hover:bg-indigo-500 transition-colors"
                title="Inspect Claims"
            >
                <Bug className="w-6 h-6 text-white" />
            </button>

            {isOpen && (
                <div className="absolute bottom-16 right-0 w-96 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-4 overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-slate-200">Current User Claims</h3>
                        <span className="text-xs text-slate-400 uppercase tracking-wider">{user.authMethod}</span>
                    </div>
                    <pre className="text-xs text-green-400 bg-slate-900 p-2 rounded overflow-auto max-h-96">
                        {JSON.stringify(user, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};
