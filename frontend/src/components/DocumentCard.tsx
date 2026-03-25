import React, { useState } from 'react';
import { FileText, Download, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PortalDocument {
    id: string;
    filename: string;
    type: string;
    created: string;
    linked_to?: string;
}

interface DocumentCardProps {
    document: PortalDocument;
    onDelete?: (id: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document: docData, onDelete }) => {
    const { user } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDownload = async () => {
        try {
            if (!user?.token) {
                alert("Du måste vara inloggad för att hämta dokument.");
                return;
            }

            const response = await fetch(`http://localhost:8000/api/documents/${docData.id}/download`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Sessionen har gått ut. Logga in igen.");
                }
                throw new Error("Nedladdning misslyckades");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = window.document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = docData.filename;
            window.document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("Failed to download document", err);
            alert(err.message || "Kunde inte hämta dokumentet. Kontrollera din anslutning.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Är du säker på att du vill ta bort "${docData.filename}"?`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`http://localhost:8000/api/documents/${docData.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });

            if (!response.ok) {
                throw new Error("Kunde inte ta bort dokumentet.");
            }

            if (onDelete) {
                onDelete(docData.id);
            }
        } catch (err: any) {
            console.error("Delete failed", err);
            alert(err.message || "Ett fel uppstod vid borttagning.");
        } finally {
            setIsDeleting(false);
        }
    };

    const isUploadedFile = docData.id.startsWith("upload-");

    return (
        <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-trollback-blue" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 leading-tight mb-1 group-hover:text-trollback-blue transition-colors">
                        {docData.filename}
                    </h4>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-trollback-blue bg-trollback-light-blue px-2 py-0.5 rounded-md uppercase tracking-wide">
                            {docData.type}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                            {new Date(docData.created).toLocaleDateString('sv-SE')}
                        </span>
                        {docData.linked_to && (
                            <span className="text-xs text-gray-400 font-medium border-l border-gray-200 pl-2">
                                Kopplat till: {docData.linked_to}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {isUploadedFile && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Ta bort dokument"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                )}
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 hover:text-trollback-blue hover:bg-trollback-light-blue rounded-lg transition-all"
                >
                    <Download className="w-4 h-4" />
                    <span>Hämta</span>
                </button>
            </div>
        </div>
    );
};
