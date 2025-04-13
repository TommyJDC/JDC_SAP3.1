import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM for createPortal
// Use ~ alias for imports relative to the app root
import useGeminiSummary from '~/hooks/useGeminiSummary';
import { updateSAPTICKET } from '~/services/firestore.service';
import ReactMarkdown from 'react-markdown';
import { FaSpinner } from 'react-icons/fa';
import type { SapTicket } from '~/types/firestore.types'; // Import the central type
import { Timestamp } from 'firebase/firestore'; // Import Timestamp
// Import the date utility functions
import { parseFrenchDate, formatDateForDisplay } from '~/utils/dateUtils';

interface TicketSAPDetailsProps {
    ticket: SapTicket | null;
    onClose: () => void;
    sectorId: string; // Sector ID is crucial for updating the correct document
    onTicketUpdated: () => void; // Callback to refresh list after update
}

// Function to determine the initial status for SAP tickets
// Adapt this based on actual SAP statuses
const getInitialSAPStatus = (ticket: SapTicket | null): string => {
    // Use the statutSAP field from the central type
    if (!ticket?.statutSAP) {
        return 'Nouveau'; // Default status
    }
    return ticket.statutSAP;
};

// Define badge classes based on SAP status (adjust as needed)
const getSAPStatusBadgeClass = (status: string): string => {
    switch (status?.toLowerCase()) {
        case 'nouveau': return 'badge-info';
        case 'en cours': return 'badge-primary';
        case 'terminé': return 'badge-success'; // Corrected typo
        case 'annulé': return 'badge-error';
        // Add other SAP-specific statuses and their corresponding badge styles
        default: return 'badge-ghost';
    }
};

// Gemini API Key provided by the user
const GEMINI_API_KEY = "AIzaSyAZqeCNWSWu1D4iFthrCW7sx9Ky2jlqoUg";

const TicketSAPDetails: React.FC<TicketSAPDetailsProps> = ({ ticket, onClose, sectorId, onTicketUpdated }) => {
    const [newComment, setNewComment] = useState<string>('');
    const [currentStatus, setCurrentStatus] = useState<string>('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);
    const [commentError, setCommentError] = useState<string | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [isAddingComment, setIsAddingComment] = useState<boolean>(false);

    // --- AI Summary ---
    // Use descriptionProbleme if available, otherwise fall back to description
    const problemDescriptionForAI = ticket?.descriptionProbleme || ticket?.description || '';
    const summaryPrompt = useMemo(() => {
        if (!problemDescriptionForAI || ticket?.summary) return '';
        return `Résume ce problème SAP en 1 ou 2 phrases maximum, en français: ${problemDescriptionForAI}`;
    }, [ticket?.id, problemDescriptionForAI, ticket?.summary]);

    const {
        summary: generatedSummary,
        isLoading: isSummaryLoading,
        error: summaryError,
        generateSummary: triggerSummaryGeneration
    } = useGeminiSummary(GEMINI_API_KEY); // Pass API Key to the hook

    // --- AI Solution ---
    const solutionPrompt = useMemo(() => {
        if (!problemDescriptionForAI || ticket?.solution) return '';
         return `Propose une solution concise (1-2 phrases), en français, pour ce problème SAP: ${problemDescriptionForAI}`;
    }, [ticket?.id, problemDescriptionForAI, ticket?.solution]);

    const {
        summary: generatedSolution,
        isLoading: isSolutionLoading,
        error: solutionError,
        generateSummary: triggerSolutionGeneration
    } = useGeminiSummary(GEMINI_API_KEY); // Pass API Key to the hook

    // --- Effects ---

    // Initialize/Update status and trigger AI generation
    useEffect(() => {
        console.log("TicketSAPDetails Effect: Running for ticket:", ticket?.id);
        if (ticket) {
            setCurrentStatus(getInitialSAPStatus(ticket));
            // Trigger AI generation only if needed
            if (summaryPrompt) {
                console.log("TicketSAPDetails Effect: Triggering SUMMARY generation with prompt:", summaryPrompt);
                triggerSummaryGeneration(summaryPrompt);
            } else {
                 console.log("TicketSAPDetails Effect: Skipping SUMMARY generation (prompt empty or summary exists).");
            }
            if (solutionPrompt) {
                console.log("TicketSAPDetails Effect: Triggering SOLUTION generation with prompt:", solutionPrompt);
                triggerSolutionGeneration(solutionPrompt);
            } else {
                 console.log("TicketSAPDetails Effect: Skipping SOLUTION generation (prompt empty or solution exists).");
            }
        } else {
            console.log("TicketSAPDetails Effect: No ticket, resetting status.");
            setCurrentStatus('');
        }
        // Clear errors when ticket changes
        setStatusUpdateError(null);
        setCommentError(null);
        setUpdateError(null);
        setNewComment('');
    }, [ticket, summaryPrompt, solutionPrompt, triggerSummaryGeneration, triggerSolutionGeneration]);

    // Save generated summary to Firestore (or your backend)
    useEffect(() => {
        const saveSummary = async () => {
            // Only save if summary was generated, exists, and wasn't already present
            if (generatedSummary && ticket?.id && !ticket.summary) {
                setUpdateError(null);
                try {
                    console.log(`Attempting to save generated SAP summary for ticket ${ticket.id} in sector ${sectorId}:`, generatedSummary);
                    // Use the specific update function for SAP tickets
                    await updateSAPTICKET(sectorId, ticket.id, { summary: generatedSummary });
                    onTicketUpdated();
                } catch (error: any) {
                    console.error("Error saving SAP summary:", error);
                    setUpdateError(`Erreur sauvegarde résumé SAP: ${error.message}`);
                }
            }
        };
        saveSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generatedSummary, sectorId, ticket?.id]); // Depend on generatedSummary, sectorId, and ticket ID

    // Save generated solution to Firestore (or your backend)
    useEffect(() => {
        const saveSolution = async () => {
             // Only save if solution was generated, exists, and wasn't already present
            if (generatedSolution && ticket?.id && !ticket.solution) {
                setUpdateError(null);
                try {
                    console.log(`Attempting to save generated SAP solution for ticket ${ticket.id} in sector ${sectorId}:`, generatedSolution);
                     // Use the specific update function for SAP tickets
                    await updateSAPTICKET(sectorId, ticket.id, { solution: generatedSolution });
                    onTicketUpdated();
                } catch (error: any) {
                    console.error("Error saving SAP solution:", error);
                    setUpdateError(`Erreur sauvegarde solution SAP: ${error.message}`);
                }
            }
        };
        saveSolution();
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generatedSolution, sectorId, ticket?.id]); // Depend on generatedSolution, sectorId, and ticket ID

    // --- Handlers ---

    const handleAddComment = async () => {
        if (newComment.trim() && sectorId && ticket?.id) {
            setIsAddingComment(true);
            setCommentError(null);
            const updatedComments = [newComment, ...(ticket.commentaires || [])];
            try {
                // Use the specific update function for SAP tickets
                await updateSAPTICKET(sectorId, ticket.id, { commentaires: updatedComments });
                setNewComment('');
                onTicketUpdated();
            } catch (error: any) {
                setCommentError(`Erreur ajout commentaire SAP: ${error.message}`);
            } finally {
                setIsAddingComment(false);
            }
        }
    };

    const handleStatusChange = async () => {
        // Only update if status changed and ticket exists
        if (sectorId && ticket?.id && currentStatus && currentStatus !== ticket?.statutSAP) {
            setIsUpdatingStatus(true);
            setStatusUpdateError(null);
            try {
                 // Use the specific update function for SAP tickets
                await updateSAPTICKET(sectorId, ticket.id, { statutSAP: currentStatus });
                onTicketUpdated();
            } catch (error: any) {
                setStatusUpdateError(`Erreur MàJ statut SAP: ${error.message}`);
                // Revert optimistic update on error
                setCurrentStatus(getInitialSAPStatus(ticket));
            } finally {
                setIsUpdatingStatus(false);
            }
        }
    };

    if (!ticket) {
        return null;
    }

    // Determine what to display (existing or newly generated)
    const displaySummary = ticket?.summary || generatedSummary;
    const displaySolution = ticket?.solution || generatedSolution;

    // --- Portal Logic ---
    // Need to ensure this only runs client-side where document is available
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    // The actual modal JSX
    const modalContent = (
        // Outer container: Fixed position, full screen, z-index, flex center
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
            {/* Modal Content Box: Max width, relative positioning, background, text color, rounded */}
            <div className="w-11/12 max-w-3xl relative bg-jdc-card text-jdc-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto p-6"> {/* Added padding */}
                {/* Close Button: Absolute positioning top-right */}
                <button
                    onClick={onClose} // Keep existing close handler
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10"
                    aria-label="Fermer"
                >
                    ✕
                </button>

                {/* Header */}
                <h3 className="font-bold text-xl mb-1">{ticket.raisonSociale || 'Client Inconnu'}</h3>
                <p className="text-sm text-gray-400 mb-4">Ticket SAP: {ticket.numeroSAP || 'N/A'}</p>

                {/* Ticket Info Grid - Adjust fields based on SAPTicket interface */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 py-4 text-sm border-t border-b border-gray-700">
                    <p><b>Code Client:</b> {ticket.codeClient || 'N/A'}</p>
                    <p><b>Téléphone:</b> {ticket.telephone || 'N/A'}</p>
                    <p className="md:col-span-2"><b>Adresse:</b> {ticket.adresse || 'N/A'}</p>
                    {/* Use the utility functions to parse and format the date */}
                    <p><b>Date Création:</b> {formatDateForDisplay(parseFrenchDate(ticket.date))}</p>
                    <p><b>Secteur:</b> <span className="badge badge-neutral">{ticket.secteur || 'N/A'}</span></p>
                    {/* Use the 'deducedSalesperson' field */}
                    {ticket.deducedSalesperson && (
                        <p><b>Commercial:</b> {ticket.deducedSalesperson}</p>
                    )}
                </div>

                {/* Status Update Section - Adapt options based on SAP statuses */}
                <div className="my-4">
                    <label htmlFor="sap-ticket-status-select" className="block text-sm font-medium text-gray-300 mb-1">Statut SAP</label>
                    <div className="flex items-center gap-2">
                        <select
                            id="sap-ticket-status-select"
                            className="select select-bordered select-sm w-full max-w-xs bg-jdc-gray"
                            value={currentStatus}
                            onChange={(e) => setCurrentStatus(e.target.value)}
                            disabled={isUpdatingStatus}
                        >
                            {/* Add relevant SAP status options here */}
                            <option value="Nouveau">Nouveau</option>
                            <option value="En cours">En cours</option>
                            <option value="En attente client">En attente client</option>
                            <option value="Résolu">Résolu</option>
                            <option value="Terminé">Terminé</option>
                            <option value="Annulé">Annulé</option>
                        </select>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleStatusChange}
                            disabled={isUpdatingStatus || currentStatus === ticket?.statutSAP}
                        >
                            {isUpdatingStatus ? <FaSpinner className="animate-spin" /> : 'Mettre à jour'}
                        </button>
                        <span className={`badge ${getSAPStatusBadgeClass(currentStatus)} ml-auto`}>{currentStatus}</span>
                    </div>
                    {statusUpdateError && <p className="text-error text-xs mt-1">{statusUpdateError}</p>}
                </div>
                <hr className="my-3 border-gray-700"/>

                {/* AI Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* AI Summary */}
                    <div>
                        <h4 className="text-md font-semibold mb-1 text-blue-300">Résumé IA</h4>
                        {isSummaryLoading && <span className="loading loading-dots loading-sm"></span>}
                        {summaryError && !displaySummary && <p className="text-error text-xs">Erreur résumé: {summaryError}</p>}
                        {displaySummary ? (
                            <div className="prose prose-sm max-w-none text-gray-300"><ReactMarkdown>{displaySummary}</ReactMarkdown></div>
                        ) : !isSummaryLoading && !summaryError ? (
                            <p className="text-xs text-gray-500 italic">Aucun résumé généré.</p>
                        ) : null}
                        {updateError && updateError.includes("résumé") && <p className="text-error text-xs mt-1">{updateError}</p>}
                    </div>

                    {/* AI Solution */}
                    <div>
                        <h4 className="text-md font-semibold mb-1 text-green-300">Solution Proposée IA</h4>
                        {isSolutionLoading && <span className="loading loading-dots loading-sm"></span>}
                        {solutionError && !displaySolution && <p className="text-error text-xs">Erreur solution: {solutionError}</p>}
                        {displaySolution ? (
                            <div className="prose prose-sm max-w-none text-gray-300"><ReactMarkdown>{displaySolution}</ReactMarkdown></div>
                        ) : !isSolutionLoading && !solutionError ? (
                            <p className="text-xs text-gray-500 italic">Aucune solution générée.</p>
                        ) : null}
                        {updateError && updateError.includes("solution") && <p className="text-error text-xs mt-1">{updateError}</p>}
                    </div>
                </div>
                <hr className="my-3 border-gray-700"/>

                {/* Original SAP Problem Description */}
                <details className="mb-3 text-sm">
                    <summary className="cursor-pointer font-medium text-gray-400 hover:text-jdc-white">Voir la description du problème SAP</summary>
                    <div className="mt-2 p-3 border border-gray-600 rounded bg-jdc-gray text-xs max-h-32 overflow-y-auto">
                        {/* Using 'descriptionProbleme' or fallback to 'description' */}
                        <pre className="whitespace-pre-wrap break-words font-mono">{ticket.descriptionProbleme || ticket.description || 'N/A'}</pre>
                    </div>
                </details>
                <hr className="my-3 border-gray-700"/>

                {/* Comments Section */}
                <div>
                    <h4 className="text-md font-semibold mb-2">Commentaires</h4>
                    <div className="max-h-40 overflow-y-auto mb-3 border border-gray-600 rounded p-3 bg-jdc-gray text-sm space-y-2">
                        {ticket.commentaires && ticket.commentaires.length > 0 ? (
                            ticket.commentaires.map((commentaire: string, index: number) => (
                                <p key={index} className="border-b border-gray-700 pb-1 mb-1">{commentaire}</p>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 italic">Aucun commentaire.</p>
                        )}
                    </div>
                    <textarea
                        placeholder="Ajouter un commentaire..."
                        className="textarea textarea-bordered w-full text-sm bg-jdc-gray"
                        rows={2}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={isAddingComment}
                    ></textarea>
                    <button
                        className="btn btn-secondary btn-sm mt-2"
                        onClick={handleAddComment}
                        disabled={isAddingComment || !newComment.trim()}
                    >
                        {isAddingComment ? <FaSpinner className="animate-spin" /> : 'Ajouter Commentaire'}
                    </button>
                    {commentError && <p className="text-error text-xs mt-1">{commentError}</p>}
                </div>
                {/* Removed modal-box specific padding/margins if any, handled by the container */}
            </div>
            {/* Click outside to close - Handled by the outer fixed container click (optional, can be added) */}
            {/* We can add an onClick handler to the outer div if needed:
               <div className="fixed inset-0 z-50 ... " onClick={onClose}>
                 <div className="w-11/12 max-w-3xl ... " onClick={(e) => e.stopPropagation()}> // Prevent closing when clicking inside the box
                   ... content ...
                 </div>
               </div>
            */}
        </div>
    );

    // Render into the portal target only on the client-side
    if (!isClient) {
        return null; // Render nothing server-side or before hydration
    }

    const portalRoot = document.getElementById('modal-root');
    if (!portalRoot) {
        console.error("Modal root element #modal-root not found in the DOM.");
        return null; // Don't render if target doesn't exist
    }

    return ReactDOM.createPortal(modalContent, portalRoot);
};

export default TicketSAPDetails;
