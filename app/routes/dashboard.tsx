import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useOutletContext } from "@remix-run/react";
import React, { useState, useEffect, lazy, Suspense } from "react";

import { StatsCard } from "~/components/StatsCard";
const InteractiveMap = lazy(() => import("~/components/InteractiveMap"));
import { RecentTickets } from "~/components/RecentTickets";
import { RecentShipments } from "~/components/RecentShipments";
import { ClientOnly } from "~/components/ClientOnly"; // Import ClientOnly
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTicket, faUsers, faMapMarkedAlt, faSpinner, faExclamationTriangle, faMap } from "@fortawesome/free-solid-svg-icons";

// Import types
import type { DashboardLoaderData, SapTicket, Shipment, AppUser, StatsSnapshot, UserProfile } from "~/types/firestore.types";

// Import Firestore service functions
import {
  getUserProfileSdk,
  getRecentTicketsForSectors,
  getRecentShipmentsForSectors,
  getTotalTicketCountSdk,
  getDistinctClientCountFromEnvoiSdk,
  getLatestStatsSnapshotsSdk,
} from "~/services/firestore.service";


export const meta: MetaFunction = () => {
  return [{ title: "Tableau de Bord | JDC Dashboard" }];
};

export const loader = async () => {
  console.log("Dashboard Loader: Executing (minimal work).");
  return json({});
};

type OutletContextType = { user: AppUser | null };

type EvolutionData = {
  ticketCount: number | null;
  distinctClientCountFromEnvoi: number | null;
};

const MapLoadingFallback = () => (
  <div className="bg-jdc-card p-4 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[450px]">
    <FontAwesomeIcon icon={faSpinner} spin className="text-jdc-yellow text-3xl mb-4" />
    <p className="text-jdc-gray-400 text-center">Chargement de la carte...</p>
  </div>
);

const MapLoginPrompt = () => (
   <div className="bg-jdc-card p-4 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[450px]">
        <FontAwesomeIcon icon={faMapMarkedAlt} className="text-jdc-gray-500 text-4xl mb-4" />
        <p className="text-jdc-gray-400 text-center">Connectez-vous pour voir la carte des tickets.</p>
   </div>
);

export default function Dashboard() {
  const { user } = useOutletContext<OutletContextType>();

  const [liveTicketCount, setLiveTicketCount] = useState<number | null>(null);
  const [liveDistinctClientCountFromEnvoi, setLiveDistinctClientCountFromEnvoi] = useState<number | null>(null);
  const [evolution, setEvolution] = useState<EvolutionData>({
    ticketCount: null,
    distinctClientCountFromEnvoi: null,
  });
  const [recentTickets, setRecentTickets] = useState<SapTicket[]>([]);
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [loadingTickets, setLoadingTickets] = useState<boolean>(true);
  const [loadingShipments, setLoadingShipments] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) {
        setLoadingStats(false); setLoadingTickets(false); setLoadingShipments(false);
        setLiveTicketCount(null); setLiveDistinctClientCountFromEnvoi(null);
        setEvolution({ ticketCount: null, distinctClientCountFromEnvoi: null });
        setRecentTickets([]); setRecentShipments([]); setError(null);
        return;
      }
      setLoadingStats(true); setLoadingTickets(true); setLoadingShipments(true); setError(null);
      console.log("Dashboard Effect: Fetching data...");
      try {
        const userProfile = await getUserProfileSdk(user.uid);
        // Default sectors based on profile, or empty array if no profile
        const userSectors = userProfile?.secteurs ?? [];

        // For Tickets: Use assigned sectors for everyone (including Admins)
        // Because ticket data is split across collections named after sectors.
        const sectorsForTickets = userSectors;

        // For Shipments & Client Count (from 'Envoi' collection):
        // Admins see all (represented by []), others see their assigned sectors.
        // The service functions for shipments/client count handle the Admin case correctly.
        const sectorsForShipments = userProfile?.role === 'Admin' ? [] : userSectors;

        console.log(`Dashboard Effect: Using sectors for tickets: ${JSON.stringify(sectorsForTickets)}`);
        console.log(`Dashboard Effect: Using sectors for shipments: ${sectorsForShipments.length === 0 && userProfile?.role === 'Admin' ? '(Admin - All)' : JSON.stringify(sectorsForShipments)}`);

        const results = await Promise.allSettled([
          getLatestStatsSnapshotsSdk(1),
          // Pass the determined sectors for tickets
          getTotalTicketCountSdk(sectorsForTickets),
          // Pass the user profile for client count (service handles Admin logic)
          getDistinctClientCountFromEnvoiSdk(userProfile),
          // Pass the determined sectors for tickets
          getRecentTicketsForSectors(sectorsForTickets, 20),
          // Pass the determined sectors for shipments (service handles Admin logic for [])
          // Fetch more shipments (e.g., 20) to get a better list of recent clients
          getRecentShipmentsForSectors(sectorsForShipments, 20)
        ]);

        const snapshotResult = results[0];
        const ticketCountResult = results[1];
        const distinctClientCountResult = results[2];
        const latestSnapshot = snapshotResult.status === 'fulfilled' && snapshotResult.value.length > 0 ? snapshotResult.value[0] : null;
        const fetchedLiveTicketCount = ticketCountResult.status === 'fulfilled' ? ticketCountResult.value : null;
        const fetchedLiveDistinctClientCountFromEnvoi = distinctClientCountResult.status === 'fulfilled' ? distinctClientCountResult.value : null;

        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`Dashboard Effect: Error fetching data at index ${index}:`, result.reason);
                if (index === 0) setError("Erreur lors du chargement des données d'évolution.");
                if (index === 1) setError("Erreur lors du chargement du nombre total de tickets.");
                if (index === 2) setError("Erreur lors du chargement du nombre de clients distincts (depuis envois).");
            }
        });

        setLiveTicketCount(fetchedLiveTicketCount);
        setLiveDistinctClientCountFromEnvoi(fetchedLiveDistinctClientCountFromEnvoi);

        const calculatedEvolution: EvolutionData = { ticketCount: null, distinctClientCountFromEnvoi: null };
        if (latestSnapshot) {
            // Simplified evolution calculation logic for brevity
            if (fetchedLiveTicketCount !== null && latestSnapshot.totalTickets !== undefined) {
                calculatedEvolution.ticketCount = fetchedLiveTicketCount - latestSnapshot.totalTickets;
            }
            if (fetchedLiveDistinctClientCountFromEnvoi !== null && latestSnapshot.activeClients !== undefined) {
                calculatedEvolution.distinctClientCountFromEnvoi = fetchedLiveDistinctClientCountFromEnvoi - latestSnapshot.activeClients;
            } else if (fetchedLiveDistinctClientCountFromEnvoi !== null && latestSnapshot.activeClients === undefined) {
                 console.warn("Dashboard Effect: Snapshot missing 'activeClients' field.");
            }
        } else {
            if (snapshotResult.status === 'rejected' && !error) {
                 setError("Impossible de calculer l'évolution (données snapshot manquantes).");
            }
        }
        setEvolution(calculatedEvolution);

        const recentTicketsResult = results[3];
        const recentShipmentsResult = results[4];
        setRecentTickets(recentTicketsResult.status === 'fulfilled' ? recentTicketsResult.value : []);
        setRecentShipments(recentShipmentsResult.status === 'fulfilled' ? recentShipmentsResult.value : []);

        if (!error && (ticketCountResult.status === 'rejected' || distinctClientCountResult.status === 'rejected')) {
             setError("Erreur lors du chargement des statistiques principales.");
        }
      } catch (err: any) {
        setError(err.message || "Erreur générale lors du chargement des données.");
        setLiveTicketCount(null); setLiveDistinctClientCountFromEnvoi(null);
        setEvolution({ ticketCount: null, distinctClientCountFromEnvoi: null });
        setRecentTickets([]); setRecentShipments([]);
      } finally {
        setLoadingStats(false); setLoadingTickets(false); setLoadingShipments(false);
        console.log("Dashboard Effect: Data fetching finished.");
      }
    };
    loadDashboardData();
  }, [user, fetchTrigger]);

  useEffect(() => { if (user) { setFetchTrigger(prev => prev + 1); } }, [user]);

  const isDataFullyLoaded = !loadingStats && !loadingTickets && !loadingShipments;

  const formatStatValue = (value: number | string | null, isLoading: boolean): string => {
     if (isLoading) return "...";
     if (value === null || value === undefined) return "N/A";
     return value.toString();
  };

  const statsData = [
    { title: "Tickets SAP (Total)", valueState: liveTicketCount, icon: faTicket, evolutionKey: 'ticketCount', loadingState: loadingStats },
    { title: "Clients CTN (Distincts)", valueState: liveDistinctClientCountFromEnvoi, icon: faUsers, evolutionKey: 'distinctClientCountFromEnvoi', loadingState: loadingStats },
  ];

  const isOverallLoading = loadingStats || loadingTickets || loadingShipments;
  const ticketsForList = recentTickets.slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Tableau de Bord</h1>
      {error && (
        <div className="flex items-center p-4 bg-red-800 text-white rounded-lg mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          {error}
        </div>
      )}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {statsData.map((stat) => {
           const isLoading = stat.loadingState;
           const mainValue = stat.valueState;
           const evolutionDisplayValue = evolution[stat.evolutionKey as keyof EvolutionData];
           return (
             <StatsCard
               key={stat.title}
               title={stat.title}
               value={formatStatValue(mainValue, isLoading)}
               icon={stat.icon}
               isLoading={isLoading}
               evolutionValue={evolutionDisplayValue}
             />
           );
         })}
       </div>

      {/* Map Section (Full Width) */}
      <div className="w-full mb-6">
        <ClientOnly fallback={<MapLoadingFallback />}>
          {() => // Render function for ClientOnly children
            user ? (
              <Suspense fallback={<MapLoadingFallback />}>
                <InteractiveMap
                  tickets={recentTickets}
                  isLoadingTickets={loadingTickets}
                />
              </Suspense>
            ) : (
              <MapLoginPrompt />
            )
          }
        </ClientOnly>
      </div>

      {/* Recent Activity Section (Below Map) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentTickets
           tickets={ticketsForList}
           isLoading={loadingTickets}
        />
        <RecentShipments
           shipments={recentShipments}
           isLoading={loadingShipments}
        />
      </div>

      {!user && !isOverallLoading && !error && (
         <div className="p-4 bg-jdc-card rounded-lg text-center text-jdc-gray-300 mt-6">
           Veuillez vous connecter pour voir le tableau de bord.
         </div>
       )}
    </div>
  );
}
