import { jsx, jsxs } from "react/jsx-runtime";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Map$1, { Marker, Source, Layer, Popup } from "react-map-gl";
import axios from "axios";
import { g as getGeocodeFromCache, s as saveGeocodeToCache } from "./server-build-Cq7aYO1h.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkedAlt, faSpinner, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import "@remix-run/react";
import "react-dom/server";
import "@remix-run/node";
import "nprogress";
import "@fortawesome/free-brands-svg-icons";
import "@headlessui/react";
import "react-icons/fc";
import "firebase/auth";
import "firebase/app";
import "firebase/firestore";
import "firebase-admin/firestore";
import "firebase-admin/app";
import "remix-auth";
import "remix-auth-google";
import "googleapis";
import "react-dom";
import "@google/generative-ai";
import "react-markdown";
import "react-icons/fa";
const normalizeAddress$1 = (address) => {
  return address.trim().toLowerCase().replace(/\s+/g, " ");
};
const useGeoCoding = (addresses) => {
  const [coordinatesMap, setCoordinatesMap] = useState(/* @__PURE__ */ new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiKey = "b93a76ecb4b0439dbfe9e64c3c6aff07";
  const processingRef = useRef(/* @__PURE__ */ new Set());
  const addressesKey = JSON.stringify(addresses.slice().sort());
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    const geocodeBatch = async () => {
      if (!addresses || addresses.length === 0) {
        setCoordinatesMap(/* @__PURE__ */ new Map());
        setIsLoading(false);
        setError(null);
        processingRef.current.clear();
        return;
      }
      const addressesToFetch = [];
      const currentProcessing = /* @__PURE__ */ new Set();
      addresses.forEach((addr) => {
        if (!addr) return;
        const normalizedAddr = normalizeAddress$1(addr);
        if (!coordinatesMap.has(normalizedAddr) && !processingRef.current.has(normalizedAddr)) {
          addressesToFetch.push(addr);
          processingRef.current.add(normalizedAddr);
          currentProcessing.add(normalizedAddr);
        }
      });
      if (addressesToFetch.length === 0) {
        setIsLoading(false);
        const currentNormalizedAddresses = new Set(addresses.map(normalizeAddress$1));
        processingRef.current.forEach((addr) => {
          if (!currentNormalizedAddresses.has(addr)) {
            processingRef.current.delete(addr);
          }
        });
        return;
      }
      console.log(`[useGeoCoding] Batch geocoding ${addressesToFetch.length} new addresses.`);
      setIsLoading(true);
      setError(null);
      const promises = addressesToFetch.map(async (addr) => {
        var _a, _b, _c, _d;
        const normalizedAddr = normalizeAddress$1(addr);
        try {
          console.log(`[useGeoCoding] Checking cache for: "${normalizedAddr}"`);
          const cachedData = await getGeocodeFromCache(normalizedAddr);
          if (cachedData) {
            console.log(`[useGeoCoding] Cache hit for "${normalizedAddr}"`);
            return [normalizedAddr, { lat: cachedData.latitude, lng: cachedData.longitude }];
          }
          if (signal.aborted) throw new Error("Request aborted");
          console.log(`[useGeoCoding] Cache miss. Calling OpenCage API for: "${addr}"`);
          const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(addr)}&key=${apiKey}&language=fr&pretty=1`;
          const response = await axios.get(url, { signal });
          if (signal.aborted) throw new Error("Request aborted");
          if (((_b = (_a = response.data) == null ? void 0 : _a.results) == null ? void 0 : _b.length) > 0) {
            const { lat, lng } = response.data.results[0].geometry;
            console.log(`[useGeoCoding] Geocoded "${addr}" to:`, { lat, lng });
            saveGeocodeToCache(normalizedAddr, lat, lng).catch((cacheErr) => {
              console.error(`[useGeoCoding] Error storing geocode cache for "${normalizedAddr}":`, cacheErr);
            });
            return [normalizedAddr, { lat, lng }];
          } else {
            console.warn(`[useGeoCoding] No results found for address: "${addr}"`);
            return [normalizedAddr, null];
          }
        } catch (err) {
          if (axios.isCancel(err) || err.message && err.message.includes("aborted")) {
            console.log(`[useGeoCoding] Geocode request aborted for "${addr}"`);
            return [normalizedAddr, void 0];
          }
          console.error(`[useGeoCoding] Error geocoding address "${addr}":`, err);
          let errorMessage = "Erreur de géocodage";
          if (axios.isAxiosError(err)) {
            if (err.response) {
              errorMessage = `Erreur API (${err.response.status}): ${((_d = (_c = err.response.data) == null ? void 0 : _c.status) == null ? void 0 : _d.message) || "Erreur inconnue"}`;
              if (err.response.status === 401 || err.response.status === 403) errorMessage = "Clé API invalide";
              else if (err.response.status === 402) errorMessage = "Quota API dépassé";
            } else if (err.request) {
              errorMessage = "Pas de réponse du serveur";
            }
          }
          if (err.code === "permission-denied") {
            errorMessage = "Permission refusée pour l'écriture dans le cache de géocodage.";
            console.error("Firestore permission denied. Check your security rules for the 'geocodes' collection.");
          }
          setError((prev) => prev ? `${prev} | ${errorMessage}` : errorMessage);
          return [normalizedAddr, null];
        }
      });
      const results = await Promise.allSettled(promises);
      if (!signal.aborted) {
        setCoordinatesMap((prevMap) => {
          const newMap = new Map(prevMap);
          results.forEach((result) => {
            if (result.status === "fulfilled" && result.value && result.value[1] !== void 0) {
              const [normalizedAddr, coords] = result.value;
              newMap.set(normalizedAddr, coords);
            } else if (result.status === "rejected") {
              console.error("[useGeoCoding] Promise rejected:", result.reason);
            }
            if (result.status === "fulfilled" && result.value) {
              processingRef.current.delete(result.value[0]);
            }
          });
          const currentNormalizedAddresses = new Set(addresses.map(normalizeAddress$1));
          processingRef.current.forEach((addr) => {
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
        currentProcessing.forEach((addr) => processingRef.current.delete(addr));
      }
    };
    geocodeBatch();
    return () => {
      console.log("[useGeoCoding] Cleanup effect");
      abortController.abort();
    };
  }, [addressesKey, apiKey]);
  return { coordinates: coordinatesMap, isLoading, error };
};
const kmlCoordsToGeoJson = (kmlCoordString) => {
  return kmlCoordString.trim().split(/\s+/).map((pair) => {
    const coords = pair.split(",");
    return [parseFloat(coords[0]), parseFloat(coords[1])];
  }).filter((coords) => !isNaN(coords[0]) && !isNaN(coords[1]));
};
const kmlZones = [
  {
    feature: {
      type: "Feature",
      properties: { name: "Baptiste" },
      geometry: {
        type: "Polygon",
        coordinates: [
          kmlCoordsToGeoJson(`
            4.8836577,44.886044,0
            4.2842162,44.9924881,0
            3.8667357,44.7225929,0
            4.0644896,44.3231158,0
            4.646765,44.3034632,0
            5.4927123,44.1124911,0
            5.7151854,44.1834396,0
            5.4515135,44.405585,0
            5.836035,44.6894078,0
            5.4563201,44.7906117,0
            5.1425231,44.9652883,0
            5.0251067,44.94488,0
            4.8836577,44.886044,0
          `)
        ]
      }
    }
  },
  {
    feature: {
      type: "Feature",
      properties: { name: "julien Isère" },
      // Note: KML name has space
      geometry: {
        type: "Polygon",
        coordinates: [
          kmlCoordsToGeoJson(`
            5.4712372,45.0877866,0
            5.4087525,45.2146597,0
            5.3407746,45.3460764,0
            5.3579407,45.3923861,0
            5.154007,45.5084757,0
            5.1588727,45.6134865,0
            5.0592499,45.6488118,0
            4.8024445,45.5810905,0
            4.8628693,45.5253153,0
            4.7543793,45.4535917,0
            4.7548924,45.3637067,0
            4.8045044,45.3002118,0
            4.9947052,45.3475241,0
            5.1794129,45.2518931,0
            5.1505738,45.0800295,0
            5.3819733,45.0465649,0
            5.4712372,45.0877866,0
          `)
        ]
      }
    }
  },
  {
    feature: {
      type: "Feature",
      properties: { name: "Julien" },
      geometry: {
        type: "Polygon",
        coordinates: [
          kmlCoordsToGeoJson(`
            5.4607639,44.7993594,0
            5.47999,45.0836844,0
            5.3804264,45.04343,0
            5.1462803,45.0788359,0
            5.1744328,45.2507031,0
            4.9952183,45.3444058,0
            4.8029575,45.2970908,0
            4.7548924,45.3637067,0
            4.5983372,45.2912944,0
            4.4905338,45.2303966,0
            4.2852268,44.9963497,0
            4.8812351,44.8894264,0
            5.0206242,44.946315,0
            5.1435337,44.968666,0
            5.4607639,44.7993594,0
          `)
        ]
      }
    }
  },
  {
    feature: {
      type: "Feature",
      properties: { name: "Florian" },
      geometry: {
        type: "Polygon",
        coordinates: [
          kmlCoordsToGeoJson(`
            5.8179481,44.7013913,0
            6.1461645,44.8612524,0
            6.3569647,44.8558986,0
            6.3260653,45.0012533,0
            6.2072756,45.0187293,0
            6.2628937,45.1254119,0
            6.1619567,45.160767,0
            6.1303705,45.4370377,0
            5.9793082,45.5852412,0
            5.8893576,45.6020577,0
            5.6256856,45.6083024,0
            5.3626999,45.878565,0
            5.2226244,45.7661144,0
            5.0722489,45.7910165,0
            5.161513,45.6990145,0
            5.0592036,45.646717,0
            5.1615684,45.610667,0
            5.1546475,45.5049321,0
            5.3668206,45.3946213,0
            5.3482813,45.3459005,0
            5.4801178,45.0890645,0
            5.4718786,44.7959962,0
            5.8179481,44.7013913,0
          `)
        ]
      }
    }
  },
  {
    feature: {
      type: "Feature",
      properties: { name: "Matthieu" },
      geometry: {
        type: "Polygon",
        coordinates: [
          kmlCoordsToGeoJson(`
            5.811555,46.0055516,0
            5.8369609,45.9325323,0
            5.8778364,45.8310799,0
            5.9590929,45.8132902,0
            5.9993579,45.7506936,0
            6.1535045,45.7550725,0
            6.18921,45.7004294,0
            6.3128062,45.6889188,0
            6.5181132,45.9038709,0
            6.7158671,45.7248816,0
            6.8023845,45.7718382,0
            7.0440837,45.9277564,0
            6.894395,46.118946,0
            6.8113109,46.1322712,0
            6.8628093,46.2829067,0
            6.7934581,46.3279694,0
            6.8161174,46.4269768,0
            6.5201732,46.458678,0
            6.2269755,46.3146916,0
            6.309373,46.2468299,0
            5.9578105,46.1346504,0
            5.8294078,46.1065697,0
            5.811555,46.0055516,0
          `)
        ]
      }
    }
  },
  {
    feature: {
      type: "Feature",
      properties: { name: "Guillem" },
      geometry: {
        type: "Polygon",
        coordinates: [
          kmlCoordsToGeoJson(`
            5.8274262,45.9345997,0
            5.7704346,45.7264774,0
            5.6413453,45.6194831,0
            5.889911,45.6108379,0
            5.984668,45.5940239,0
            6.1350434,45.4458434,0
            6.1789887,45.1744565,0
            6.2696259,45.1376567,0
            6.4591401,45.0523449,0
            6.6376679,45.1095567,0
            7.1526521,45.251852,0
            7.185611,45.4053629,0
            6.807956,45.7648112,0
            6.7118256,45.7188075,0
            6.5181916,45.8968606,0
            6.3190644,45.6823611,0
            6.1831086,45.693873,0
            6.147403,45.7456476,0
            5.9935944,45.7446893,0
            5.9496491,45.8069479,0
            5.8741181,45.8241765,0
            5.8274262,45.9345997,0
          `)
        ]
      }
    }
  }
];
kmlZones.forEach((zone) => {
  zone.feature.geometry.coordinates.forEach((ring) => {
    if (ring.length > 0) {
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        console.warn(`[kmlZones] Polygon ring for "${zone.feature.properties.name}" was not closed. Closing it.`);
        ring.push(first);
      }
    }
  });
});
const MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoic2ltcGVyZnk0MDQiLCJhIjoiY201ZnFuNG5wMDBoejJpczZkNXMxNTBveCJ9.BM3MvMHuUkhQj91tQTChoQ";
const zoneColorMap = {
  "Baptiste": { color: "#FFEA00", opacity: 0.3 },
  // Yellow
  "julien Isère": { color: "#000000", opacity: 0.3 },
  // Black
  "Julien": { color: "#097138", opacity: 0.3 },
  // Green
  "Florian": { color: "#E65100", opacity: 0.3 },
  // Orange
  "Matthieu": { color: "#9C27B0", opacity: 0.3 },
  // Purple
  "Guillem": { color: "#9FA8DA", opacity: 0.3 }
  // Light Purple/Blue
};
const defaultZoneColor = "#3388ff";
const defaultZoneOpacity = 0.3;
const zoneFillPaint = {
  "fill-color": [
    "match",
    ["get", "name"],
    // Get the 'name' property from the feature
    "Baptiste",
    zoneColorMap["Baptiste"].color,
    "julien Isère",
    zoneColorMap["julien Isère"].color,
    "Julien",
    zoneColorMap["Julien"].color,
    "Florian",
    zoneColorMap["Florian"].color,
    "Matthieu",
    zoneColorMap["Matthieu"].color,
    "Guillem",
    zoneColorMap["Guillem"].color,
    defaultZoneColor
    // Default color
  ],
  "fill-opacity": [
    "case",
    ["boolean", ["feature-state", "hover"], false],
    // Check hover state
    0.5,
    // Opacity when hovered
    [
      // Opacity based on name when not hovered
      "match",
      ["get", "name"],
      "Baptiste",
      zoneColorMap["Baptiste"].opacity,
      "julien Isère",
      zoneColorMap["julien Isère"].opacity,
      "Julien",
      zoneColorMap["Julien"].opacity,
      "Florian",
      zoneColorMap["Florian"].opacity,
      "Matthieu",
      zoneColorMap["Matthieu"].opacity,
      "Guillem",
      zoneColorMap["Guillem"].opacity,
      defaultZoneOpacity
      // Default opacity
    ]
  ]
};
const zoneLinePaint = {
  "line-color": [
    "match",
    ["get", "name"],
    "Baptiste",
    zoneColorMap["Baptiste"].color,
    "julien Isère",
    zoneColorMap["julien Isère"].color,
    "Julien",
    zoneColorMap["Julien"].color,
    "Florian",
    zoneColorMap["Florian"].color,
    "Matthieu",
    zoneColorMap["Matthieu"].color,
    "Guillem",
    zoneColorMap["Guillem"].color,
    defaultZoneColor
  ],
  "line-width": [
    "case",
    ["boolean", ["feature-state", "hover"], false],
    4,
    // Line width when hovered
    2
    // Default line width
  ],
  "line-opacity": 0.8
};
const getMarkerColor = (status) => {
  if (!status) return "#808080";
  const statusLower = status.toLowerCase();
  if (statusLower.includes("en cours")) return "#FFA500";
  if (statusLower.includes("fermé")) return "#4CAF50";
  if (statusLower.includes("annulé")) return "#F44336";
  if (statusLower.includes("demande de rma")) return "#9C27B0";
  if (statusLower.includes("nouveau")) return "#2196F3";
  if (statusLower.includes("ouvert")) return "#FFEB3B";
  return "#808080";
};
const normalizeAddress = (address) => {
  return address.trim().toLowerCase().replace(/\s+/g, " ");
};
const InteractiveMap = ({ tickets, isLoadingTickets }) => {
  const [viewport, setViewport] = useState({
    longitude: 2.2137,
    latitude: 46.2276,
    zoom: 5.5
    // pitch, bearing, padding might be handled differently or directly on Map component in v7
  });
  const [mapError, setMapError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [hoveredZoneId, setHoveredZoneId] = useState(null);
  const mapRef = React.useRef(null);
  const uniqueAddresses = useMemo(() => {
    console.log("[InteractiveMap] Recalculating unique addresses...");
    if (!Array.isArray(tickets)) return [];
    const addresses = tickets.map((ticket) => ticket.adresse).filter((addr) => typeof addr === "string" && addr.trim() !== "");
    const uniqueSet = new Set(addresses);
    console.log(`[InteractiveMap] Found ${uniqueSet.size} unique addresses.`);
    return Array.from(uniqueSet);
  }, [tickets]);
  const { coordinates: geocodedCoordinates, isLoading: isGeocoding, error: geocodingError } = useGeoCoding(uniqueAddresses);
  const zonesGeoJson = useMemo(() => {
    console.log("[InteractiveMap] Preparing zones GeoJSON...");
    const features = kmlZones.map((zone, index) => ({
      ...zone.feature,
      id: index
      // Assign a unique ID for hover state management
    }));
    return {
      type: "FeatureCollection",
      features
      // Assert type after adding id
    };
  }, []);
  const handleMove = useCallback((evt) => {
    setViewport(evt.viewState);
  }, []);
  const handleMapLoad = useCallback(() => {
    console.log("[InteractiveMap] Map loaded.");
    if (mapRef.current && zonesGeoJson.features.length > 0) {
      console.log("[InteractiveMap] Map loaded, zones ready (bounds fitting skipped for simplicity).");
    }
  }, [zonesGeoJson]);
  const handleMouseEnterZone = useCallback((e) => {
    var _a, _b, _c;
    if (e.features && e.features.length > 0) {
      const feature = e.features[0];
      if (feature.id !== void 0 && feature.id !== hoveredZoneId) {
        if (hoveredZoneId !== null) {
          (_a = mapRef.current) == null ? void 0 : _a.setFeatureState(
            { source: "zones-source", id: hoveredZoneId },
            { hover: false }
          );
        }
        setHoveredZoneId(feature.id);
        (_b = mapRef.current) == null ? void 0 : _b.setFeatureState(
          { source: "zones-source", id: feature.id },
          { hover: true }
        );
        const mapInstance = (_c = mapRef.current) == null ? void 0 : _c.getMap();
        if (mapInstance) {
          mapInstance.getCanvas().style.cursor = "pointer";
        }
      }
    }
  }, [hoveredZoneId]);
  const handleMouseLeaveZone = useCallback(() => {
    var _a, _b;
    if (hoveredZoneId !== null) {
      (_a = mapRef.current) == null ? void 0 : _a.setFeatureState(
        { source: "zones-source", id: hoveredZoneId },
        { hover: false }
      );
    }
    setHoveredZoneId(null);
    const mapInstance = (_b = mapRef.current) == null ? void 0 : _b.getMap();
    if (mapInstance) {
      mapInstance.getCanvas().style.cursor = "";
    }
  }, [hoveredZoneId]);
  useEffect(() => {
    if (geocodingError) {
      console.error("[InteractiveMap] Geocoding Error:", geocodingError);
      setMapError((prev) => prev ? `${prev} | Erreur Géocodage: ${geocodingError}` : `Erreur Géocodage: ${geocodingError}`);
    } else {
      if (mapError == null ? void 0 : mapError.includes("Géocodage")) {
        const otherErrors = mapError.replace(/\|? Erreur Géocodage:.*?($|\|)/, "").trim();
        setMapError(otherErrors || null);
      }
    }
  }, [geocodingError, mapError]);
  const ticketMarkers = useMemo(() => {
    if (!Array.isArray(tickets) || geocodedCoordinates.size === 0) {
      return null;
    }
    console.log(`[InteractiveMap] Rendering ${tickets.length} tickets, ${geocodedCoordinates.size} geocoded.`);
    return tickets.map((ticket) => {
      const originalAddress = ticket.adresse;
      if (!originalAddress || typeof originalAddress !== "string" || originalAddress.trim() === "") return null;
      const normalizedAddr = normalizeAddress(originalAddress);
      const coordinates = geocodedCoordinates.get(normalizedAddr);
      if (coordinates) {
        const markerColor = getMarkerColor(ticket.statut);
        return /* @__PURE__ */ jsx(
          Marker,
          {
            longitude: coordinates.lng,
            latitude: coordinates.lat,
            anchor: "center",
            onClick: (e) => {
              if (e.originalEvent) {
                e.originalEvent.stopPropagation();
              }
              setSelectedTicket(ticket);
            },
            children: /* @__PURE__ */ jsx("div", { style: {
              backgroundColor: markerColor,
              width: "15px",
              height: "15px",
              borderRadius: "50%",
              border: "2px solid white",
              boxShadow: "0 0 5px rgba(0,0,0,0.5)",
              cursor: "pointer"
            } })
          },
          ticket.id
        );
      }
      return null;
    }).filter(Boolean);
  }, [tickets, geocodedCoordinates]);
  return /* @__PURE__ */ jsxs("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg relative min-h-[450px]", children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold text-white mb-3 flex items-center", children: [
      /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faMapMarkedAlt, className: "mr-2 text-jdc-yellow" }),
      "Carte des Tickets Récents (Mapbox)"
    ] }),
    (isLoadingTickets || isGeocoding && geocodedCoordinates.size === 0 && uniqueAddresses.length > 0) && /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-[500] flex items-center justify-center bg-jdc-card bg-opacity-75 rounded-lg", children: [
      /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faSpinner, spin: true, className: "text-jdc-yellow text-3xl mr-2" }),
      /* @__PURE__ */ jsx("span", { className: "text-white", children: isLoadingTickets ? "Chargement des tickets..." : "Géocodage des adresses..." })
    ] }),
    isGeocoding && !isLoadingTickets && /* @__PURE__ */ jsx("div", { className: "absolute top-16 right-4 z-[1000] text-jdc-yellow", title: "Géocodage en cours...", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faSpinner, spin: true }) }),
    mapError && !isLoadingTickets && !isGeocoding && /* @__PURE__ */ jsxs("div", { className: "absolute top-12 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-800 text-white px-4 py-2 rounded text-sm shadow-lg flex items-center", children: [
      /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faExclamationTriangle, className: "mr-2" }),
      mapError
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `w-full h-[450px] rounded-lg overflow-hidden ${isLoadingTickets || isGeocoding && geocodedCoordinates.size === 0 && uniqueAddresses.length > 0 ? "opacity-50" : ""}`,
        style: { backgroundColor: "#4a4a4a" },
        children: /* @__PURE__ */ jsxs(
          Map$1,
          {
            ref: mapRef,
            latitude: viewport.latitude,
            longitude: viewport.longitude,
            zoom: viewport.zoom,
            onMove: handleMove,
            onLoad: handleMapLoad,
            mapboxAccessToken: MAPBOX_ACCESS_TOKEN,
            mapStyle: "mapbox://styles/mapbox/streets-v11",
            style: { width: "100%", height: "100%" },
            onMouseEnter: handleMouseEnterZone,
            onMouseLeave: handleMouseLeaveZone,
            interactiveLayerIds: ["zones-fill-layer"],
            children: [
              /* @__PURE__ */ jsxs(Source, { id: "zones-source", type: "geojson", data: zonesGeoJson, generateId: true, children: [
                /* @__PURE__ */ jsx(
                  Layer,
                  {
                    id: "zones-fill-layer",
                    type: "fill",
                    source: "zones-source",
                    paint: zoneFillPaint
                  }
                ),
                /* @__PURE__ */ jsx(
                  Layer,
                  {
                    id: "zones-line-layer",
                    type: "line",
                    source: "zones-source",
                    paint: zoneLinePaint
                  }
                )
              ] }),
              ticketMarkers,
              selectedTicket && geocodedCoordinates.get(normalizeAddress(selectedTicket.adresse || "")) && /* @__PURE__ */ jsx(
                Popup,
                {
                  longitude: geocodedCoordinates.get(normalizeAddress(selectedTicket.adresse || "")).lng,
                  latitude: geocodedCoordinates.get(normalizeAddress(selectedTicket.adresse || "")).lat,
                  anchor: "bottom",
                  onClose: () => setSelectedTicket(null),
                  closeOnClick: false,
                  offset: 15,
                  children: /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("b", { children: selectedTicket.raisonSociale || "Client inconnu" }),
                    /* @__PURE__ */ jsx("br", {}),
                    selectedTicket.adresse,
                    /* @__PURE__ */ jsx("br", {}),
                    "Statut: ",
                    selectedTicket.statut || "Non défini",
                    /* @__PURE__ */ jsx("br", {}),
                    "ID: ",
                    selectedTicket.id
                  ] })
                }
              )
            ]
          }
        )
      }
    )
  ] });
};
export {
  InteractiveMap as default
};
