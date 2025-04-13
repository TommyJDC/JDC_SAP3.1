import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { getGeocodeFromCache, saveGeocodeToCache } from '~/services/firestore.service.server';
import type { GeocodeCacheEntry } from '~/types/firestore.types';

// API response interfaces
interface OpenCageResult {
  geometry: { lat: number; lng: number };
  formatted: string;
}
interface OpenCageResponse {
  results: OpenCageResult[];
  status: { code: number; message: string };
}

// Type for individual geocode result
type Coordinates = { lat: number; lng: number } | null;

// Return type of the hook
interface UseGeoCodingResult {
  coordinates: Map<string, Coordinates>; // Map from normalized address to Coordinates
  isLoading: boolean;
  error: string | null;
}

// Normalize address
const normalizeAddress = (address: string): string => {
  return address.trim().toLowerCase().replace(/\s+/g, ' ');
};

const useGeoCoding = (addresses: string[]): UseGeoCodingResult => {
  const [coordinatesMap, setCoordinatesMap] = useState<Map<string, Coordinates>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const apiKey = "b93a76ecb4b0439dbfe9e64c3c6aff07"; // Hardcoded API Key
  const processingRef = useRef<Set<string>>(new Set());

  const addressesKey = JSON.stringify(addresses.slice().sort());

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const geocodeBatch = async () => {
      if (!addresses || addresses.length === 0) {
        setCoordinatesMap(new Map());
        setIsLoading(false);
        setError(null);
        processingRef.current.clear();
        return;
      }

      if (!apiKey) {
        console.error("OpenCage API Key is missing (hardcoded value)");
        setError('API Key missing');
        setIsLoading(false);
        return;
      }

      const addressesToFetch: string[] = [];
      const currentProcessing = new Set<string>();

      addresses.forEach(addr => {
        if (!addr) return;
        const normalizedAddr = normalizeAddress(addr);
        if (!coordinatesMap.has(normalizedAddr) && !processingRef.current.has(normalizedAddr)) {
          addressesToFetch.push(addr);
          processingRef.current.add(normalizedAddr);
          currentProcessing.add(normalizedAddr);
        }
      });

      if (addressesToFetch.length === 0) {
        setIsLoading(false);
        const currentNormalizedAddresses = new Set(addresses.map(normalizeAddress));
        processingRef.current.forEach(addr => {
            if (!currentNormalizedAddresses.has(addr)) {
                processingRef.current.delete(addr);
            }
        });
        return;
      }

      console.log(`[useGeoCoding] Batch geocoding ${addressesToFetch.length} new addresses.`);
      setIsLoading(true);
      setError(null);

      const promises = addressesToFetch.map(async (addr): Promise<[string, Coordinates]> => {
        const normalizedAddr = normalizeAddress(addr);
        try {
          // 1. Check Firestore Cache (using getGeocodeFromCache which now uses 'geocodes')
          console.log(`[useGeoCoding] Checking cache for: "${normalizedAddr}"`);
          const cachedData = await getGeocodeFromCache(normalizedAddr);
          if (cachedData) {
            console.log(`[useGeoCoding] Cache hit for "${normalizedAddr}"`);
            return [normalizedAddr, { lat: cachedData.latitude, lng: cachedData.longitude }];
          }

          // 2. Cache miss - Call OpenCageData API
          if (signal.aborted) throw new Error('Request aborted');
          console.log(`[useGeoCoding] Cache miss. Calling OpenCage API for: "${addr}"`);
          const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(addr)}&key=${apiKey}&language=fr&pretty=1`;
          const response = await axios.get<OpenCageResponse>(url, { signal });

          if (signal.aborted) throw new Error('Request aborted');

          if (response.data?.results?.length > 0) {
            const { lat, lng } = response.data.results[0].geometry;
            console.log(`[useGeoCoding] Geocoded "${addr}" to:`, { lat, lng });
            // 3. Store result in Firestore Cache (using saveGeocodeToCache which now uses 'geocodes')
            saveGeocodeToCache(normalizedAddr, lat, lng).catch(cacheErr => {
              console.error(`[useGeoCoding] Error storing geocode cache for "${normalizedAddr}":`, cacheErr);
            });
            return [normalizedAddr, { lat, lng }];
          } else {
            console.warn(`[useGeoCoding] No results found for address: "${addr}"`);
            // Optionally save null to cache to prevent re-querying
            // saveGeocodeToCache(normalizedAddr, null, null).catch(...)
            return [normalizedAddr, null];
          }
        } catch (err: any) {
          if (axios.isCancel(err) || (err.message && err.message.includes('aborted'))) {
             console.log(`[useGeoCoding] Geocode request aborted for "${addr}"`);
             return [normalizedAddr, null]; // Return null for aborted requests, matching Coordinates type
          }
          console.error(`[useGeoCoding] Error geocoding address "${addr}":`, err);
          let errorMessage = 'Erreur de géocodage';
           if (axios.isAxiosError(err)) {
             if (err.response) {
               errorMessage = `Erreur API (${err.response.status}): ${err.response.data?.status?.message || 'Erreur inconnue'}`;
               if (err.response.status === 401 || err.response.status === 403) errorMessage = 'Clé API invalide';
               else if (err.response.status === 402) errorMessage = 'Quota API dépassé';
             } else if (err.request) {
               errorMessage = 'Pas de réponse du serveur';
             }
           }
          // Check if the error is specifically a Firestore permission error
          if (err.code === 'permission-denied') {
             errorMessage = "Permission refusée pour l'écriture dans le cache de géocodage.";
             console.error("Firestore permission denied. Check your security rules for the 'geocodes' collection.");
          }
          setError(prev => prev ? `${prev} | ${errorMessage}` : errorMessage);
          return [normalizedAddr, null];
        }
      });

      const results = await Promise.allSettled(promises);

      if (!signal.aborted) {
        setCoordinatesMap(prevMap => {
          const newMap = new Map(prevMap);
          results.forEach(result => {
            if (result.status === 'fulfilled' && result.value && result.value[1] !== undefined) {
              const [normalizedAddr, coords] = result.value;
              newMap.set(normalizedAddr, coords);
            } else if (result.status === 'rejected') {
              console.error("[useGeoCoding] Promise rejected:", result.reason);
            }
            // Remove processed addresses from the processing ref
            if (result.status === 'fulfilled' && result.value) {
                 processingRef.current.delete(result.value[0]);
            }
            // Simplified removal for rejected/aborted for now
            // else if (result.status === 'rejected') {
            //    // Need a way to map rejection back to address if not handled inside promise
            // }
          });
           const currentNormalizedAddresses = new Set(addresses.map(normalizeAddress));
           processingRef.current.forEach(addr => {
               if (!currentNormalizedAddresses.has(addr)) {
                   processingRef.current.delete(addr);
               }
           });
          return newMap;
        });
        setIsLoading(false);
      } else {
         console.log("[useGeoCoding] Effect aborted, skipping state update.");
      }

       if (signal.aborted) {
           currentProcessing.forEach(addr => processingRef.current.delete(addr));
       }

    };

    geocodeBatch();

    return () => {
      console.log("[useGeoCoding] Cleanup effect");
      abortController.abort();
    };
  }, [addressesKey, apiKey]); // Dependencies

  return { coordinates: coordinatesMap, isLoading: isLoading, error: error };
};

export default useGeoCoding;
