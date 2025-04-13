import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node"; // Import LoaderFunctionArgs
import { json, redirect } from "@remix-run/node"; // Import redirect
import { useOutletContext, useLoaderData } from "@remix-run/react"; // Import useLoaderData
import React, { useState, useEffect, lazy, Suspense } from "react";
import { authenticator } from "~/services/auth.server"; // Import authenticator
import { getGoogleAuthClient, getCalendarEvents } from "~/services/google.server"; // Import Google helpers
import { getWeekDateRangeForAgenda } from "~/utils/dateUtils"; // Import date helper

import { StatsCard } from "~/components/StatsCard";
const InteractiveMap = lazy(() => import("~/components/InteractiveMap"));
import { RecentTickets } from "~/components/RecentTickets";
import { RecentShipments } from "~/components/RecentShipments";
import { ClientOnly } from "~/components/ClientOnly"; // Import ClientOnly
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTicket, faUsers, faMapMarkedAlt, faSpinner, faExclamationTriangle, faMap, faCalendarDays } from "@fortawesome/free-solid-svg-icons"; // Added faCalendarDays

// Import types
// Removed DashboardLoaderData as we define loader return type inline
import type { SapTicket, Shipment, AppUser, StatsSnapshot, UserProfile } from "~/types/firestore.types";
import type { UserSession } from "~/services/session.server"; // Import UserSession

// Import Firestore service functions (still used for client-side fetching)
import {
  getUserProfileSdk, // Still needed for client-side fetching in useEffect
  getRecentTicketsForSectors,
  getRecentShipmentsForSectors,
  getTotalTicketCountSdk,
  getDistinctClientCountFromEnvoiSdk,
  getLatestStatsSnapshotsSdk,
} from "~/services/firestore.service";


export const meta: MetaFunction = () => {
  return [{ title: "Tableau de Bord | JDC Dashboard" }];
};

// Define type for Calendar Event (simplified)
interface CalendarEvent {
    id: string;
    summary?: string | null;
    start?: { dateTime?: string | null; date?: string | null } | null;
    end?: { dateTime?: string | null; date?: string | null } | null;
    htmlLink?: string | null;
}

// Define loader return type
interface DashboardLoaderData {
    calendarEvents: CalendarEvent[];
    calendarError: string | null;
    // Add other server-loaded data here if needed in the future
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("Dashboard Loader: Executing...");
  const session = await authenticator.isAuthenticated(request);
  let calendarEvents: CalendarEvent[] = [];
  let calendarError: string | null = null;

  if (session) {
    console.log("Dashboard Loader: User authenticated, attempting to fetch calendar events.");
    try {
      const authClient = await getGoogleAuthClient(session);
      const { startOfWeek, endOfWeek } = getWeekDateRangeForAgenda();

      const timeMin = startOfWeek.toISOString();
      const timeMax = endOfWeek.toISOString();

      // Fetch events from Google Calendar API
      const rawEvents = await getCalendarEvents(authClient, timeMin, timeMax);
      // Map to our simplified CalendarEvent type
      calendarEvents = rawEvents.map((event: any) => ({
          id: event.id,
          summary: event.summary,
          start: event.start,
          end: event.end,
          htmlLink: event.htmlLink,
      }));
      console.log(`Dashboard Loader: Fetched ${calendarEvents.length} calendar events.`);

    } catch (error: any) {
      console.error("Dashboard Loader: Error fetching calendar events:", error);
      calendarError = error.message || "Erreur lors de la récupération de l'agenda.";
      if (error.message.includes("token") || error.message.includes("authenticate")) {
         calendarError = "Erreur d'authentification Google Calendar. Veuillez vous reconnecter.";
      }
       if (error.message.includes("Permission denied")) {
         calendarError = "Accès à Google Calendar refusé. Vérifiez les autorisations.";
       }
       // If quota exceeded, inform the user
       if (error.message.includes("Quota exceeded") || error.message.includes("RESOURCE_EXHAUSTED")) {
           calendarError = "Quota Google Calendar dépassé.";
       }
    }
  } else {
      console.log("Dashboard Loader: User not authenticated.");
      // Optionally set an error if calendar requires auth
      // calendarError = "Veuillez vous connecter pour voir l'agenda.";
  }

  return json<DashboardLoaderData>({ calendarEvents, calendarError });
};

// Update Outlet context type to use UserSession from root loader
type OutletContextType = {
    user: UserSession | null;
    profile: UserProfile | null; // Profile fetched client-side in root
    profileLoading: boolean;
};

type EvolutionData = {
  ticketCount: number | null;
  distinctClientCountFromEnvoi: number | null;
};

// --- Placeholder Components ---
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

// Placeholder for WeeklyAgenda component
const WeeklyAgenda: React.FC<{ events: CalendarEvent[], error: string | null, isLoading: boolean }> = ({ events, error, isLoading }) => {
    if (isLoading) {
        return (
             <div className="bg-jdc-card p-4 rounded-lg shadow-lg min-h-[200px] flex items-center justify-center">
                 <FontAwesomeIcon icon={faSpinner} spin className="text-jdc-yellow text-xl mr-2" />
                 <span className="text-jdc-gray-400">Chargement de l'agenda...</span>
             </div>
        );
    }
    if (error) {
        return (
             <div className="bg-jdc-card p-4 rounded-lg shadow-lg min-h-[200px]">
                 <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                     <FontAwesomeIcon icon={faCalendarDays} className="mr-2 text-jdc-blue" />
                     Agenda de la semaine
                 </h3>
                 <div className="text-red-400 bg-red-900 bg-opacity-50 p-3 rounded">
                     <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" /> {error}
                 </div>
             </div>
        );
    }
     if (events.length === 0) {
        return (
             <div className="bg-jdc-card p-4 rounded-lg shadow-lg min-h-[200px]">
                 <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                     <FontAwesomeIcon icon={faCalendarDays} className="mr-2 text-jdc-blue" />
                     Agenda de la semaine
                 </h3>
                 <p className="text-jdc-gray-400">Aucun événement trouvé pour cette période.</p>
             </div>
        );
    }

    // Basic rendering - needs refinement
    return (
        <div className="bg-jdc-card p-4 rounded-lg shadow-lg min-h-[200px]">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <FontAwesomeIcon icon={faCalendarDays} className="mr-2 text-jdc-blue" />
                Agenda de la semaine
            </h3>
            <ul className="space-y-2">
                {events.map(event => (
                    <li key={event.id} className="text-sm border-b border-jdc-gray-700 pb-1 last:border-b-0">
                        <span className="font-medium text-jdc-gray-200">{event.summary || '(Sans titre)'}</span>
                        <span className="text-xs text-jdc-gray-400 ml-2">
                            ({formatEventTime(event.start)} - {formatEventTime(event.end)})
                        </span>
                         {event.htmlLink && <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="text-xs text-jdc-blue hover:underline ml-2">(Voir)</a>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Helper to format event time/date
const formatEventTime = (eventDateTime?: { dateTime?: string | null; date?: string | null } | null): string => {
    if (!eventDateTime) return 'N/A';
    // If dateTime exists (specific time), format it
    if (eventDateTime.dateTime) {
        try {
            return new Date(eventDateTime.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } catch { return 'Heure invalide'; }
    }
    // If only date exists (all-day event), format the date
    if (eventDateTime.date) {
         try {
            // Date string might be YYYY-MM-DD, need to parse correctly respecting timezone
            const [year, month, day] = eventDateTime.date.split('-').map(Number);
            // Create date assuming it's local timezone for display purposes of all-day events
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
        } catch { return 'Date invalide'; }
    }
    return 'N/A';
};
// --- End Placeholder Components ---


export default function Dashboard() {
  // Use context from root (contains user session)
  const { user, profile, profileLoading } = useOutletContext<OutletContextType>();
  // Get calendar data from this route's loader
  const { calendarEvents, calendarError } = useLoaderData<typeof loader>();

  // Client-side state for stats and recent items remains
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
  const [clientError, setClientError] = useState<string | null>(null); // Renamed from error to avoid conflict
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // useEffect for client-side data fetching (stats, tickets, shipments)
  useEffect(() => {
    const loadDashboardData = async () => {
      // Use profile from context, wait if it's loading
      if (profileLoading) {
          console.log("Dashboard Effect: Waiting for profile to load...");
          return; // Wait until profile is loaded or loading finishes
      }
      // If profile loading finished but profile is still null (and user exists), handle appropriately
      if (user && !profile) {
          console.warn("Dashboard Effect: User session exists but profile is null after loading.");
          // Decide how to handle this - maybe show limited data or an error?
          // For now, proceed but Firestore calls might fail or return limited data
      }

      // Only proceed if user session exists
      if (!user) {
        setLoadingStats(false); setLoadingTickets(false); setLoadingShipments(false);
        setLiveTicketCount(null); setLiveDistinctClientCountFromEnvoi(null);
        setEvolution({ ticketCount: null, distinctClientCountFromEnvoi: null });
        setRecentTickets([]); setRecentShipments([]); setClientError(null);
        return;
      }

      setLoadingStats(true); setLoadingTickets(true); setLoadingShipments(true); setClientError(null);
      console.log("Dashboard Effect: Fetching client-side data (stats, tickets, shipments)...");
      try {
        // Use profile from context now
        const userProfile = profile;
        const userSectors = userProfile?.secteurs ?? [];
        const sectorsForTickets = userSectors;
        const sectorsForShipments = userProfile?.role === 'Admin' ? [] : userSectors;

        console.log(`Dashboard Effect: Using sectors for tickets: ${JSON.stringify(sectorsForTickets)}`);
        console.log(`Dashboard Effect: Using sectors for shipments: ${sectorsForShipments.length === 0 && userProfile?.role === 'Admin' ? '(Admin - All)' : JSON.stringify(sectorsForShipments)}`);

        // Fetch data using Firestore SDK (client-side)
        const results = await Promise.allSettled([
          getLatestStatsSnapshotsSdk(1),
          getTotalTicketCountSdk(sectorsForTickets),
          getDistinctClientCountFromEnvoiSdk(userProfile), // Pass profile directly
          getRecentTicketsForSectors(sectorsForTickets, 20),
          getRecentShipmentsForSectors(sectorsForShipments, 20)
        ]);

        // Process results (same logic as before)
        const snapshotResult = results[0];
        const ticketCountResult = results[1];
        const distinctClientCountResult = results[2];
        const latestSnapshot = snapshotResult.status === 'fulfilled' && snapshotResult.value.length > 0 ? snapshotResult.value[0] : null;
        const fetchedLiveTicketCount = ticketCountResult.status === 'fulfilled' ? ticketCountResult.value : null;
        const fetchedLiveDistinctClientCountFromEnvoi = distinctClientCountResult.status === 'fulfilled' ? distinctClientCountResult.value : null;

        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`Dashboard Effect: Error fetching client-side data at index ${index}:`, result.reason);
                 if (!clientError) { // Show first error encountered
                    if (index === 0) setClientError("Erreur chargement évolution.");
                    if (index === 1) setClientError("Erreur chargement total tickets.");
                    if (index === 2) setClientError("Erreur chargement clients distincts.");
                 }
            }
        });

        setLiveTicketCount(fetchedLiveTicketCount);
        setLiveDistinctClientCountFromEnvoi(fetchedLiveDistinctClientCountFromEnvoi);

        const calculatedEvolution: EvolutionData = { ticketCount: null, distinctClientCountFromEnvoi: null };
         if (latestSnapshot) {
             if (fetchedLiveTicketCount !== null && latestSnapshot.totalTickets !== undefined) {
                 calculatedEvolution.ticketCount = fetchedLiveTicketCount - latestSnapshot.totalTickets;
             }
             if (fetchedLiveDistinctClientCountFromEnvoi !== null && latestSnapshot.activeClients !== undefined) {
                 calculatedEvolution.distinctClientCountFromEnvoi = fetchedLiveDistinctClientCountFromEnvoi - latestSnapshot.activeClients;
             }
         } else {
             if (snapshotResult.status === 'rejected' && !clientError) {
                  setClientError("Données snapshot manquantes.");
             }
         }
        setEvolution(calculatedEvolution);

        const recentTicketsResult = results[3];
        const recentShipmentsResult = results[4];
        setRecentTickets(recentTicketsResult.status === 'fulfilled' ? recentTicketsResult.value : []);
        setRecentShipments(recentShipmentsResult.status === 'fulfilled' ? recentShipmentsResult.value : []);

      } catch (err: any) {
        setClientError(err.message || "Erreur générale chargement données client.");
        setLiveTicketCount(null); setLiveDistinctClientCountFromEnvoi(null);
        setEvolution({ ticketCount: null, distinctClientCountFromEnvoi: null });
        setRecentTickets([]); setRecentShipments([]);
      } finally {
        setLoadingStats(false); setLoadingTickets(false); setLoadingShipments(false);
        console.log("Dashboard Effect: Client-side data fetching finished.");
      }
    };
    loadDashboardData();
  // Depend on user session and profile fetched in root
  }, [user, profile, profileLoading, fetchTrigger]);

  // Removed trigger effect as profile fetch is now in root

  const formatStatValue = (value: number | string | null, isLoading: boolean): string => {
     if (isLoading) return "...";
     if (value === null || value === undefined) return "N/A";
     return value.toString();
  };

  const statsData = [
    { title: "Tickets SAP (Total)", valueState: liveTicketCount, icon: faTicket, evolutionKey: 'ticketCount', loadingState: loadingStats },
    { title: "Clients CTN (Distincts)", valueState: liveDistinctClientCountFromEnvoi, icon: faUsers, evolutionKey: 'distinctClientCountFromEnvoi', loadingState: loadingStats },
  ];

  const isOverallLoading = loadingStats || loadingTickets || loadingShipments || profileLoading; // Include profileLoading
  const ticketsForList = recentTickets.slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Tableau de Bord</h1>
      {/* Display client-side errors */}
      {clientError && (
        <div className="flex items-center p-4 bg-red-800 text-white rounded-lg mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          {clientError}
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

        {/* Calendar Section */}
        <WeeklyAgenda
            events={calendarEvents}
            error={calendarError}
            isLoading={!user && !calendarError} // Show loading if no user and no specific error yet
        />

      {/* Map Section */}
      <div className="w-full mb-6">
        <ClientOnly fallback={<MapLoadingFallback />}>
          {() => // Use profile from context
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

      {/* Recent Activity Section */}
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

      {!user && !isOverallLoading && !clientError && (
         <div className="p-4 bg-jdc-card rounded-lg text-center text-jdc-gray-300 mt-6">
           Veuillez vous connecter pour voir le tableau de bord.
         </div>
       )}
    </div>
  );
}
