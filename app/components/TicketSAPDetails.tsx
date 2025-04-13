import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Added useCallback
import ReactDOM from 'react-dom'; // Import ReactDOM for createPortal
// Use ~ alias for imports relative to the app root
import useGeminiSummary from '~/hooks/useGeminiSummary';
import { updateSAPTICKET } from '~/services/firestore.service'; // Already imported
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
    // Use demandeSAP as the primary source for the AI prompt, fallback if needed (though demandeSAP seems most relevant based on structure)
    const problemDescriptionForAI = ticket?.demandeSAP || ticket?.descriptionProbleme || ticket?.description || '';
    const summaryPrompt = useMemo(() => {
        // RESTORED CACHE CHECK: Generate prompt only if we have a description AND no cached summary exists.
        // Diagnostic logs removed.
        if (!problemDescriptionForAI || ticket?.summary) {
             return '';
        }
        // Ensure the prompt is concise enough for the AI model's input limits if necessary, but demandeSAP seems okay for now.
        const prompt = `Résume ce problème SAP en 1 ou 2 phrases maximum, en français: ${problemDescriptionForAI}`;
        return prompt;
    }, [ticket?.id, problemDescriptionForAI, ticket?.summary]); // Restore ticket?.summary dependency

    const {
        summary: generatedSummary,
        isLoading: isSummaryLoading,
        error: summaryError,
        generateSummary: triggerSummaryGeneration,
        isCached: isSummaryCached, // Get isCached state
        resetSummaryState: resetSummaryHookState // Get reset function
    } = useGeminiSummary(GEMINI_API_KEY);

    // --- AI Solution ---
    // Use a separate instance of the hook for the solution, also using demandeSAP primarily
    const solutionPrompt = useMemo(() => {
        // RESTORED CACHE CHECK: Generate prompt only if we have a description AND no cached solution exists.
        // Diagnostic logs removed.
        if (!problemDescriptionForAI || ticket?.solution) {
            return '';
        }
         const prompt = `Propose une solution concise (1-2 phrases), en français, pour ce problème SAP: ${problemDescriptionForAI}`;
         return prompt;
    }, [ticket?.id, problemDescriptionForAI, ticket?.solution]); // Restore ticket?.solution dependency

    const {
        summary: generatedSolution,
        isLoading: isSolutionLoading,
        error: solutionError,
        generateSummary: triggerSolutionGeneration,
        isCached: isSolutionCached, // Get isCached state
        resetSummaryState: resetSolutionHookState // Get reset function
    } = useGeminiSummary(GEMINI_API_KEY);

    // --- Callbacks for Saving ---
    const handleSaveSummary = useCallback(async (summaryToSave: string) => {
        if (!ticket || !sectorId) return;
        console.log(`[TicketSAPDetails] Calling updateSAPTICKET to save SUMMARY for ticket ${ticket.id}`);
        setUpdateError(null); // Clear previous update errors
        try {
            await updateSAPTICKET(sectorId, ticket.id, { summary: summaryToSave });
            onTicketUpdated(); // Refresh list after successful save
        } catch (error: any) {
            console.error("Error saving SAP summary via callback:", error);
            // Set specific error for summary saving failure
            setUpdateError(`Erreur sauvegarde résumé: ${error.message}`);
            // Re-throw the error so the hook knows saving failed
            throw error;
        }
    }, [ticket, sectorId, onTicketUpdated]);

    const handleSaveSolution = useCallback(async (solutionToSave: string) => {
        if (!ticket || !sectorId) return;
        console.log(`[TicketSAPDetails] Calling updateSAPTICKET to save SOLUTION for ticket ${ticket.id}`);
        setUpdateError(null); // Clear previous update errors
        try {
            await updateSAPTICKET(sectorId, ticket.id, { solution: solutionToSave });
            onTicketUpdated(); // Refresh list after successful save
        } catch (error: any) {
            console.error("Error saving SAP solution via callback:", error);
            // Set specific error for solution saving failure
            setUpdateError(`Erreur sauvegarde solution: ${error.message}`);
            // Re-throw the error so the hook knows saving failed
            throw error;
        }
    }, [ticket, sectorId, onTicketUpdated]);


    // --- Effects ---

    // Initialize/Update status, reset AI hooks, and trigger AI generation
    useEffect(() => {
        console.log("[TicketSAPDetails Effect] Running for ticket:", ticket?.id);
        // Reset AI hook states when ticket changes
        resetSummaryHookState();
        resetSolutionHookState();

        if (ticket) {
            setCurrentStatus(getInitialSAPStatus(ticket));

            // Trigger AI generation ONLY if the prompt is not empty
            // The hook will handle the cache check internally if called.
            if (summaryPrompt) {
                console.log("[TicketSAPDetails Effect] Triggering SUMMARY generation for ticket:", ticket.id);
                triggerSummaryGeneration(ticket, summaryPrompt, handleSaveSummary);
            } else {
                console.log("[TicketSAPDetails Effect] Skipping SUMMARY generation (prompt is empty - likely cached or no description).");
                // If prompt is empty because it's cached, the hook reset should clear any previous state.
                // If prompt is empty because description is empty, we don't want to generate.
            }

            if (solutionPrompt) {
                console.log("[TicketSAPDetails Effect] Triggering SOLUTION generation for ticket:", ticket.id);
                triggerSolutionGeneration(ticket, solutionPrompt, handleSaveSolution);
            } else {
                 console.log("[TicketSAPDetails Effect] Skipping SOLUTION generation (prompt is empty - likely cached or no description).");
            }

        } else {
            console.log("[TicketSAPDetails Effect] No ticket, resetting status.");
            setCurrentStatus('');
            // Hooks already reset above
        }

        // Clear local component errors when ticket changes
        setStatusUpdateError(null);
        setCommentError(null);
        setUpdateError(null); // Clear general update errors too
        setNewComment('');

    // Dependencies: ticket object itself, prompts, and the generation triggers + save callbacks
    // Note: Callbacks (handleSaveSummary, handleSaveSolution) have their own dependencies defined via useCallback
    }, [
        ticket,
        summaryPrompt,
        solutionPrompt,
        triggerSummaryGeneration,
        triggerSolutionGeneration,
        handleSaveSummary,
        handleSaveSolution,
        resetSummaryHookState,
        resetSolutionHookState
    ]);


    // REMOVED the separate useEffect hooks for saving summary/solution.
    // This is now handled by the callbacks passed to the useGeminiSummary hook.


    // --- Handlers ---

    // Add a handler for the main close action to also reset AI states
    const handleClose = () => {
        resetSummaryHookState();
        resetSolutionHookState();
        onClose(); // Call the original onClose handler
    };

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

    // Determine what to display: Prioritize direct cache from ticket prop, fallback to hook state
    const displaySummary = ticket?.summary || generatedSummary;
    const displaySolution = ticket?.solution || generatedSolution;

    // --- Diagnostic Log ---
    console.log("[TicketSAPDetails Render] Received Ticket Prop:", JSON.stringify(ticket, null, 2)); // Log the whole ticket object received
    console.log("[TicketSAPDetails Render] Calculated displaySummary:", displaySummary);
    console.log("[TicketSAPDetails Render] Calculated displaySolution:", displaySolution);
    // --- End Diagnostic Log ---

    // --- Portal Logic ---
    // Need to ensure this only runs client-side where document is available
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    // The actual modal JSX
    const modalContent = (
        // Outer container: Fixed position, full screen, z-index, flex center
        // Add onClick={handleClose} to the outer div for click-outside-to-close behavior
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70" onClick={handleClose}>
            {/* Modal Content Box: Max width, relative positioning, background, text color, rounded */}
            {/* Add onClick={(e) => e.stopPropagation()} to prevent closing when clicking inside */}
            <div className="w-11/12 max-w-3xl relative bg-jdc-card text-jdc-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                {/* Close Button: Absolute positioning top-right */}
                <button
                    onClick={handleClose} // Use the new close handler
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
                            // Ensure dark background and light text, overriding potential defaults
                            className="select select-bordered select-sm w-full max-w-xs bg-jdc-gray text-jdc-white"
                            value={currentStatus}
                            onChange={(e) => setCurrentStatus(e.target.value)}
                            disabled={isUpdatingStatus}
                        >
                            {/* Add text color class directly to options for better contrast in dropdown */}
                            <option className="text-black" value="Nouveau">Nouveau</option>
                            <option className="text-black" value="En cours">En cours</option>
                            <option className="text-black" value="En attente client">En attente client</option>
                            <option className="text-black" value="Résolu">Résolu</option>
                            <option className="text-black" value="Terminé">Terminé</option>
                            <option className="text-black" value="Annulé">Annulé</option>
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
                        <h4 className="text-md font-semibold mb-1 text-blue-300">
                            Résumé IA {isSummaryCached && <span className="text-xs font-normal text-gray-400">(cache)</span>}
                        </h4>
                        {isSummaryLoading && <span className="loading loading-dots loading-sm"></span>}
                        {/* Display error from hook OR the specific update error */}
                        {(summaryError || (updateError && updateError.includes("résumé"))) && !displaySummary && (
                            <p className="text-error text-xs">Erreur: {summaryError || updateError}</p>
                        )}
                        {displaySummary ? (
                            <div className="prose prose-sm max-w-none text-gray-300"><ReactMarkdown>{displaySummary}</ReactMarkdown></div>
                        ) : !isSummaryLoading && !summaryError && !(updateError && updateError.includes("résumé")) ? (
                            <p className="text-xs text-gray-500 italic">Aucun résumé.</p> // Simplified empty state
                        ) : null}
                        {/* Removed redundant updateError display here, handled above */}
                    </div>

                    {/* AI Solution */}
                    <div>
                         <h4 className="text-md font-semibold mb-1 text-green-300">
                            Solution Proposée IA {isSolutionCached && <span className="text-xs font-normal text-gray-400">(cache)</span>}
                        </h4>
                        {isSolutionLoading && <span className="loading loading-dots loading-sm"></span>}
                         {/* Display error from hook OR the specific update error */}
                        {(solutionError || (updateError && updateError.includes("solution"))) && !displaySolution && (
                            <p className="text-error text-xs">Erreur: {solutionError || updateError}</p>
                        )}
                        {displaySolution ? (
                            <div className="prose prose-sm max-w-none text-gray-300"><ReactMarkdown>{displaySolution}</ReactMarkdown></div>
                        ) : !isSolutionLoading && !solutionError && !(updateError && updateError.includes("solution")) ? (
                             <p className="text-xs text-gray-500 italic">Aucune solution.</p> // Simplified empty state
                        ) : null}
                         {/* Removed redundant updateError display here, handled above */}
                    </div>
                </div>
                <hr className="my-3 border-gray-700"/>

                {/* Original SAP Problem Description */}
                <details className="mb-3 text-sm">
                    <summary className="cursor-pointer font-medium text-gray-400 hover:text-jdc-white">Voir la description du problème SAP</summary>
                    <div className="mt-2 p-3 border border-gray-600 rounded bg-jdc-gray text-xs max-h-32 overflow-y-auto">
                        {/* Displaying demandeSAP primarily, then fallbacks */}
                        <pre className="whitespace-pre-wrap break-words font-mono">{ticket.demandeSAP || ticket.descriptionProbleme || ticket.description || 'N/A'}</pre>
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
            {/* Click outside to close is now handled by the outer div's onClick={handleClose} */}
            {/* Clicking inside the modal content box is prevented by its onClick={(e) => e.stopPropagation()} */}
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
