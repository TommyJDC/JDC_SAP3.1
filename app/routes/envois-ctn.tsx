import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useOutletContext, useSearchParams } from "@remix-run/react"; // Import useSearchParams
import { getAllShipments, getUserProfileSdk, deleteShipmentSdk } from "~/services/firestore.service.server";
import type { Shipment, UserProfile, AppUser } from "~/types/firestore.types";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruckFast, faFilter, faSearch, faBuilding, faChevronDown, faChevronRight, faExternalLinkAlt, faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { getShipmentStatusStyle } from "~/utils/styleUtils";
import { useToast } from "~/context/ToastContext";

export const meta: MetaFunction = () => {
  return [{ title: "Envois CTN | JDC Dashboard" }];
};

type OutletContextType = {
  user: AppUser | null;
};

const groupShipmentsByClient = (shipments: Shipment[]): Map<string, Shipment[]> => {
  const grouped = new Map<string, Shipment[]>();
   if (!Array.isArray(shipments)) {
     return grouped;
   }
  shipments.forEach(shipment => {
    const clientName = shipment.nomClient || 'Client Inconnu';
    const existing = grouped.get(clientName);
    if (existing) {
      existing.push(shipment);
    } else {
      grouped.set(clientName, [shipment]);
    }
  });
  return grouped;
};

export default function EnvoisCtn() {
  const { user } = useOutletContext<OutletContextType>();
  const { addToast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allShipments, setAllShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<string | null>(null);

  const [selectedSector, setSelectedSector] = useState<string>('');
  // Initialize searchTerm from URL parameter if present
  const [searchParams] = useSearchParams();
  const initialSearchTerm = searchParams.get('client') || '';
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);

  useEffect(() => {
    // Update searchTerm if the URL parameter changes after initial load
    const clientParam = searchParams.get('client');
    if (clientParam && clientParam !== searchTerm) {
      setSearchTerm(clientParam);
    }
    // We don't necessarily want to re-trigger data fetching on param change,
    // just update the filter state. So, searchParams is not in the dependency array below.
  }, [searchParams, searchTerm]); // Add searchTerm to dependencies to avoid infinite loop if param exists

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        setAllShipments([]); // Clear shipments if user logs out
        setUserProfile(null); // Clear profile
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const profile = await getUserProfileSdk(user.uid);
        setUserProfile(profile);

        if (!profile) {
           setAllShipments([]);
           throw new Error("Profil utilisateur introuvable.");
        }

        const shipments = await getAllShipments(profile);
        setAllShipments(shipments);

      } catch (err: any) {
        console.error("Error fetching data for Envois CTN:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Erreur de chargement des données: ${errorMessage}`);
        setAllShipments([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]); // Re-fetch when user changes

  const filteredAndGroupedShipments = useMemo(() => {
    let filtered = allShipments;
    const isAdmin = userProfile?.role === 'Admin';

    // Filter by Sector (Admins see all unless a sector is explicitly selected)
    if (selectedSector && selectedSector !== '') {
       filtered = filtered.filter(s => s.secteur === selectedSector);
    }

    // Filter by Search Term
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(s =>
        (s.nomClient && s.nomClient.toLowerCase().includes(lowerSearchTerm)) ||
        (s.codeClient && s.codeClient.toLowerCase().includes(lowerSearchTerm)) ||
        (s.id && s.id.toLowerCase().includes(lowerSearchTerm)) ||
        (s.articleNom && s.articleNom.toLowerCase().includes(lowerSearchTerm))
      );
    }

    return groupShipmentsByClient(filtered);
  }, [allShipments, selectedSector, searchTerm, userProfile]);

  const clientGroups = useMemo(() => {
      const sortedEntries = Array.from(filteredAndGroupedShipments.entries())
                                .sort((a, b) => a[0].localeCompare(b[0]));
      return sortedEntries;
  }, [filteredAndGroupedShipments]);

  const availableSectors = useMemo(() => {
     const uniqueSectors = new Set(allShipments.map(s => s.secteur).filter(Boolean));
     return Array.from(uniqueSectors).sort();
  }, [allShipments]);

  // --- Delete Group Handler ---
  const handleDeleteGroup = useCallback(async (clientName: string, shipmentsToDelete: Shipment[]) => {
    if (!shipmentsToDelete || shipmentsToDelete.length === 0) return;

    const shipmentCount = shipmentsToDelete.length;
    const confirmation = window.confirm(`Êtes-vous sûr de vouloir supprimer les ${shipmentCount} envoi${shipmentCount > 1 ? 's' : ''} pour le client "${clientName}" ? Cette action est irréversible.`);

    if (confirmation) {
      setDeletingGroup(clientName);
      const shipmentIdsToDelete = shipmentsToDelete.map(s => s.id);
      const deletePromises = shipmentIdsToDelete.map(id => deleteShipmentSdk(id));

      try {
        const results = await Promise.allSettled(deletePromises);

        const successfulDeletes = results.filter(r => r.status === 'fulfilled').length;
        const failedDeletes = results.filter(r => r.status === 'rejected').length;

        if (failedDeletes > 0) {
          console.error(`Failed to delete ${failedDeletes} shipments for client ${clientName}.`);
          // Extract specific error messages if needed
          const errorMessages = results
            .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
            .map(r => r.reason instanceof Error ? r.reason.message : String(r.reason))
            .join(', ');
          addToast({ type: 'error', message: `Erreur lors de la suppression de ${failedDeletes} envoi${failedDeletes > 1 ? 's' : ''} pour ${clientName}. Détails: ${errorMessages}` });
        }

        if (successfulDeletes > 0) {
           setAllShipments(prevShipments => prevShipments.filter(s => !shipmentIdsToDelete.includes(s.id)));
           addToast({ type: 'success', message: `${successfulDeletes} envoi${successfulDeletes > 1 ? 's' : ''} pour ${clientName} supprimé${successfulDeletes > 1 ? 's' : ''} avec succès.` });
        }

      } catch (error: any) {
        // This catch is less likely with allSettled, but good for safety
        console.error("Unexpected error during group deletion:", error);
        // Ensure a valid message is passed here
        const errorMessage = error instanceof Error ? error.message : String(error);
        addToast({ type: 'error', message: `Erreur inattendue lors de la suppression du groupe: ${errorMessage}` });
      } finally {
        setDeletingGroup(null);
      }
    }
  }, [addToast]);

  const isAdmin = userProfile?.role === 'Admin';

  if (!user && !isLoading) {
     return (
        <div className="text-center text-jdc-gray-400 py-10">
            Veuillez vous connecter pour voir les envois.
        </div>
     )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-4 flex items-center">
        <FontAwesomeIcon icon={faTruckFast} className="mr-3 text-jdc-yellow" />
        Suivi des Envois CTN
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
            className="block w-full rounded-md bg-jdc-gray-800 border-transparent focus:border-jdc-yellow focus:ring focus:ring-jdc-yellow focus:ring-opacity-50 text-white py-2 pl-3 pr-10"
            disabled={isLoading || availableSectors.length === 0}
          >
            <option value="">Tous les secteurs</option>
            {availableSectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
           {availableSectors.length === 0 && !isLoading && allShipments.length > 0 && (
             <p className="text-xs text-jdc-gray-500 mt-1">Aucun secteur trouvé dans les envois affichés.</p>
           )}
           {availableSectors.length === 0 && !isLoading && allShipments.length === 0 && !error && (
             <p className="text-xs text-jdc-gray-500 mt-1">Aucun envoi accessible trouvé.</p>
           )}
        </div>

        {/* Search Input */}
        <div className="col-span-1 md:col-span-2">
           <Input
             label="Rechercher (Client, ID, Article...)"
             id="search-client"
             name="search-client"
             placeholder="Entrez un nom, code, ID, article..."
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
          Chargement des envois...
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center text-red-400 bg-red-900 bg-opacity-50 p-4 rounded-lg">{error}</div>
      )}

      {/* No Results State */}
      {!isLoading && !error && clientGroups.length === 0 && (
        <div className="text-center text-jdc-gray-400 py-10">
          {allShipments.length > 0
            ? "Aucun envoi trouvé correspondant à votre recherche ou filtre."
            : "Aucun envoi accessible trouvé pour votre compte. Vérifiez vos secteurs assignés si vous n'êtes pas Admin."}
        </div>
      )}


      {/* Shipments List */}
      {!isLoading && !error && clientGroups.length > 0 && (
        <div className="space-y-3">
          {clientGroups.map(([clientName, clientShipments]) => (
            <div key={clientName} className="bg-jdc-card rounded-lg shadow overflow-hidden">
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-jdc-gray-800 list-none transition-colors gap-4">
                  <div className="flex items-center min-w-0 mr-2 flex-grow">
                    <FontAwesomeIcon icon={faBuilding} className="mr-3 text-jdc-gray-300 text-lg flex-shrink-0" />
                    <div className="min-w-0">
                        <span className="font-semibold text-white text-lg block truncate" title={clientName}>{clientName}</span>
                        <span className="ml-0 md:ml-3 text-sm text-jdc-gray-400">
                            ({clientShipments.length} envoi{clientShipments.length > 1 ? 's' : ''})
                        </span>
                         {clientShipments[0]?.codeClient && clientShipments[0].codeClient !== clientName && (
                            <span className="block text-xs text-jdc-gray-500 truncate" title={`Code: ${clientShipments[0].codeClient}`}>Code: {clientShipments[0].codeClient}</span>
                         )}
                    </div>
                  </div>

                  <div className="flex items-center flex-shrink-0 space-x-3">
                    {isAdmin && (
                        <Button
                            variant="danger"
                            size="sm"
                            title={`Supprimer tous les envois pour ${clientName}`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteGroup(clientName, clientShipments);
                            }}
                            isLoading={deletingGroup === clientName}
                            disabled={deletingGroup !== null && deletingGroup !== clientName}
                            leftIcon={<FontAwesomeIcon icon={faTrash} />}
                            className="flex-shrink-0"
                        >
                            Suppr. Groupe
                        </Button>
                    )}
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="text-jdc-gray-400 transition-transform duration-200 group-open:rotate-90 text-xl flex-shrink-0"
                    />
                  </div>
                </summary>

                <div className="border-t border-jdc-gray-700 bg-jdc-gray-900 p-4 space-y-3">
                  {clientShipments.map((shipment) => {
                    const statusStyle = getShipmentStatusStyle(shipment.statutExpedition);
                    const truncatedArticle = shipment.articleNom && shipment.articleNom.length > 50
                      ? `${shipment.articleNom.substring(0, 47)}...`
                      : shipment.articleNom;

                    return (
                      <div key={shipment.id} className="flex items-center justify-between text-sm border-b border-jdc-gray-700 pb-2 last:border-b-0 gap-2">
                        <div className="flex-1 min-w-0 mr-1">
                          <span className="text-jdc-gray-200 block font-medium truncate" title={shipment.articleNom}>
                            {truncatedArticle || 'Article non spécifié'}
                          </span>
                          <div className="flex items-center flex-wrap mt-1 space-x-2">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyle.bgColor} ${statusStyle.textColor}`}>
                                {shipment.statutExpedition || 'Inconnu'}
                              </span>
                              <span className="text-jdc-gray-500 text-xs whitespace-nowrap" title={`ID: ${shipment.id}`}>
                                ID: {shipment.id.substring(0, 8)}...
                              </span>
                               <span className="text-jdc-gray-500 text-xs whitespace-nowrap">
                                 Secteur: {shipment.secteur || 'N/A'}
                               </span>
                          </div>
                        </div>

                        <div className="flex items-center flex-shrink-0 space-x-2">
                            {shipment.trackingLink && (
                              <Button
                                as="link"
                                to={shipment.trackingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="secondary"
                                size="sm"
                                title="Suivre le colis"
                                leftIcon={<FontAwesomeIcon icon={faExternalLinkAlt} />}
                              >
                                Suivi
                              </Button>
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
    </div>
  );
}
