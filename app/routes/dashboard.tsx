import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useOutletContext } from "@remix-run/react";
import React, { useState, useEffect, lazy, Suspense } from "react";

import { StatsCard } from "~/components/StatsCard";
const InteractiveMap = lazy(() => import("~/components/InteractiveMap"));
import { RecentTickets } from "~/components/RecentTickets";
import { RecentShipments } from "~/components/RecentShipments";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTicket, faUsers, faMapMarkedAlt, faSpinner, faExclamationTriangle, faMap } from "@fortawesome/free-solid-svg-icons"; // Removed faShippingFast, faTruckFast

// Import types
import type { DashboardLoaderData, SapTicket, Shipment, AppUser, StatsSnapshot, UserProfile } from "~/types/firestore.types";

// Import Firestore service functions (SDK versions)
import {
  getUserProfileSdk,
  getRecentTicketsForSectors,
  getRecentShipmentsForSectors,
  getTotalTicketCountSdk,
  // getActiveShipmentCountSdk, // Removed - No longer needed
  getDistinctClientCountFromEnvoiSdk,
  getLatestStatsSnapshotsSdk,
} from "~/services/firestore.service";


export const meta: MetaFunction = () => {
  return [{ title: "Tableau de Bord | JDC Dashboard" }];
};

// Loader remains minimal
export const loader = async () => {
  console.log("Dashboard Loader: Executing (minimal work).");
  return json({});
};

type OutletContextType = { user: AppUser | null };

// Define type for evolution data - Removed activeShipmentCount
type EvolutionData = {
  ticketCount: number | null;
  distinctClientCountFromEnvoi: number | null;
};

// Fallback component for Suspense
const MapLoadingFallback = () => (
  <div className="bg-jdc-card p-4 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[450px]">
    <FontAwesomeIcon icon={faSpinner} spin className="text-jdc-yellow text-3xl mb-4" />
    <p className="text-jdc-gray-400 text-center">Chargement de la carte...</p>
  </div>
);

// Fallback component when user is not logged in
const MapLoginPrompt = () => (
   <div className="bg-jdc-card p-4 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[450px]">
        <FontAwesomeIcon icon={faMapMarkedAlt} className="text-jdc-gray-500 text-4xl mb-4" />
        <p className="text-jdc-gray-400 text-center">Connectez-vous pour voir la carte des tickets.</p>
   </div>
);

export default function Dashboard() {
  const { user } = useOutletContext<OutletContextType>();
  const [isClient, setIsClient] = useState(false);

  // State for LIVE counts
  const [liveTicketCount, setLiveTicketCount] = useState<number | null>(null);
  // Removed liveActiveShipmentCount state
  const [liveDistinctClientCountFromEnvoi, setLiveDistinctClientCountFromEnvoi] = useState<number | null>(null);

  // State for evolution data - Removed activeShipmentCount
  const [evolution, setEvolution] = useState<EvolutionData>({
    ticketCount: null,
    distinctClientCountFromEnvoi: null,
  });

  // State for recent items
  const [recentTickets, setRecentTickets] = useState<SapTicket[]>([]);
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);

  // Loading states
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [loadingTickets, setLoadingTickets] = useState<boolean>(true);
  const [loadingShipments, setLoadingShipments] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0); // Used to re-trigger fetch on login

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) {
        console.log("Dashboard Effect: No user logged in, resetting state.");
        setLoadingStats(false);
        setLoadingTickets(false);
        setLoadingShipments(false);
        setLiveTicketCount(null);
        // Removed liveActiveShipmentCount reset
        setLiveDistinctClientCountFromEnvoi(null);
        setEvolution({ ticketCount: null, distinctClientCountFromEnvoi: null }); // Reset evolution
        setRecentTickets([]);
        setRecentShipments([]);
        setError(null);
        return;
      }

      setLoadingStats(true);
      setLoadingTickets(true);
      setLoadingShipments(true);
      setError(null);
      console.log("Dashboard Effect: User found, attempting to fetch data using SDK...");

      try {
        console.log(`Dashboard Effect: Fetching user profile for ${user.uid}...`);
        const userProfile: UserProfile | null = await getUserProfileSdk(user.uid);
        const userSectors: string[] = userProfile?.secteurs ?? [];
        console.log("Dashboard Effect: User profile fetched.", { userProfile, userSectors });

        if (!userProfile) {
            console.warn("Dashboard Effect: User profile not found. Data fetching might be limited or fail.");
        }

        const sectorsToQuery = userProfile?.role === 'Admin' ? userSectors : userSectors;
        console.log(`Dashboard Effect: Using sectorsToQuery: [${sectorsToQuery.join(', ')}]`);

        if (userProfile?.role === 'Admin' && sectorsToQuery.length === 0) {
            console.warn("Dashboard Effect: Admin user has no sectors assigned. Counts might be based on limited data or appear as 0.");
        }
        if (userProfile?.role !== 'Admin' && sectorsToQuery.length === 0) {
            console.warn(`Dashboard Effect: User ${user.uid} (Role: ${userProfile?.role}) has no sectors assigned. Counts will likely be 0.`);
        }


        console.log("Dashboard Effect: Fetching latest snapshot, live counts, and recent items (SDK)...");

        // --- Fetching Data ---
        // Removed getActiveShipmentCountSdk call
        const results = await Promise.allSettled([
          getLatestStatsSnapshotsSdk(1),                 // 0: Snapshot
          getTotalTicketCountSdk(sectorsToQuery),        // 1: Live Ticket Count
          getDistinctClientCountFromEnvoiSdk(sectorsToQuery), // 2: Live Distinct Client Count (from ALL Envoi)
          getRecentTicketsForSectors(sectorsToQuery, 20), // 3: Recent Tickets
          getRecentShipmentsForSectors(sectorsToQuery, 5) // 4: Recent Shipments
        ]);

        console.log("Dashboard Effect: Raw fetch results:", results);

        // --- Processing Fetched Data ---

        // Process Snapshot and Live Counts (Indices 0, 1, 2)
        const snapshotResult = results[0];
        const ticketCountResult = results[1];
        const distinctClientCountResult = results[2]; // Index 2 is now Distinct Client Count

        const latestSnapshot: StatsSnapshot | null = snapshotResult.status === 'fulfilled' && snapshotResult.value.length > 0 ? snapshotResult.value[0] : null;
        const fetchedLiveTicketCount = ticketCountResult.status === 'fulfilled' ? ticketCountResult.value : null;
        // Removed fetchedLiveActiveShipmentCount
        const fetchedLiveDistinctClientCountFromEnvoi = distinctClientCountResult.status === 'fulfilled' ? distinctClientCountResult.value : null;

        // Log errors from promises
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`Dashboard Effect: Error fetching data at index ${index}:`, result.reason);
                // Adjust error messages based on new indices
                if (index === 0) setError("Erreur lors du chargement des données d'évolution.");
                if (index === 1) setError("Erreur lors du chargement du nombre total de tickets.");
                if (index === 2) setError("Erreur lors du chargement du nombre de clients distincts (depuis envois).");
                // Removed error message for index 3 (previously active shipments)
            }
        });

        // Update live counts state
        setLiveTicketCount(fetchedLiveTicketCount);
        // Removed setLiveActiveShipmentCount
        setLiveDistinctClientCountFromEnvoi(fetchedLiveDistinctClientCountFromEnvoi);

        // Calculate evolution - Removed activeShipmentCount
        const calculatedEvolution: EvolutionData = { ticketCount: null, distinctClientCountFromEnvoi: null };
        if (latestSnapshot) {
            console.log("Dashboard Effect: Calculating evolution against snapshot:", latestSnapshot);
            // Ticket Evolution
            if (fetchedLiveTicketCount !== null && latestSnapshot.totalTickets !== undefined) {
                calculatedEvolution.ticketCount = fetchedLiveTicketCount - latestSnapshot.totalTickets;
            }
            // Distinct Client (from ALL Envoi) Evolution
            if (fetchedLiveDistinctClientCountFromEnvoi !== null && latestSnapshot.activeClients !== undefined) {
                calculatedEvolution.distinctClientCountFromEnvoi = fetchedLiveDistinctClientCountFromEnvoi - latestSnapshot.activeClients;
            } else if (fetchedLiveDistinctClientCountFromEnvoi !== null && latestSnapshot.activeClients === undefined) {
                 console.warn("Dashboard Effect: Snapshot missing 'activeClients' field for distinct client evolution calculation.");
            }
            // Removed Active Shipment Evolution calculation
             console.log("Dashboard Effect: Calculated evolution:", calculatedEvolution);
        } else {
            console.warn("Dashboard Effect: No snapshot data found, cannot calculate evolution.");
            if (snapshotResult.status === 'rejected' && !error) {
                 setError("Impossible de calculer l'évolution (données snapshot manquantes).");
            }
        }
        setEvolution(calculatedEvolution);
        setLoadingStats(false); // Stats loading finished

        // Process Recent Items (Indices 3, 4)
        const recentTicketsResult = results[3]; // Index updated
        const recentShipmentsResult = results[4]; // Index updated

        setRecentTickets(recentTicketsResult.status === 'fulfilled' ? recentTicketsResult.value : []);
        setRecentShipments(recentShipmentsResult.status === 'fulfilled' ? recentShipmentsResult.value : []);
        setLoadingTickets(false);
        setLoadingShipments(false);

        // Check if any critical fetch failed and set a general error if needed
        // Removed check for activeShipmentCountResult
        if (!error && (ticketCountResult.status === 'rejected' || distinctClientCountResult.status === 'rejected')) {
             setError("Erreur lors du chargement des statistiques principales.");
        }


      } catch (err: any) {
        console.error("Dashboard Effect: General error during data fetching setup:", err);
        setError(err.message || "Erreur générale lors du chargement des données.");
        setLiveTicketCount(null);
        // Removed setLiveActiveShipmentCount
        setLiveDistinctClientCountFromEnvoi(null);
        setEvolution({ ticketCount: null, distinctClientCountFromEnvoi: null });
        setRecentTickets([]);
        setRecentShipments([]);
        setLoadingStats(false);
        setLoadingTickets(false);
        setLoadingShipments(false);
      } finally {
         console.log("Dashboard Effect: Data fetching attempt finished.");
      }
    };

    loadDashboardData();
  }, [user, fetchTrigger]); // Re-run effect if user or trigger changes

   // Trigger fetch when user logs in
   useEffect(() => {
    if (user) {
      console.log("Dashboard: User state changed and user exists, triggering data fetch.");
      setFetchTrigger(prev => prev + 1);
    } else {
       console.log("Dashboard: User state changed to null (logged out).");
       // State reset happens in the main effect now
    }
   }, [user]);


  // --- Render Logic ---

  const formatStatValue = (value: number | string | null, isLoading: boolean): string => {
     if (isLoading) return "...";
     if (value === null || value === undefined) return "N/A";
     return value.toString();
  };

  // Stats data configuration - Removed the third tile
  const statsData = [
    // Tile 1: Total SAP Tickets
    {
        title: "Tickets SAP (Total)",
        valueState: liveTicketCount,
        icon: faTicket,
        evolutionKey: 'ticketCount',
        loadingState: loadingStats
    },
    // Tile 2: Distinct Clients from 'Envoi'
    {
        title: "Clients CTN (Distincts)",
        valueState: liveDistinctClientCountFromEnvoi,
        icon: faUsers,
        evolutionKey: 'distinctClientCountFromEnvoi',
        loadingState: loadingStats
    },
    // Third tile removed
  ];

  const isOverallLoading = loadingStats || loadingTickets || loadingShipments;
  const ticketsForList = recentTickets.slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Tableau de Bord</h1>

      {/* General Error Display */}
      {error && (
        <div className="flex items-center p-4 bg-red-800 text-white rounded-lg mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          {error}
        </div>
      )}

       {/* Stats Cards Section - Adjusted grid columns */}
       {/* Use grid-cols-1 md:grid-cols-2 for responsiveness. lg:grid-cols-2 ensures only 2 columns on large screens */}
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

      {/* Map and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Map Display */}
        {isClient ? (
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
        ) : (
          <MapLoadingFallback />
        )}

        {/* Recent Tickets & Shipments Lists */}
        <div className="space-y-6">
          <RecentTickets
             tickets={ticketsForList}
             isLoading={loadingTickets}
          />
          <RecentShipments
             shipments={recentShipments}
             isLoading={loadingShipments}
          />
        </div>
      </div>

       {/* Prompt to log in */}
       {!user && !isOverallLoading && !error && (
         <div className="p-4 bg-jdc-card rounded-lg text-center text-jdc-gray-300 mt-6">
           Veuillez vous connecter pour voir le tableau de bord.
         </div>
       )}
    </div>
  );
}
