import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useOutletContext } from "@remix-run/react";
import { getUserProfileSdk, listenToAllTicketsForSectorsSdk } from "~/services/firestore.service";
import type { SapTicket, UserProfile, AppUser } from "~/types/firestore.types";
import { Timestamp } from 'firebase/firestore'; // Import Timestamp for date handling
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import TicketSAPDetails from "~/components/TicketSAPDetails"; // Import the modal component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTicket, faFilter, faSearch, faUserTag, faChevronDown, faChevronRight, faSpinner,
  faExclamationTriangle, faCircleNodes, faPhone, faMapMarkerAlt, faUserTie, faInfoCircle,
  faCalendarAlt, faChevronUp // Added new icons
} from "@fortawesome/free-solid-svg-icons";
import { getTicketStatusStyle } from "~/utils/styleUtils";
// Use the new functions from dateUtils
import { parseFrenchDate, formatDateForDisplay } from "~/utils/dateUtils";

export const meta: MetaFunction = () => {
  return [{ title: "Tickets SAP | JDC Dashboard" }];
};

type OutletContextType = {
  user: AppUser | null;
};

// Updated to group by raisonSociale, assumes tickets without raisonSociale are pre-filtered
const groupTicketsByRaisonSociale = (tickets: SapTicket[]): Map<string, SapTicket[]> => {
  const grouped = new Map<string, SapTicket[]>();
   if (!Array.isArray(tickets)) {
     return grouped;
   }
  tickets.forEach(ticket => {
    // We assume tickets without raisonSociale are already filtered out before calling this
    const raisonSociale = ticket.raisonSociale!; // Use non-null assertion as it should be present
    const existing = grouped.get(raisonSociale);
    if (existing) {
      existing.push(ticket);
    } else {
      grouped.set(raisonSociale, [ticket]);
    }
  });
  return grouped;
};

export default function TicketsSap() {
  const { user } = useOutletContext<OutletContextType>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allTickets, setAllTickets] = useState<SapTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showNumberOptions, setShowNumberOptions] = useState<Record<string, boolean>>({}); // State for phone dropdown visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SapTicket | null>(null);

  const unsubscribeRef = useRef<() => void>(() => {});

  useEffect(() => {
    let isMounted = true;

    const setupListener = async () => {
      if (!user) {
        console.log("Tickets SAP: No user, clearing state and listener.");
        if (unsubscribeRef.current) unsubscribeRef.current();
        setIsListening(false);
        setIsLoading(false);
        setAllTickets([]);
        setUserProfile(null);
        setError(null);
        return;
      }

      if (isListening) {
          console.log("Tickets SAP: Already listening, skipping setup.");
          return;
      }

      setIsLoading(true);
      setError(null);
      setAllTickets([]);

      try {
        const profile = await getUserProfileSdk(user.uid);
        if (!isMounted) return;
        setUserProfile(profile);
        console.log("Tickets SAP: User profile fetched:", profile);

        if (!profile) {
           throw new Error("Profil utilisateur introuvable.");
        }

        const sectorsToQuery = profile.secteurs ?? [];
        if (sectorsToQuery.length === 0) {
            console.warn(`Tickets SAP: User ${user.uid} (Role: ${profile.role}) has no sectors assigned.`);
            setAllTickets([]);
            setIsLoading(false);
            return;
        }

        console.log(`Tickets SAP: Setting up listener for sectors: ${sectorsToQuery.join(', ')}`);

        const { unsubscribe } = listenToAllTicketsForSectorsSdk(
          sectorsToQuery,
          (updatedTickets) => {
            if (isMounted) {
              console.log(`Tickets SAP: Listener received ${updatedTickets.length} tickets.`);
              // Filter out tickets without raisonSociale immediately upon receiving updates
              const ticketsWithRaisonSociale = updatedTickets.filter(t => t.raisonSociale);
              setAllTickets(ticketsWithRaisonSociale);
              if (isLoading) setIsLoading(false);
              setError(null);
            }
          },
          (listenerError) => {
            if (isMounted) {
              console.error("Tickets SAP: Listener error:", listenerError);
              setError(`Erreur de connexion temps réel: ${listenerError.message}`);
              setIsLoading(false);
              setIsListening(false);
            }
          }
        );

        unsubscribeRef.current = unsubscribe;
        setIsListening(true);

      } catch (err: any) {
        if (isMounted) {
          console.error("Error setting up listener for Tickets SAP:", err);
          setError(`Erreur de chargement initial: ${err.message}`);
          setAllTickets([]); // Clear tickets on error
          setIsLoading(false);
          setIsListening(false);
        }
      }
    };

    setupListener();

    return () => {
      isMounted = false;
      console.log("Tickets SAP: Cleaning up listener.");
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      unsubscribeRef.current = () => {};
      setIsListening(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Dependency array includes user

  const availableSectors = useMemo(() => {
     return userProfile?.secteurs?.slice().sort() ?? [];
  }, [userProfile]);

  const filteredAndGroupedTickets = useMemo(() => {
    // Start with tickets that already have raisonSociale (filtered in useEffect)
    let filtered = allTickets;

    // Apply sector filter
    if (selectedSector && selectedSector !== '') {
      filtered = filtered.filter(t => t.secteur === selectedSector);
    }

    // Apply search term filter
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(t =>
        (t.raisonSociale && t.raisonSociale.toLowerCase().includes(lowerSearchTerm)) || // Search raisonSociale
        (t.client && t.client.toLowerCase().includes(lowerSearchTerm)) || // Keep searching client field too? Or remove? Assuming keep for now.
        (t.id && t.id.toLowerCase().includes(lowerSearchTerm)) ||
        (t.description && t.description.toLowerCase().includes(lowerSearchTerm)) ||
        (t.statut && t.statut.toLowerCase().includes(lowerSearchTerm)) ||
        (t.numeroSAP && t.numeroSAP.toLowerCase().includes(lowerSearchTerm)) ||
        (t.deducedSalesperson && t.deducedSalesperson.toLowerCase().includes(lowerSearchTerm)) ||
        (t.adresse && t.adresse.toLowerCase().includes(lowerSearchTerm)) ||
        (t.telephone && t.telephone.toLowerCase().includes(lowerSearchTerm))
      );
    }

    // Group the filtered tickets by raisonSociale
    return groupTicketsByRaisonSociale(filtered);
  }, [allTickets, selectedSector, searchTerm]);

  // --- Group Sorting Logic ---
  const clientGroups = useMemo(() => {
    // Find the most recent valid date within a group of tickets
    const findMostRecentDate = (tickets: SapTicket[]): Date | null => {
      let mostRecent: Date | null = null;
      for (const ticket of tickets) {
        const parsedDate = parseFrenchDate(ticket.date);
        if (parsedDate) {
          if (!mostRecent || parsedDate.getTime() > mostRecent.getTime()) {
            mostRecent = parsedDate;
          }
        }
      }
      return mostRecent;
    };

    // Convert map entries to an array and calculate the most recent date for each group
    const groupsWithDates = Array.from(filteredAndGroupedTickets.entries()).map(
      ([raisonSociale, tickets]) => ({
        raisonSociale,
        tickets,
        mostRecentDate: findMostRecentDate(tickets),
      })
    );

    // Sort the groups based on the mostRecentDate, descending (newest first)
    // Groups without a valid date will be placed at the end
    groupsWithDates.sort((a, b) => {
      if (!b.mostRecentDate) return -1; // B has no valid date, A comes first
      if (!a.mostRecentDate) return 1;  // A has no valid date, B comes first
      return b.mostRecentDate.getTime() - a.mostRecentDate.getTime();
    });

    // Return the sorted array of groups (without the temporary date used for sorting)
    // We need the original [raisonSociale, tickets] structure for the mapping below
    return groupsWithDates.map(group => [group.raisonSociale, group.tickets] as [string, SapTicket[]]);

  }, [filteredAndGroupedTickets]);
  // --- End Group Sorting Logic ---

  // --- Call Handling Logic ---
  const handleWebexCall = useCallback((ticketId: string, phoneNumbers: string[]) => {
    if (phoneNumbers.length === 1) {
      window.location.href = `webexphone://call?uri=tel:${phoneNumbers[0]}`;
      setShowNumberOptions(prevState => ({ ...prevState, [ticketId]: false })); // Ensure dropdown is closed
    } else if (phoneNumbers.length > 1) {
      // Toggle dropdown visibility for this specific ticket
      setShowNumberOptions(prevState => ({ ...prevState, [ticketId]: !prevState[ticketId] }));
    }
  }, []);

  const handleNumberSelection = useCallback((number: string) => {
     window.location.href = `webexphone://call?uri=tel:${number}`;
     // Close all dropdowns after selection (optional, but good UX)
     // setShowNumberOptions({}); // Uncomment to close all dropdowns
   }, []);
   // --- End Call Handling Logic ---

   // --- Modal Handling Logic ---
   const handleTicketClick = (ticket: SapTicket) => {
     console.log("Ticket clicked:", ticket);
     setSelectedTicket(ticket);
     setIsModalOpen(true);
   };

   const handleCloseModal = () => {
     setIsModalOpen(false);
     setSelectedTicket(null);
   };

   // This function is called by the modal when an update happens inside it.
   // The real-time listener should automatically update the list,
   // so we might just need to close the modal or do nothing extra here.
   const handleTicketUpdated = () => {
     console.log("Ticket update detected from modal, list should refresh via listener.");
     // Optionally close modal after update:
     // handleCloseModal();
   };
   // --- End Modal Handling Logic ---


  if (!user && !isLoading && !isListening) {
     return (
        <div className="text-center text-jdc-gray-400 py-10">
            Veuillez vous connecter pour voir les tickets SAP.
        </div>
     )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-4 flex items-center">
        <FontAwesomeIcon icon={faTicket} className="mr-3 text-jdc-blue" />
        Gestion des Tickets SAP
        {isListening && <FontAwesomeIcon icon={faCircleNodes} className="ml-3 text-green-500 text-sm animate-pulse" title="Connexion temps réel active" />}
      </h1>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-jdc-card rounded-lg shadow">
        {/* Sector Filter */}
        <div className="col-span-1">
          <label htmlFor="sector-filter" className="block text-sm font-medium text-jdc-gray-300 mb-1">
            <FontAwesomeIcon icon={faFilter} className="mr-1" /> Filtrer par Secteur
          </label>
          <select
            id="sector-filter"
            name="sector-filter"
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="block w-full rounded-md bg-jdc-gray-800 border-transparent focus:border-jdc-blue focus:ring focus:ring-jdc-blue focus:ring-opacity-50 text-white py-2 pl-3 pr-10"
            disabled={isLoading || availableSectors.length === 0}
          >
            <option value="">Tous les secteurs ({userProfile?.secteurs?.length ?? 0})</option>
            {availableSectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
           {availableSectors.length === 0 && !isLoading && !error && (
             <p className="text-xs text-jdc-gray-500 mt-1">Aucun secteur assigné à votre profil.</p>
           )}
        </div>

        {/* Search Input */}
        <div className="col-span-1 md:col-span-2">
           <Input
             label="Rechercher (Raison Sociale, Client, ID, SAP, Adresse, Vendeur...)" // Updated label
             id="search-client"
             name="search-client"
             placeholder="Entrez un nom, ID, mot-clé..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             icon={<FontAwesomeIcon icon={faSearch} />}
             wrapperClassName="mb-0"
             disabled={isLoading}
           />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center text-jdc-gray-400 py-10">
          <FontAwesomeIcon icon={faSpinner} spin className="text-2xl mr-2" />
          Chargement et connexion temps réel...
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center text-red-400 bg-red-900 bg-opacity-50 p-4 rounded-lg flex items-center justify-center">
           <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
           {error}
        </div>
      )}

      {/* No Results State (after filtering/searching) */}
      {!isLoading && !error && clientGroups.length === 0 && allTickets.length > 0 && (
        <div className="text-center text-jdc-gray-400 py-10">
          Aucun ticket trouvé correspondant à votre recherche ou filtre (ou sans raison sociale).
        </div>
      )}
      {/* No Results State (initial load or listener active, no tickets found at all with raison sociale) */}
       {!isLoading && !error && allTickets.length === 0 && (
         <div className="text-center text-jdc-gray-400 py-10">
           {userProfile?.secteurs && userProfile.secteurs.length > 0
             ? "Aucun ticket SAP avec une raison sociale trouvée pour les secteurs assignés."
             : "Aucun ticket SAP trouvé. Vérifiez vos secteurs assignés ou contactez un administrateur."}
         </div>
       )}


      {/* Tickets List */}
      {!isLoading && !error && clientGroups.length > 0 && (
        <div className="space-y-3">
          {/* clientGroups is now sorted by raisonSociale */}
          {clientGroups.map(([raisonSociale, clientTickets]) => (
            <div key={raisonSociale} className="bg-jdc-card rounded-lg shadow overflow-hidden">
              <details className="group" open={clientGroups.length < 5}> {/* Keep open if few groups */}
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-jdc-gray-800 list-none transition-colors">
                  <div className="flex items-center min-w-0 mr-2">
                    <FontAwesomeIcon icon={faUserTag} className="mr-3 text-jdc-gray-300 text-lg flex-shrink-0" />
                    <div className="min-w-0">
                        {/* Display raisonSociale */}
                        <span className="font-semibold text-white text-lg block truncate" title={raisonSociale}>{raisonSociale}</span>
                        <span className="ml-0 md:ml-3 text-sm text-jdc-gray-400">
                            ({clientTickets.length} ticket{clientTickets.length > 1 ? 's' : ''})
                        </span>
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="text-jdc-gray-400 transition-transform duration-200 group-open:rotate-90 text-xl flex-shrink-0"
                  />
                </summary>
                <div className="border-t border-jdc-gray-700 bg-jdc-gray-900 p-4 space-y-3">
                  {/* Sort tickets by parsed date descending */}
                  {clientTickets.sort((a, b) => {
                      const dateA = parseFrenchDate(a.date);
                      const dateB = parseFrenchDate(b.date);
                      // Handle null dates during sort (e.g., put them at the end)
                      if (!dateB) return -1;
                      if (!dateA) return 1;
                      return dateB.getTime() - dateA.getTime();
                    }).map((ticket) => {
                    const statusStyle = getTicketStatusStyle(ticket.statut);

                    // Parse the date using the new utility function, then format it for display
                    const parsedDate = parseFrenchDate(ticket.date);
                    const displayDate = formatDateForDisplay(parsedDate);

                    const phoneNumbersArray = ticket.telephone?.split(',').map((num: string) => num.trim()).filter(num => num) || []; // Cleaned array

                    return (
                      // Add onClick handler and styling to the ticket container
                      <div
                        key={ticket.id}
                        className="border-b border-jdc-gray-700 pb-3 last:border-b-0 text-sm cursor-pointer hover:bg-jdc-gray-800 transition-colors duration-150 p-3 rounded"
                        onClick={() => handleTicketClick(ticket)}
                        role="button" // Accessibility
                        tabIndex={0} // Accessibility
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTicketClick(ticket); }} // Accessibility
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                           {/* Left Side: SAP #, Date, Status */}
                           <div className="flex-1 min-w-0 mb-2 md:mb-0 md:mr-4">
                              <div className="flex items-center mb-1">
                                <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-jdc-blue w-4 text-center" />
                                <span className="text-jdc-gray-100 font-semibold" title={`SAP: ${ticket.numeroSAP || 'N/A'}`}>
                                  {ticket.numeroSAP || 'N/A'}
                                </span>
                                <span className={`ml-3 inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyle.bgColor} ${statusStyle.textColor}`}>
                                  {ticket.statut || 'Inconnu'}
                                </span>
                              </div>
                              <div className="flex items-center text-xs text-jdc-gray-400">
                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-jdc-gray-500 w-4 text-center" />
                                <span>{displayDate}</span>
                                <span className="mx-2">|</span>
                                <span className="text-jdc-gray-500" title={`ID: ${ticket.id}`}>
                                  ID: {ticket.id.substring(0, 8)}...
                                </span>
                                <span className="mx-2">|</span>
                                <span className="text-jdc-gray-500">
                                  Secteur: {ticket.secteur || 'N/A'}
                                </span>
                              </div>
                           </div>

                           {/* Right Side: Call Button */}
                           <div className="flex-shrink-0 relative">
                              {phoneNumbersArray.length > 0 && (
                                <>
                                  <Button
                                    variant="secondary" // Use an existing variant like 'secondary'
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent card click if needed
                                      handleWebexCall(ticket.id, phoneNumbersArray);
                                    }}
                                    className="text-jdc-blue border-jdc-blue hover:bg-jdc-blue hover:text-white"
                                    title={phoneNumbersArray.length === 1 ? `Appeler ${phoneNumbersArray[0]}` : "Appeler..."}
                                  >
                                    <FontAwesomeIcon icon={faPhone} className="mr-2" />
                                    <span>Appeler</span>
                                    {phoneNumbersArray.length > 1 && (
                                      <FontAwesomeIcon icon={showNumberOptions[ticket.id] ? faChevronUp : faChevronDown} className="ml-2" />
                                    )}
                                  </Button>

                                  {/* Dropdown for multiple numbers */}
                                  {showNumberOptions[ticket.id] && phoneNumbersArray.length > 1 && (
                                    <div className="absolute right-0 mt-2 w-48 bg-jdc-gray-800 rounded-md shadow-lg z-10 border border-jdc-gray-700">
                                      <ul className="py-1">
                                        {phoneNumbersArray.map((number, index) => (
                                          <li key={index}>
                                            <a
                                              href={`webexphone://call?uri=tel:${number}`}
                                              onClick={(e) => {
                                                e.stopPropagation(); // Prevent card click when clicking call link
                                                e.preventDefault(); // Prevent default link behavior
                                                handleNumberSelection(number);
                                                setShowNumberOptions(prevState => ({ ...prevState, [ticket.id]: false })); // Close dropdown on selection
                                              }}
                                              className="block px-4 py-2 text-sm text-jdc-gray-200 hover:bg-jdc-blue hover:text-white"
                                            >
                                              {number}
                                            </a>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </>
                              )}
                           </div>
                        </div>

                        {/* Bottom Row: Salesperson, Address, Description */}
                        <div className="space-y-1 text-xs">
                           {ticket.deducedSalesperson && (
                             <div className="flex items-center text-jdc-gray-400">
                               <FontAwesomeIcon icon={faUserTie} className="mr-2 text-jdc-gray-500 w-4 text-center" />
                               <span>{ticket.deducedSalesperson}</span>
                             </div>
                           )}
                           {ticket.adresse && (
                             <div className="flex items-center text-jdc-gray-400">
                               <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-jdc-gray-500 w-4 text-center" />
                               <span className="truncate" title={ticket.adresse}>{ticket.adresse}</span>
                             </div>
                           )}
                           {ticket.description && (
                             <div className="text-jdc-gray-300 pt-1">
                               <p className="line-clamp-2" title={ticket.description}>{ticket.description}</p>
                             </div>
                           )}
                           {ticket.demandeSAP && (
                             <div className="text-jdc-gray-500 italic pt-1">
                                Demande SAP: ({ticket.demandeSAP.length > 40 ? ticket.demandeSAP.substring(0, 37) + '...' : ticket.demandeSAP})
                             </div>
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </details>
            </div>
          ))}
        </div>
      )}

      {/* Render the Modal */}
      {isModalOpen && selectedTicket && (
        <TicketSAPDetails
          ticket={selectedTicket}
          // Ensure sectorId is passed correctly. It should be on the ticket object itself.
          sectorId={selectedTicket.secteur}
          onClose={handleCloseModal}
          onTicketUpdated={handleTicketUpdated}
        />
      )}
    </div>
  );
}
