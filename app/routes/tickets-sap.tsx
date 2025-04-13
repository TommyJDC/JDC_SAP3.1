import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useOutletContext } from "@remix-run/react";
// Import getAllTicketsForSectorsSdk instead of the listener
import { getUserProfileSdk, getAllTicketsForSectorsSdk } from "~/services/firestore.service";
// Import UserSession from session.server instead of AppUser
import type { SapTicket, UserProfile } from "~/types/firestore.types";
import type { UserSession } from "~/services/session.server"; // Import UserSession
import { Timestamp } from 'firebase/firestore'; // Keep for type checking if needed
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import TicketSAPDetails from "~/components/TicketSAPDetails";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTicket, faFilter, faSearch, faUserTag, faChevronDown, faChevronRight, faSpinner,
  faExclamationTriangle, faCircleNodes, faPhone, faMapMarkerAlt, faUserTie, faInfoCircle,
  faCalendarAlt, faChevronUp
} from "@fortawesome/free-solid-svg-icons";
import { getTicketStatusStyle } from "~/utils/styleUtils";
import { parseFrenchDate, formatDateForDisplay } from "~/utils/dateUtils";

export const meta: MetaFunction = () => {
  return [{ title: "Tickets SAP | JDC Dashboard" }];
};

// Update Outlet context type to use UserSession
type OutletContextType = {
  user: UserSession | null;
  profile: UserProfile | null; // Profile now comes from root loader context
};

const groupTicketsByRaisonSociale = (tickets: SapTicket[]): Map<string, SapTicket[]> => {
  const grouped = new Map<string, SapTicket[]>();
   if (!Array.isArray(tickets)) {
     return grouped;
   }
  tickets.forEach(ticket => {
    const raisonSociale = ticket.raisonSociale; // Use raisonSociale directly
    if (raisonSociale) { // Only group if raisonSociale exists
        const existing = grouped.get(raisonSociale);
        if (existing) {
          existing.push(ticket);
        } else {
          grouped.set(raisonSociale, [ticket]);
        }
    }
  });
  return grouped;
};

export default function TicketsSap() {
  // Get user and profile directly from context
  const { user, profile: initialProfile } = useOutletContext<OutletContextType>();
  // No need for separate userProfile state if it comes from context
  // const [userProfile, setUserProfile] = useState<UserProfile | null>(initialProfile);
  const userProfile = initialProfile; // Use profile from context directly

  const [allTickets, setAllTickets] = useState<SapTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Remove isListening state as we are not using a listener anymore
  // const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showNumberOptions, setShowNumberOptions] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SapTicket | null>(null);

  // Remove unsubscribeRef as there's no listener
  // const unsubscribeRef = useRef<() => void>(() => {});

  // useEffect to fetch tickets once when user/profile changes
  useEffect(() => {
    let isMounted = true;

    const fetchTickets = async () => {
      // Use user from context directly
      if (!user || !userProfile) {
        console.log("Tickets SAP: No user or profile, clearing state.");
        setIsLoading(false);
        setAllTickets([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setAllTickets([]);

      try {
        // Profile is already available from context, no need to fetch again unless needed for refresh
        // const profile = await getUserProfileSdk(user.userId); // Use userId from UserSession
        // if (!isMounted) return;
        // setUserProfile(profile); // Update state if fetched again
        // console.log("Tickets SAP: User profile fetched:", profile);

        const sectorsToQuery = userProfile.secteurs ?? [];
        if (sectorsToQuery.length === 0) {
            console.warn(`Tickets SAP: User ${user.userId} (Role: ${userProfile.role}) has no sectors assigned.`);
            setAllTickets([]);
            setIsLoading(false);
            return;
        }

        console.log(`Tickets SAP: Fetching tickets for sectors: ${sectorsToQuery.join(', ')}`);

        // Fetch tickets once using getAllTicketsForSectorsSdk
        const fetchedTickets = await getAllTicketsForSectorsSdk(sectorsToQuery);

        if (isMounted) {
          console.log(`Tickets SAP: Fetched ${fetchedTickets.length} tickets.`);
          // Filter out tickets without raisonSociale immediately upon receiving updates
          const ticketsWithRaisonSociale = fetchedTickets.filter(t => t.raisonSociale);
          setAllTickets(ticketsWithRaisonSociale);
          setIsLoading(false); // Set loading false after fetch completes
          setError(null);
        }

      } catch (err: any) {
        if (isMounted) {
          console.error("Error fetching Tickets SAP:", err);
          setError(`Erreur de chargement initial: ${err.message}`);
          setAllTickets([]); // Clear tickets on error
          setIsLoading(false);
        }
      }
    };

    fetchTickets();

    return () => {
      isMounted = false;
      console.log("Tickets SAP: Unmounting or user changed.");
      // No listener to unsubscribe from
    };
  // Depend on user and userProfile from context
  }, [user, userProfile]);

  const availableSectors = useMemo(() => {
     // Use profile from context
     return userProfile?.secteurs?.slice().sort() ?? [];
  }, [userProfile]);

  const filteredAndGroupedTickets = useMemo(() => {
    let filtered = allTickets;

    if (selectedSector && selectedSector !== '') {
      filtered = filtered.filter(t => t.secteur === selectedSector);
    }

    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(t =>
        (t.raisonSociale && t.raisonSociale.toLowerCase().includes(lowerSearchTerm)) ||
        (t.client && t.client.toLowerCase().includes(lowerSearchTerm)) ||
        (t.id && t.id.toLowerCase().includes(lowerSearchTerm)) ||
        (t.description && t.description.toLowerCase().includes(lowerSearchTerm)) ||
        (t.statut && t.statut.toLowerCase().includes(lowerSearchTerm)) ||
        (t.numeroSAP && t.numeroSAP.toLowerCase().includes(lowerSearchTerm)) ||
        (t.deducedSalesperson && t.deducedSalesperson.toLowerCase().includes(lowerSearchTerm)) ||
        (t.adresse && t.adresse.toLowerCase().includes(lowerSearchTerm)) ||
        (t.telephone && t.telephone.toLowerCase().includes(lowerSearchTerm))
      );
    }
    return groupTicketsByRaisonSociale(filtered);
  }, [allTickets, selectedSector, searchTerm]);

  const clientGroups = useMemo(() => {
    const findMostRecentDate = (tickets: SapTicket[]): Date | null => {
      let mostRecent: Date | null = null;
      for (const ticket of tickets) {
        // Ensure ticket.date is treated as Date | Timestamp | null
        const parsedDate = parseFrenchDate(ticket.date as Date | Timestamp | null);
        if (parsedDate) {
          if (!mostRecent || parsedDate.getTime() > mostRecent.getTime()) {
            mostRecent = parsedDate;
          }
        }
      }
      return mostRecent;
    };

    const groupsWithDates = Array.from(filteredAndGroupedTickets.entries()).map(
      ([raisonSociale, tickets]) => ({
        raisonSociale,
        tickets,
        mostRecentDate: findMostRecentDate(tickets),
      })
    );

    groupsWithDates.sort((a, b) => {
      if (!b.mostRecentDate) return -1;
      if (!a.mostRecentDate) return 1;
      return b.mostRecentDate.getTime() - a.mostRecentDate.getTime();
    });

    return groupsWithDates.map(group => [group.raisonSociale, group.tickets] as [string, SapTicket[]]);

  }, [filteredAndGroupedTickets]);

  const handleWebexCall = useCallback((ticketId: string, phoneNumbers: string[]) => {
    if (phoneNumbers.length === 1) {
      window.location.href = `webexphone://call?uri=tel:${phoneNumbers[0]}`;
      setShowNumberOptions(prevState => ({ ...prevState, [ticketId]: false }));
    } else if (phoneNumbers.length > 1) {
      setShowNumberOptions(prevState => ({ ...prevState, [ticketId]: !prevState[ticketId] }));
    }
  }, []);

  const handleNumberSelection = useCallback((number: string) => {
     window.location.href = `webexphone://call?uri=tel:${number}`;
   }, []);

   const handleTicketClick = (ticket: SapTicket) => {
     console.log("Ticket clicked:", ticket);
     setSelectedTicket(ticket);
     setIsModalOpen(true);
   };

   const handleCloseModal = () => {
     setIsModalOpen(false);
     setSelectedTicket(null);
   };

   // Function to manually refresh tickets after an update in the modal
   const refreshTickets = useCallback(async () => {
       if (!user || !userProfile) return; // Need user and profile to fetch
       console.log("Tickets SAP: Refreshing tickets manually...");
       setIsLoading(true); // Show loading indicator during refresh
       try {
           const sectorsToQuery = userProfile.secteurs ?? [];
           if (sectorsToQuery.length > 0) {
               const fetchedTickets = await getAllTicketsForSectorsSdk(sectorsToQuery);
               const ticketsWithRaisonSociale = fetchedTickets.filter(t => t.raisonSociale);
               setAllTickets(ticketsWithRaisonSociale); // Update the state
           } else {
               setAllTickets([]); // Clear if no sectors
           }
           setError(null);
       } catch (err: any) {
           console.error("Error refreshing tickets:", err);
           setError(`Erreur lors du rafraîchissement: ${err.message}`);
       } finally {
           setIsLoading(false); // Hide loading indicator
       }
   }, [user, userProfile]); // Depend on user and profile

   // Update handleTicketUpdated to call refreshTickets
   const handleTicketUpdated = () => {
     console.log("Ticket update detected from modal, manually refreshing list.");
     refreshTickets(); // Call the refresh function
     // Optionally close modal after update:
     // handleCloseModal();
   };


  // Update initial check to use profile from context
  if (!user && !isLoading) {
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
        {/* Remove real-time indicator */}
        {/* {isListening && <FontAwesomeIcon icon={faCircleNodes} className="ml-3 text-green-500 text-sm animate-pulse" title="Connexion temps réel active" />} */}
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
             label="Rechercher (Raison Sociale, Client, ID, SAP, Adresse, Vendeur...)"
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
          Chargement des tickets... {/* Updated loading text */}
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
      {/* No Results State (initial load, no tickets found at all with raison sociale) */}
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
          {clientGroups.map(([raisonSociale, clientTickets]) => (
            <div key={raisonSociale} className="bg-jdc-card rounded-lg shadow overflow-hidden">
              <details className="group" open={clientGroups.length < 5}>
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-jdc-gray-800 list-none transition-colors">
                  <div className="flex items-center min-w-0 mr-2">
                    <FontAwesomeIcon icon={faUserTag} className="mr-3 text-jdc-gray-300 text-lg flex-shrink-0" />
                    <div className="min-w-0">
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
                  {clientTickets.sort((a, b) => {
                      // Ensure date is treated as Date | Timestamp | null
                      const dateA = parseFrenchDate(a.date as Date | Timestamp | null);
                      const dateB = parseFrenchDate(b.date as Date | Timestamp | null);
                      if (!dateB) return -1;
                      if (!dateA) return 1;
                      return dateB.getTime() - dateA.getTime();
                    }).map((ticket) => {
                    const statusStyle = getTicketStatusStyle(ticket.statut);
                    const parsedDate = parseFrenchDate(ticket.date as Date | Timestamp | null);
                    const displayDate = formatDateForDisplay(parsedDate);
                    const phoneNumbersArray = ticket.telephone?.split(',').map((num: string) => num.trim()).filter(num => num) || [];

                    return (
                      <div
                        key={ticket.id}
                        className="border-b border-jdc-gray-700 pb-3 last:border-b-0 text-sm cursor-pointer hover:bg-jdc-gray-800 transition-colors duration-150 p-3 rounded"
                        onClick={() => handleTicketClick(ticket)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTicketClick(ticket); }}
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
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
                           <div className="flex-shrink-0 relative">
                              {phoneNumbersArray.length > 0 && (
                                <>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                                  {showNumberOptions[ticket.id] && phoneNumbersArray.length > 1 && (
                                    <div className="absolute right-0 mt-2 w-48 bg-jdc-gray-800 rounded-md shadow-lg z-10 border border-jdc-gray-700">
                                      <ul className="py-1">
                                        {phoneNumbersArray.map((number, index) => (
                                          <li key={index}>
                                            <a
                                              href={`webexphone://call?uri=tel:${number}`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                handleNumberSelection(number);
                                                setShowNumberOptions(prevState => ({ ...prevState, [ticket.id]: false }));
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

      {isModalOpen && selectedTicket && (
        <TicketSAPDetails
          ticket={selectedTicket}
          sectorId={selectedTicket.secteur}
          onClose={handleCloseModal}
          onTicketUpdated={handleTicketUpdated} // Keep this to trigger refresh
        />
      )}
    </div>
  );
}
