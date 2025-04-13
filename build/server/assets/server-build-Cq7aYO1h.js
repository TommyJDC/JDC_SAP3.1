import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { RemixServer, Link, NavLink, Form, Meta, Links, ScrollRestoration, Scripts, useLoaderData, useLocation, useNavigation, Outlet, useOutletContext, useSearchParams } from "@remix-run/react";
import { renderToString } from "react-dom/server";
import React, { Fragment as Fragment$1, createContext, useContext, useState, useRef, useCallback, Suspense, useEffect, forwardRef, useMemo, lazy } from "react";
import { createCookieSessionStorage, json, redirect } from "@remix-run/node";
import * as NProgress from "nprogress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTachometerAlt, faTicketAlt, faTruck, faSearch, faChevronDown, faSheetPlastic, faCog, faUserCircle, faSignOutAlt, faSignInAlt, faTimes, faSpinner, faExclamationTriangle, faInfoCircle, faExclamationCircle, faCheckCircle, faTicket, faFilter, faUserTag, faChevronRight, faCalendarAlt, faPhone, faChevronUp, faUserTie, faMapMarkerAlt, faTruckFast, faBuilding, faTrash, faExternalLinkAlt, faUsers, faCalendarDays, faMapMarkedAlt, faTrashAlt, faPlus } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { Menu, Transition } from "@headlessui/react";
import { FcGoogle } from "react-icons/fc";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getApps, initializeApp, getApp } from "firebase/app";
import { getFirestore, Timestamp, doc, getDoc } from "firebase/firestore";
import { getFirestore as getFirestore$1, Timestamp as Timestamp$1, FieldValue } from "firebase-admin/firestore";
import { getApps as getApps$1, initializeApp as initializeApp$1 } from "firebase-admin/app";
import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";
import { google } from "googleapis";
import ReactDOM from "react-dom";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import { FaSpinner } from "react-icons/fa";
function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  const markup = renderToString(
    /* @__PURE__ */ jsx(RemixServer, { context: remixContext, url: request.url })
  );
  responseHeaders.set("Content-Type", "text/html");
  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const nProgressStyles = "/assets/nprogress-CSXic_Zd.css";
const globalStylesUrl = "/assets/global-D58Idb-N.css";
const tailwindStylesUrl = "/assets/tailwind-g1v49q2T.css";
const mapboxStylesUrl = "/assets/mapbox-gl-B9eh9OLo.css";
const baseStyles = "inline-flex items-center justify-center font-semibold rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-jdc-black transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-100 ease-in-out active:scale-95";
const variantStyles = {
  primary: "bg-jdc-yellow text-jdc-black hover:bg-yellow-300 focus:ring-jdc-yellow",
  secondary: "bg-jdc-card text-jdc-gray-300 border border-jdc-gray-800 hover:bg-jdc-gray-800 focus:ring-jdc-gray-400",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  ghost: "bg-transparent text-jdc-gray-300 hover:bg-jdc-gray-800 focus:ring-jdc-gray-400"
};
const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg"
};
const Button = ({
  as = "button",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  ...props
}) => {
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  const content = /* @__PURE__ */ jsxs(Fragment, { children: [
    isLoading ? /* @__PURE__ */ jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
      /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
      /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
    ] }) : leftIcon && /* @__PURE__ */ jsx("span", { className: "mr-2 -ml-1", children: React.cloneElement(leftIcon, { className: "h-5 w-5" }) }),
    children,
    !isLoading && rightIcon && /* @__PURE__ */ jsx("span", { className: "ml-2 -mr-1", children: React.cloneElement(rightIcon, { className: "h-5 w-5" }) })
  ] });
  if (as === "link") {
    const { to, reloadDocument, replace, state, preventScrollReset, relative, ...restLinkProps } = props;
    return /* @__PURE__ */ jsx(
      Link,
      {
        to,
        reloadDocument,
        replace,
        state,
        preventScrollReset,
        relative,
        className: combinedClassName,
        "aria-disabled": disabled || isLoading,
        ...restLinkProps,
        children: content
      }
    );
  }
  const { type = "button", onClick, ...restButtonProps } = props;
  return /* @__PURE__ */ jsx(
    "button",
    {
      type,
      className: combinedClassName,
      disabled: disabled || isLoading,
      onClick,
      ...restButtonProps,
      children: content
    }
  );
};
const navItems$1 = [
  { name: "Tableau de Bord", to: "/dashboard", icon: faTachometerAlt },
  { name: "Tickets SAP", to: "/tickets-sap", icon: faTicketAlt },
  { name: "Envois CTN", to: "/envois-ctn", icon: faTruck },
  { name: "Recherche Articles", to: "/articles", icon: faSearch }
  // Removed 'Install Kezia'
];
const installationItems = [
  { name: "Kezia", to: "/installations/kezia", disabled: false, icon: faSheetPlastic },
  // Added icon
  { name: "CHR", to: "#", disabled: true, icon: faSheetPlastic },
  // Placeholder link
  { name: "HACCP", to: "#", disabled: true, icon: faSheetPlastic },
  // Placeholder link
  { name: "Tabac", to: "#", disabled: true, icon: faSheetPlastic }
  // Placeholder link
];
const adminItem$1 = { name: "Admin", to: "/admin", icon: faCog };
const JDC_LOGO_URL$1 = "https://www.jdc.fr/images/logo_jdc_blanc.svg";
const Header = ({ user, profile, onToggleMobileMenu, onLoginClick, loadingAuth }) => {
  var _a, _b;
  const linkActiveClass = "text-jdc-yellow";
  const linkInactiveClass = "text-jdc-gray-300 hover:text-jdc-yellow transition-colors";
  const menuButtonClass = `${linkInactiveClass} font-medium flex items-center transition-transform duration-200 ease-in-out hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`;
  const menuItemBaseClass = "group flex w-full items-center rounded-md px-3 py-2 text-sm";
  const showAdminLink = !loadingAuth && ((_a = profile == null ? void 0 : profile.role) == null ? void 0 : _a.toLowerCase()) === "admin";
  return /* @__PURE__ */ jsx("header", { className: "bg-jdc-blue-dark border-b border-jdc-gray-800 py-3 px-4 md:px-6 sticky top-0 z-40", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4 md:space-x-6", children: [
      /* @__PURE__ */ jsx(Link, { to: user ? "/dashboard" : "/", className: "flex-shrink-0", children: /* @__PURE__ */ jsx("img", { src: JDC_LOGO_URL$1, alt: "JDC Logo", className: "h-8 w-auto" }) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onToggleMobileMenu,
          className: "md:hidden text-jdc-gray-300 hover:text-white focus:outline-none",
          "aria-label": "Ouvrir le menu",
          children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faBars, size: "lg" })
        }
      ),
      user && !loadingAuth && /* @__PURE__ */ jsxs("nav", { className: "hidden md:flex space-x-6 items-center", children: [
        navItems$1.map((item) => /* @__PURE__ */ jsxs(
          NavLink,
          {
            to: item.to,
            className: ({ isActive }) => `${isActive ? linkActiveClass : linkInactiveClass} font-medium flex items-center transition-transform duration-200 ease-in-out hover:scale-105`,
            prefetch: "intent",
            children: [
              /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: item.icon, className: "mr-1.5" }),
              item.name
            ]
          },
          item.to
        )),
        /* @__PURE__ */ jsxs(Menu, { as: "div", className: "relative inline-block text-left", children: [
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Menu.Button, { className: menuButtonClass, children: [
            /* @__PURE__ */ jsx("span", { children: "Installations" }),
            /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faChevronDown, className: "ml-1.5 h-4 w-4", "aria-hidden": "true" })
          ] }) }),
          /* @__PURE__ */ jsx(
            Transition,
            {
              as: Fragment$1,
              enter: "transition ease-out duration-100",
              enterFrom: "transform opacity-0 scale-95",
              enterTo: "transform opacity-100 scale-100",
              leave: "transition ease-in duration-75",
              leaveFrom: "transform opacity-100 scale-100",
              leaveTo: "transform opacity-0 scale-95",
              children: /* @__PURE__ */ jsx(Menu.Items, { className: "absolute left-0 mt-2 w-48 origin-top-left divide-y divide-jdc-gray-700 rounded-md bg-jdc-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50", children: /* @__PURE__ */ jsx("div", { className: "px-1 py-1 ", children: installationItems.map((item) => /* @__PURE__ */ jsx(Menu.Item, { disabled: item.disabled, children: ({ active, disabled }) => /* @__PURE__ */ jsxs(
                NavLink,
                {
                  to: item.to,
                  className: `${menuItemBaseClass} ${active ? "bg-jdc-blue text-white" : "text-jdc-gray-300"} ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-jdc-gray-700 hover:text-white"}`,
                  onClick: (e) => {
                    if (disabled) e.preventDefault();
                  },
                  "aria-disabled": disabled,
                  children: [
                    /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: item.icon, className: "mr-2 h-5 w-5", "aria-hidden": "true" }),
                    item.name,
                    disabled && /* @__PURE__ */ jsx("span", { className: "text-xs ml-1 opacity-75", children: "(Bientôt)" })
                  ]
                }
              ) }, item.name)) }) })
            }
          )
        ] }),
        showAdminLink && /* @__PURE__ */ jsxs(
          NavLink,
          {
            to: adminItem$1.to,
            className: ({ isActive }) => `${isActive ? linkActiveClass : linkInactiveClass} font-medium flex items-center transition-transform duration-200 ease-in-out hover:scale-105`,
            children: [
              /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: adminItem$1.icon, className: "mr-1.5" }),
              adminItem$1.name
            ]
          }
        )
      ] }),
      loadingAuth && /* @__PURE__ */ jsx("div", { className: "hidden md:block text-jdc-gray-400 text-sm", children: "Chargement..." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-3", children: loadingAuth ? /* @__PURE__ */ jsx("div", { className: "h-8 w-20 bg-jdc-gray-700 rounded animate-pulse" }) : user ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("span", { className: "text-jdc-gray-300 hidden sm:inline", title: user.email ?? "", children: [
        /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faUserCircle, className: "mr-1" }),
        (profile == null ? void 0 : profile.displayName) || user.displayName || ((_b = user.email) == null ? void 0 : _b.split("@")[0]) || "Utilisateur"
      ] }),
      /* @__PURE__ */ jsx(Form, { method: "post", action: "/logout", children: /* @__PURE__ */ jsxs(Button, { type: "submit", variant: "secondary", size: "sm", title: "Déconnexion", children: [
        /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faSignOutAlt }),
        /* @__PURE__ */ jsx("span", { className: "sr-only sm:not-sr-only sm:ml-1", children: "Déconnexion" })
      ] }) })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "primary", size: "sm", onClick: onLoginClick, leftIcon: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faSignInAlt }), children: "Connexion" }),
      /* @__PURE__ */ jsx(Form, { method: "post", action: "/auth/google", children: /* @__PURE__ */ jsx(Button, { type: "submit", variant: "secondary", size: "sm", leftIcon: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faGoogle }), children: /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Google" }) }) })
    ] }) })
  ] }) });
};
const navItems = [
  { name: "Tableau de Bord", to: "/dashboard", icon: faTachometerAlt },
  { name: "Tickets SAP", to: "/tickets-sap", icon: faTicketAlt },
  { name: "Envois CTN", to: "/envois-ctn", icon: faTruck }
];
const adminItem = { name: "Admin", to: "/admin", icon: faCog };
const JDC_LOGO_URL = "https://www.jdc.fr/images/logo_jdc_blanc.svg";
const MobileMenu = ({ isOpen, onClose, user, profile, onLoginClick, loadingAuth }) => {
  var _a, _b;
  const linkActiveClass = "text-jdc-yellow bg-jdc-gray-800";
  const linkInactiveClass = "text-jdc-gray-300 hover:text-white hover:bg-jdc-gray-700";
  const linkBaseClass = "flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors";
  const showAdminLink = !loadingAuth && ((_a = profile == null ? void 0 : profile.role) == null ? void 0 : _a.toLowerCase()) === "admin";
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden",
      onClick: onClose,
      "aria-hidden": "true",
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "fixed inset-y-0 left-0 w-64 bg-jdc-blue-darker shadow-xl z-50 flex flex-col",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-jdc-gray-800", children: [
              /* @__PURE__ */ jsx(Link, { to: user ? "/dashboard" : "/", onClick: onClose, children: /* @__PURE__ */ jsx("img", { src: JDC_LOGO_URL, alt: "JDC Logo", className: "h-8 w-auto" }) }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: onClose,
                  className: "text-jdc-gray-400 hover:text-white focus:outline-none",
                  "aria-label": "Fermer le menu",
                  children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTimes, size: "lg" })
                }
              )
            ] }),
            /* @__PURE__ */ jsx("nav", { className: "flex-1 px-2 py-4 space-y-1", children: loadingAuth ? /* @__PURE__ */ jsx("div", { className: "px-3 py-2 text-jdc-gray-400", children: "Chargement..." }) : user ? /* @__PURE__ */ jsxs(Fragment, { children: [
              navItems.map((item) => /* @__PURE__ */ jsxs(
                NavLink,
                {
                  to: item.to,
                  onClick: onClose,
                  className: ({ isActive }) => `${linkBaseClass} ${isActive ? linkActiveClass : linkInactiveClass}`,
                  prefetch: "intent",
                  children: [
                    /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: item.icon, className: "mr-3 h-5 w-5" }),
                    item.name
                  ]
                },
                item.to
              )),
              showAdminLink && /* @__PURE__ */ jsxs(
                NavLink,
                {
                  to: adminItem.to,
                  onClick: onClose,
                  className: ({ isActive }) => `${linkBaseClass} ${isActive ? linkActiveClass : linkInactiveClass}`,
                  children: [
                    /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: adminItem.icon, className: "mr-3 h-5 w-5" }),
                    adminItem.name
                  ]
                }
              )
            ] }) : /* @__PURE__ */ jsx("div", { className: "px-3 py-2 text-jdc-gray-400", children: "Veuillez vous connecter." }) }),
            /* @__PURE__ */ jsx("div", { className: "border-t border-jdc-gray-800 p-4", children: loadingAuth ? /* @__PURE__ */ jsx("div", { className: "h-10 bg-jdc-gray-700 rounded animate-pulse" }) : user ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 text-sm text-jdc-gray-300", children: [
              /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faUserCircle, className: "h-6 w-6" }),
              /* @__PURE__ */ jsx("span", { className: "truncate", title: user.email ?? "", children: (profile == null ? void 0 : profile.displayName) || user.displayName || ((_b = user.email) == null ? void 0 : _b.split("@")[0]) })
            ] }) }) : /* @__PURE__ */ jsx(Button, { variant: "primary", size: "sm", onClick: () => {
              onLoginClick();
              onClose();
            }, className: "w-full", leftIcon: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faSignInAlt }), children: "Connexion" }) })
          ]
        }
      )
    }
  );
};
const firebaseConfig = {
  apiKey: "AIzaSyADAy8ySvJsUP5diMyR9eIUgtPFimpydcA",
  // Replace with env var process.env.REACT_APP_FIREBASE_API_KEY
  authDomain: "sap-jdc.firebaseapp.com",
  // Replace with env var
  databaseURL: "https://sap-jdc-default-rtdb.europe-west1.firebasedatabase.app",
  // Replace with env var if using RTDB
  projectId: "sap-jdc",
  // Replace with env var
  storageBucket: "sap-jdc.appspot.com",
  // Corrected based on your example
  messagingSenderId: "1079234336489",
  // Replace with env var
  appId: "1:1079234336489:web:2428621b62a393068ec278",
  // Replace with env var
  measurementId: "G-PRWSK0TEFZ"
  // Optional, replace with env var
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const frenchMonths = {
  "janvier": 0,
  "février": 1,
  "mars": 2,
  "avril": 3,
  "mai": 4,
  "juin": 5,
  "juillet": 6,
  "août": 7,
  "septembre": 8,
  "octobre": 9,
  "novembre": 10,
  "décembre": 11
};
const parseFrenchDate = (dateInput) => {
  const originalInputForLog = dateInput;
  if (!dateInput) {
    return null;
  }
  if (dateInput instanceof Timestamp) {
    try {
      const date = dateInput.toDate();
      if (!isNaN(date.getTime())) {
        return date;
      } else {
        console.warn("[parseFrenchDate] Timestamp.toDate() resulted in Invalid Date. Original input:", originalInputForLog);
        return null;
      }
    } catch (e) {
      console.error(`[parseFrenchDate] Error converting Timestamp:`, e, "Original input:", originalInputForLog);
      return null;
    }
  }
  if (dateInput instanceof Date) {
    if (!isNaN(dateInput.getTime())) {
      return dateInput;
    } else {
      console.warn("[parseFrenchDate] Received an Invalid Date object directly. Original input:", originalInputForLog);
      return null;
    }
  }
  if (typeof dateInput === "string") {
    const dateString = dateInput;
    const cleanedString = dateString.toLowerCase().replace(/^\w+\s/, "").trim();
    const parts = cleanedString.split(" ");
    if (parts.length === 3) {
      const dayStr = parts[0];
      const monthStr = parts[1];
      const yearStr = parts[2];
      const day = parseInt(dayStr, 10);
      const year = parseInt(yearStr, 10);
      const monthIndex = frenchMonths[monthStr];
      if (!isNaN(day) && !isNaN(year) && monthIndex !== void 0) {
        try {
          const date = new Date(Date.UTC(year, monthIndex, day));
          if (date.getUTCFullYear() === year && date.getUTCMonth() === monthIndex && date.getUTCDate() === day) {
            return date;
          } else {
            console.warn(`[parseFrenchDate] Date object creation resulted in mismatch for French string. Original input: "${originalInputForLog}"`);
          }
        } catch (e) {
          console.error(`[parseFrenchDate] Error creating Date object for French string: "${originalInputForLog}":`, e);
          return null;
        }
      } else {
        console.warn(`[parseFrenchDate] Failed to parse numeric components from French string: day=${dayStr}, month=${monthStr}, year=${yearStr}. Original input: "${originalInputForLog}"`);
      }
    } else {
      console.warn(`[parseFrenchDate] Unexpected format after cleaning French string: "${cleanedString}". Original input: "${originalInputForLog}"`);
    }
    try {
      const parsedDate = new Date(dateString);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    } catch (e) {
    }
    console.warn(`[parseFrenchDate] All parsing attempts failed for string. Original input: "${originalInputForLog}"`);
    return null;
  }
  console.warn(`[parseFrenchDate] Received unexpected input type: ${typeof dateInput}. Original input:`, originalInputForLog);
  return null;
};
const formatDateForDisplay = (date) => {
  if (!date || isNaN(date.getTime())) {
    return "N/A";
  }
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};
const getWeekDateRangeForAgenda = (today = /* @__PURE__ */ new Date()) => {
  const currentDay = today.getUTCDay();
  let daysToAdd = 0;
  if (currentDay === 6) {
    daysToAdd = 2;
  } else if (currentDay === 0) {
    daysToAdd = 1;
  } else {
    daysToAdd = 1 - currentDay;
  }
  const startOfWeek = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + daysToAdd));
  startOfWeek.setUTCHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
  endOfWeek.setUTCHours(23, 59, 59, 999);
  return { startOfWeek, endOfWeek };
};
let dbAdmin;
if (getApps$1().length === 0) {
  console.log("[FirebaseAdminConfig] No existing apps found. Initializing Firebase Admin SDK...");
  try {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.warn("[FirebaseAdminConfig] WARNING: GOOGLE_APPLICATION_CREDENTIALS environment variable not set. Admin SDK might not authenticate properly.");
    }
    initializeApp$1();
    console.log("[FirebaseAdminConfig] Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error("[FirebaseAdminConfig] CRITICAL: Failed to initialize Firebase Admin SDK:", error);
    throw new Error("Failed to initialize Firebase Admin SDK");
  }
} else {
  console.log("[FirebaseAdminConfig] Firebase Admin SDK already initialized.");
}
try {
  dbAdmin = getFirestore$1();
} catch (error) {
  console.error("[FirebaseAdminConfig] CRITICAL: Failed to get Firestore instance from Admin SDK:", error);
  throw new Error("Failed to get Firestore instance from Admin SDK. Ensure initialization succeeded.");
}
const correctTicketStatus = (ticketData) => {
  var _a;
  let currentStatus = ticketData.statut;
  const demandeSAPLower = ((_a = ticketData.demandeSAP) == null ? void 0 : _a.toLowerCase()) ?? "";
  const needsRmaStatus = demandeSAPLower.includes("demande de rma");
  const isNotRmaStatus = currentStatus !== "Demande de RMA";
  let correctedStatus = currentStatus;
  let needsUpdate = false;
  if (needsRmaStatus && isNotRmaStatus) {
    correctedStatus = "Demande de RMA";
    needsUpdate = true;
  } else if (!currentStatus && !needsRmaStatus) {
    correctedStatus = "Nouveau";
    needsUpdate = true;
  }
  return { correctedStatus: correctedStatus ?? null, needsUpdate };
};
const getUserProfileSdk = async (id) => {
  var _a;
  if (!id) return null;
  console.log(`[FirestoreService Admin] Getting profile for ID: ${id}`);
  try {
    const userDocRef = dbAdmin.collection("users").doc(id);
    const userDocSnap = await userDocRef.get();
    if (userDocSnap.exists) {
      const data = userDocSnap.data();
      const createdAt = data.createdAt instanceof Timestamp$1 ? data.createdAt.toDate() : void 0;
      const updatedAt = data.updatedAt instanceof Timestamp$1 ? data.updatedAt.toDate() : void 0;
      return {
        uid: id,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        secteurs: data.secteurs,
        createdAt,
        updatedAt
      };
    } else {
      console.log(`[FirestoreService Admin] No profile found for ID: ${id}`);
      throw new Error(`User profile not found for ID: ${id}`);
    }
  } catch (error) {
    console.error(`[FirestoreService Admin] Error fetching user profile for ID ${id}:`, error);
    if ((_a = error.message) == null ? void 0 : _a.includes("not found")) {
      throw error;
    }
    throw new Error(`Impossible de récupérer le profil utilisateur (ID: ${id}). Cause: ${error.message || error}`);
  }
};
const createUserProfileSdk = async (id, email, displayName, initialRole = "Technician") => {
  if (!id || !email || !displayName) {
    throw new Error("ID, email, and display name are required to create a profile.");
  }
  console.log(`[FirestoreService Admin] Creating profile for ID: ${id}, Email: ${email}`);
  try {
    const userDocRef = dbAdmin.collection("users").doc(id);
    const docSnap = await userDocRef.get();
    if (docSnap.exists) {
      console.warn(`[FirestoreService Admin] Profile already exists for ID: ${id}. Overwriting.`);
    }
    const newUserProfileDataBase = {
      email,
      displayName,
      role: initialRole,
      secteurs: []
    };
    await userDocRef.set({
      ...newUserProfileDataBase,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
      // Also set updatedAt on creation
    });
    console.log(`[FirestoreService Admin] User profile created/updated successfully for ID: ${id}`);
    return { uid: id, ...newUserProfileDataBase };
  } catch (error) {
    console.error(`[FirestoreService Admin] Error creating user profile for ID ${id}:`, error);
    if (error.code === 7 || error.code === "PERMISSION_DENIED") {
      console.error("[FirestoreService Admin] CRITICAL: Firestore permission denied during profile creation. Check service account permissions and Firestore rules.");
      throw new Error("Permission refusée par Firestore lors de la création du profil.");
    }
    throw new Error(`Impossible de créer le profil utilisateur (ID: ${id}). Cause: ${error.message || error}`);
  }
};
const updateUserProfileSdk = async (uid, data) => {
  if (!uid || !data || Object.keys(data).length === 0) {
    console.warn("[FirestoreService Admin] Update user profile called with invalid UID or empty data.");
    return;
  }
  console.log(`[FirestoreService Admin] Updating profile for UID: ${uid}`);
  try {
    const userDocRef = dbAdmin.collection("users").doc(uid);
    const updateData = { ...data, updatedAt: FieldValue.serverTimestamp() };
    await userDocRef.update(updateData);
    console.log(`[FirestoreService Admin] User profile updated successfully for UID: ${uid}`);
  } catch (error) {
    console.error(`[FirestoreService Admin] Error updating user profile for UID ${uid}:`, error);
    if (error.code === 7 || error.code === "PERMISSION_DENIED") {
      console.error("[FirestoreService Admin] CRITICAL: Firestore permission denied during profile update.");
      throw new Error("Permission refusée par Firestore lors de la mise à jour du profil.");
    }
    throw new Error(`Impossible de mettre à jour le profil utilisateur (UID: ${uid}). Cause: ${error.message || error}`);
  }
};
const getAllUserProfilesSdk = async () => {
  console.log("[FirestoreService Admin] Fetching all user profiles...");
  try {
    const usersCollectionRef = dbAdmin.collection("users");
    const q = usersCollectionRef.orderBy("email");
    const querySnapshot = await q.get();
    const profiles = querySnapshot.docs.map((doc2) => {
      const data = doc2.data();
      const createdAt = data.createdAt instanceof Timestamp$1 ? data.createdAt.toDate() : void 0;
      const updatedAt = data.updatedAt instanceof Timestamp$1 ? data.updatedAt.toDate() : void 0;
      return {
        uid: doc2.id,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        secteurs: data.secteurs,
        createdAt,
        updatedAt
      };
    });
    console.log(`[FirestoreService Admin] Fetched ${profiles.length} profiles.`);
    return profiles;
  } catch (error) {
    console.error("[FirestoreService Admin] Error fetching all user profiles:", error);
    throw new Error(`Impossible de récupérer la liste des utilisateurs. Cause: ${error.message || error}`);
  }
};
const addArticleImageUrl = async (articleId, imageUrl) => {
  if (!articleId || !imageUrl) {
    throw new Error("Article ID and image URL are required.");
  }
  console.log(`[FirestoreService Admin] Adding image URL to article ${articleId}...`);
  try {
    const articleDocRef = dbAdmin.collection("articles").doc(articleId);
    await articleDocRef.update({
      imageUrls: FieldValue.arrayUnion(imageUrl)
    });
    console.log(`[FirestoreService Admin] Image URL successfully added to article ${articleId}.`);
  } catch (error) {
    console.error(`[FirestoreService Admin] Error adding image URL to article ${articleId}:`, error);
    if (error.code === 7 || error.code === "PERMISSION_DENIED") {
      throw new Error("Permission refusée pour mettre à jour l'article.");
    } else if (error.code === 5 || error.code === "NOT_FOUND") {
      throw new Error(`L'article avec l'ID ${articleId} n'a pas été trouvé.`);
    }
    throw new Error(`Impossible d'ajouter l'URL de l'image à l'article : ${error.message || error.code}`);
  }
};
const deleteArticleImageUrl = async (articleId, imageUrl) => {
  if (!articleId || !imageUrl) {
    throw new Error("Article ID and image URL are required for deletion.");
  }
  console.log(`[FirestoreService Admin] Removing image URL from article ${articleId}...`);
  try {
    const articleDocRef = dbAdmin.collection("articles").doc(articleId);
    await articleDocRef.update({
      imageUrls: FieldValue.arrayRemove(imageUrl)
    });
    console.log(`[FirestoreService Admin] Image URL successfully removed from article ${articleId}.`);
  } catch (error) {
    console.error(`[FirestoreService Admin] Error removing image URL from article ${articleId}:`, error);
    if (error.code === 7 || error.code === "PERMISSION_DENIED") {
      throw new Error("Permission refusée pour mettre à jour l'article.");
    } else if (error.code === 5 || error.code === "NOT_FOUND") {
      throw new Error(`L'article avec l'ID ${articleId} n'a pas été trouvé.`);
    }
    throw new Error(`Impossible de supprimer l'URL de l'image de l'article : ${error.message || error.code}`);
  }
};
const searchArticles = async (criteria) => {
  const { code, nom } = criteria;
  const trimmedCode = code == null ? void 0 : code.trim();
  const trimmedNom = nom == null ? void 0 : nom.trim();
  const nomUppercase = trimmedNom == null ? void 0 : trimmedNom.toUpperCase();
  console.log(`[FirestoreService Admin] Searching articles with criteria:`, { code: trimmedCode, nom: trimmedNom });
  if (!trimmedCode && !trimmedNom) {
    console.log("[FirestoreService Admin] No search criteria provided for articles.");
    return [];
  }
  const articlesCollection = dbAdmin.collection("articles");
  const resultsMap = /* @__PURE__ */ new Map();
  try {
    if (trimmedCode) {
      const codeQuery = articlesCollection.where("Code", "==", trimmedCode);
      console.log(`[FirestoreService Admin] Executing Code exact match query for: "${trimmedCode}"`);
      const codeSnapshot = await codeQuery.get();
      console.log(`[FirestoreService Admin] Code query found ${codeSnapshot.docs.length} matches.`);
      codeSnapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.Code && data.Désignation) {
          resultsMap.set(docSnap.id, { id: docSnap.id, ...data });
        } else {
          console.warn(`[FirestoreService Admin] Document ${docSnap.id} matched by Code is missing 'Code' or 'Désignation'.`);
        }
      });
    }
    if (nomUppercase) {
      const endTerm = nomUppercase + "";
      const designationQuery = articlesCollection.orderBy("Désignation").startAt(nomUppercase).endAt(endTerm);
      console.log(`[FirestoreService Admin] Executing Désignation prefix query (uppercase) for: "${nomUppercase}"`);
      const designationSnapshot = await designationQuery.get();
      console.log(`[FirestoreService Admin] Désignation query found ${designationSnapshot.docs.length} potential matches.`);
      designationSnapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.Code && data.Désignation) {
          resultsMap.set(docSnap.id, { id: docSnap.id, ...data });
        } else {
          console.warn(`[FirestoreService Admin] Document ${docSnap.id} matched by Désignation is missing 'Code' or 'Désignation'.`);
        }
      });
    }
    const combinedResults = Array.from(resultsMap.values());
    console.log(`[FirestoreService Admin] Article search completed. Found ${combinedResults.length} unique articles.`);
    return combinedResults;
  } catch (error) {
    console.error("[FirestoreService Admin] Error executing article search:", error);
    if (error.code === 9 || error.code === "FAILED_PRECONDITION") {
      console.error("[FirestoreService Admin] Firestore Error: Likely missing a composite index. Check the Firestore console error message for a link to create it. You'll likely need an index on 'Désignation' (ascending).");
      throw new Error("Erreur Firestore: Index manquant requis pour la recherche par nom (sur 'Désignation'). Vérifiez la console Firebase.");
    }
    throw new Error(`Échec de la recherche d'articles. Cause: ${error.message || error}`);
  }
};
const updateSAPTICKET = async (sectorId, ticketId, data) => {
  if (!sectorId || !ticketId || !data || Object.keys(data).length === 0) {
    console.warn("[FirestoreService Admin] updateSAPTICKET called with invalid sectorId, ticketId, or empty data.");
    throw new Error("Identifiants de secteur/ticket ou données de mise à jour manquants.");
  }
  console.log(`[FirestoreService Admin] Attempting to update ticket ${ticketId} in sector ${sectorId} with data:`, data);
  try {
    const ticketDocRef = dbAdmin.collection(sectorId).doc(ticketId);
    const updateData = { ...data };
    if ("date" in updateData) delete updateData.date;
    await ticketDocRef.update(updateData);
    console.log(`[FirestoreService Admin] Successfully updated ticket ${ticketId} in sector ${sectorId}.`);
  } catch (error) {
    console.error(`[FirestoreService Admin] Error updating ticket ${ticketId} in sector ${sectorId}:`, error);
    if (error.code === 7 || error.code === "PERMISSION_DENIED") {
      console.error(`[FirestoreService Admin] CRITICAL: Firestore permission denied for update operation on collection '${sectorId}'. Check service account permissions and Firestore rules.`);
      throw new Error(`Permission refusée par Firestore pour la mise à jour dans le secteur ${sectorId}.`);
    } else if (error.code === 5 || error.code === "NOT_FOUND") {
      console.error(`[FirestoreService Admin] Error: Document ${ticketId} not found in collection ${sectorId}.`);
      throw new Error(`Le ticket ${ticketId} n'a pas été trouvé dans le secteur ${sectorId}.`);
    }
    throw new Error(`Impossible de mettre à jour le ticket SAP ${ticketId}. Cause: ${error.message || error}`);
  }
};
const getRecentTicketsForSectors = async (sectors, count = 5) => {
  if (!sectors || sectors.length === 0) return [];
  console.log(`[FirestoreService Admin] Fetching recent tickets for sectors: ${sectors.join(", ")}`);
  const ticketPromises = sectors.map(async (sector) => {
    try {
      const sectorCollectionRef = dbAdmin.collection(sector);
      const q = sectorCollectionRef.orderBy("date", "desc").limit(count);
      const querySnapshot = await q.get();
      return querySnapshot.docs.map((doc2) => {
        const data = doc2.data();
        const parsedDate = parseFrenchDate(data.date);
        const { correctedStatus } = correctTicketStatus(data);
        return {
          id: doc2.id,
          ...data,
          statut: correctedStatus ?? data.statut,
          secteur: sector,
          date: parsedDate
        };
      });
    } catch (error) {
      console.error(`[FirestoreService Admin] Error fetching tickets for sector ${sector}:`, error);
      if (error.code === 9 || error.code === "FAILED_PRECONDITION") {
        console.error(`[FirestoreService Admin] Index missing for ticket query in sector ${sector} (likely on 'date' desc).`);
      }
      return [];
    }
  });
  try {
    const resultsBySector = await Promise.all(ticketPromises);
    const allTickets = resultsBySector.flat();
    allTickets.sort((a, b) => {
      if (!(b.date instanceof Date)) return -1;
      if (!(a.date instanceof Date)) return 1;
      return b.date.getTime() - a.date.getTime();
    });
    console.log(`[FirestoreService Admin] Found ${allTickets.length} tickets across sectors, returning top ${count}`);
    return allTickets.slice(0, count);
  } catch (error) {
    console.error("[FirestoreService Admin] Error merging ticket results:", error);
    throw new Error("Impossible de récupérer les tickets récents.");
  }
};
const getAllTicketsForSectorsSdk = async (sectors) => {
  if (!sectors || sectors.length === 0) {
    console.log("[FirestoreService Admin] getAllTicketsForSectorsSdk: No sectors provided, returning [].");
    return [];
  }
  console.log(`[FirestoreService Admin] Fetching ALL tickets (one-time) for sectors: ${sectors.join(", ")}`);
  const ticketPromises = sectors.map(async (sector) => {
    try {
      const sectorCollectionRef = dbAdmin.collection(sector);
      const q = sectorCollectionRef.orderBy("date", "desc");
      const querySnapshot = await q.get();
      console.log(`[FirestoreService Admin] Fetched ${querySnapshot.size} tickets for sector ${sector}.`);
      return querySnapshot.docs.map((doc2) => {
        const data = doc2.data();
        const parsedDate = parseFrenchDate(data.date);
        const { correctedStatus } = correctTicketStatus(data);
        return {
          id: doc2.id,
          ...data,
          statut: correctedStatus ?? data.statut,
          secteur: sector,
          date: parsedDate
        };
      });
    } catch (error) {
      console.error(`[FirestoreService Admin] Error fetching ALL tickets for sector ${sector}:`, error);
      if (error.code === 9 || error.code === "FAILED_PRECONDITION") {
        console.error(`[FirestoreService Admin] Index missing for ticket query in sector ${sector} (likely on 'date' desc).`);
      }
      return [];
    }
  });
  try {
    const resultsBySector = await Promise.all(ticketPromises);
    const allTickets = resultsBySector.flat();
    allTickets.sort((a, b) => {
      if (!(b.date instanceof Date)) return -1;
      if (!(a.date instanceof Date)) return 1;
      return b.date.getTime() - a.date.getTime();
    });
    console.log(`[FirestoreService Admin] Fetched a total of ${allTickets.length} tickets across all specified sectors.`);
    return allTickets;
  } catch (error) {
    console.error("[FirestoreService Admin] Error merging ALL ticket results:", error);
    throw new Error("Impossible de récupérer tous les tickets SAP pour les secteurs spécifiés.");
  }
};
const getTotalTicketCountSdk = async (sectors) => {
  if (!sectors || sectors.length === 0) {
    console.log("[FirestoreService Admin] getTotalTicketCountSdk: No sectors provided, returning 0.");
    return 0;
  }
  console.log(`[FirestoreService Admin] Counting total tickets via aggregate for sectors: ${sectors.join(", ")}`);
  const countPromises = sectors.map(async (sector) => {
    try {
      const sectorCollectionRef = dbAdmin.collection(sector);
      const snapshot = await sectorCollectionRef.count().get();
      const count = snapshot.data().count;
      console.log(`[FirestoreService Admin] Counted ${count} docs for sector ${sector}.`);
      return count;
    } catch (error) {
      console.error(`[FirestoreService Admin] Error counting tickets via aggregate for sector ${sector}:`, error);
      return 0;
    }
  });
  try {
    const counts = await Promise.all(countPromises);
    const totalCount = counts.reduce((sum, count) => sum + count, 0);
    console.log(`[FirestoreService Admin] Total ticket count via aggregate across sectors: ${totalCount}`);
    return totalCount;
  } catch (error) {
    console.error("[FirestoreService Admin] Error summing ticket counts from aggregate:", error);
    throw new Error("Impossible de calculer le nombre total de tickets.");
  }
};
const getAllShipments = async (userProfile) => {
  if (!userProfile) {
    console.log("[FirestoreService Admin][getAllShipments] Cannot fetch shipments, user profile is null.");
    return [];
  }
  console.log(`[FirestoreService Admin][getAllShipments] Fetching shipments for user: ${userProfile.uid}, Role: ${userProfile.role}`);
  const shipmentsCollectionRef = dbAdmin.collection("Envoi");
  let q;
  try {
    const userSectors = userProfile.secteurs ?? [];
    if (userProfile.role === "Admin") {
      console.log("[FirestoreService Admin][getAllShipments] Admin user. Fetching ALL shipments.");
      q = shipmentsCollectionRef.orderBy("nomClient");
    } else {
      if (userSectors.length === 0) {
        console.log(`[FirestoreService Admin][getAllShipments] Non-admin user ${userProfile.uid} has no assigned sectors. Returning empty list.`);
        return [];
      }
      console.log(`[FirestoreService Admin][getAllShipments] Non-admin user. Querying sectors: ${userSectors.join(", ")}`);
      q = shipmentsCollectionRef.where("secteur", "in", userSectors).orderBy("nomClient");
    }
    console.log("[FirestoreService Admin][getAllShipments] Executing query...");
    const querySnapshot = await q.get();
    console.log(`[FirestoreService Admin][getAllShipments] Query successful. Fetched ${querySnapshot.size} documents.`);
    const shipments = querySnapshot.docs.map((doc2) => {
      const data = doc2.data();
      const dateCreation = data.dateCreation instanceof Timestamp$1 ? data.dateCreation.toDate() : void 0;
      return { id: doc2.id, ...data, dateCreation };
    });
    return shipments;
  } catch (error) {
    console.error("[FirestoreService Admin][getAllShipments] Error fetching shipments:", error);
    if (error.code === 7 || error.code === "PERMISSION_DENIED") {
      console.error("[FirestoreService Admin][getAllShipments] CRITICAL: Firestore permission denied. Check service account permissions and Firestore rules.");
      throw new Error("Permission refusée par Firestore. Vérifiez les règles de sécurité.");
    } else if (error.code === 9 || error.code === "FAILED_PRECONDITION") {
      console.error("[FirestoreService Admin][getAllShipments] CRITICAL: Firestore query requires an index. Check Firestore console.");
      throw new Error("Index Firestore manquant. Vérifiez la console Firestore.");
    } else {
      throw new Error(`Impossible de récupérer la liste des envois. Cause: ${error.message || error}`);
    }
  }
};
const getRecentShipmentsForSectors = async (sectors, count = 5) => {
  const fetchAllSectors = !sectors || sectors.length === 0;
  if (fetchAllSectors) {
    console.log(`[FirestoreService Admin] Fetching ${count} recent shipments across ALL sectors (Admin view).`);
  } else {
    console.log(`[FirestoreService Admin] Fetching ${count} recent shipments for sectors: ${sectors.join(", ")}`);
  }
  try {
    const shipmentsCollectionRef = dbAdmin.collection("Envoi");
    let q;
    const baseQuery = shipmentsCollectionRef.orderBy("dateCreation", "desc").limit(count);
    if (fetchAllSectors) {
      q = baseQuery;
    } else {
      if (sectors.length > 0) {
        q = baseQuery.where("secteur", "in", sectors);
      } else {
        console.warn("[FirestoreService Admin] getRecentShipmentsForSectors: Non-admin called with empty sectors array unexpectedly. Returning [].");
        return [];
      }
    }
    const querySnapshot = await q.get();
    const shipments = querySnapshot.docs.map((doc2) => {
      const data = doc2.data();
      const dateCreation = data.dateCreation instanceof Timestamp$1 ? data.dateCreation.toDate() : void 0;
      return {
        id: doc2.id,
        ...data,
        dateCreation
      };
    });
    console.log(`[FirestoreService Admin] Fetched ${shipments.length} recent shipments matching criteria.`);
    return shipments;
  } catch (error) {
    console.error("[FirestoreService Admin] Error fetching recent shipments:", error);
    if (error.code === 9 || error.code === "FAILED_PRECONDITION") {
      console.error("[FirestoreService Admin] CRITICAL: Firestore query requires an index (likely on dateCreation desc). Check Firestore console.");
      throw new Error("Index Firestore manquant (probablement sur dateCreation). Vérifiez la console Firestore.");
    }
    throw new Error(`Impossible de récupérer les envois récents. Cause: ${error.message || error}`);
  }
};
const getAllShipmentsForSectors = async (sectors, isAdmin) => {
  console.log(`[FirestoreService Admin] getAllShipmentsForSectors: Fetching ALL shipments. Admin: ${isAdmin}, Sectors: ${sectors.join(", ")}`);
  try {
    const shipmentsCollectionRef = dbAdmin.collection("Envoi");
    let q;
    if (isAdmin) {
      console.log("[FirestoreService Admin] getAllShipmentsForSectors: Admin detected, fetching all documents.");
      q = shipmentsCollectionRef;
    } else {
      if (!sectors || sectors.length === 0) {
        console.log("[FirestoreService Admin] getAllShipmentsForSectors: Non-admin with no sectors, returning [].");
        return [];
      }
      console.log(`[FirestoreService Admin] getAllShipmentsForSectors: Non-admin, fetching for sectors: ${sectors.join(", ")}`);
      q = shipmentsCollectionRef.where("secteur", "in", sectors);
    }
    const querySnapshot = await q.get();
    const shipments = querySnapshot.docs.map((doc2) => {
      const data = doc2.data();
      const dateCreation = data.dateCreation instanceof Timestamp$1 ? data.dateCreation.toDate() : void 0;
      return { id: doc2.id, ...data, dateCreation };
    });
    console.log(`[FirestoreService Admin] getAllShipmentsForSectors: Fetched ${shipments.length} total shipments.`);
    return shipments;
  } catch (error) {
    console.error("[FirestoreService Admin] Error fetching all shipments for sectors:", error);
    if (error.code === 9 || error.code === "FAILED_PRECONDITION") {
      console.error("[FirestoreService Admin] CRITICAL: Firestore query requires an index. Check Firestore console.");
      throw new Error("Index Firestore manquant. Vérifiez la console Firestore.");
    }
    throw new Error(`Impossible de récupérer tous les envois pour les secteurs. Cause: ${error.message || error}`);
  }
};
const getDistinctClientCountFromEnvoiSdk = async (userProfile) => {
  if (!userProfile) {
    console.log("[FirestoreService Admin] getDistinctClientCountFromEnvoiSdk: No user profile provided, returning 0.");
    return 0;
  }
  const isAdmin = userProfile.role === "Admin";
  const userSectors = userProfile.secteurs ?? [];
  console.warn(`[FirestoreService Admin] Calculating distinct client count from 'Envoi' documents. Admin: ${isAdmin}, Sectors: ${userSectors.join(", ")}. This can be inefficient.`);
  try {
    const accessibleShipments = await getAllShipmentsForSectors(userSectors, isAdmin);
    console.log(`[FirestoreService Admin] getDistinctClientCountFromEnvoiSdk: Fetched ${accessibleShipments.length} accessible shipments.`);
    if (accessibleShipments.length === 0) {
      console.log("[FirestoreService Admin] getDistinctClientCountFromEnvoiSdk: No accessible shipments found, returning 0 distinct clients.");
      return 0;
    }
    const uniqueClientIdentifiers = /* @__PURE__ */ new Set();
    accessibleShipments.forEach((shipment) => {
      let clientIdentifier = null;
      if (shipment.codeClient && String(shipment.codeClient).trim() !== "") {
        clientIdentifier = String(shipment.codeClient).trim();
      } else if (shipment.nomClient && String(shipment.nomClient).trim() !== "") {
        clientIdentifier = String(shipment.nomClient).trim();
      }
      if (clientIdentifier) {
        uniqueClientIdentifiers.add(clientIdentifier);
      }
    });
    const count = uniqueClientIdentifiers.size;
    console.log(`[FirestoreService Admin] getDistinctClientCountFromEnvoiSdk: Found ${count} distinct clients from accessible 'Envoi' documents.`);
    return count;
  } catch (error) {
    console.error("[FirestoreService Admin] getDistinctClientCountFromEnvoiSdk: Error calculating distinct client count:", error);
    throw new Error("Impossible de compter les clients distincts depuis les envois.");
  }
};
const deleteShipmentSdk = async (shipmentId) => {
  if (!shipmentId) {
    throw new Error("Shipment ID is required to delete.");
  }
  console.log(`[FirestoreService Admin] Attempting to delete shipment with ID: ${shipmentId}`);
  try {
    const shipmentDocRef = dbAdmin.collection("Envoi").doc(shipmentId);
    await shipmentDocRef.delete();
    console.log(`[FirestoreService Admin] Successfully deleted shipment: ${shipmentId}`);
  } catch (error) {
    console.error(`[FirestoreService Admin] Error deleting shipment ${shipmentId}:`, error);
    if (error.code === 7 || error.code === "PERMISSION_DENIED") {
      console.error("[FirestoreService Admin] CRITICAL: Firestore permission denied for delete operation.");
      throw new Error("Permission refusée par Firestore pour la suppression.");
    }
    throw new Error(`Impossible de supprimer l'envoi. Cause: ${error.message || error}`);
  }
};
const getLatestStatsSnapshotsSdk = async (count = 1) => {
  console.log(`[FirestoreService Admin] Fetching latest ${count} stats snapshot(s) from 'dailyStatsSnapshots'...`);
  try {
    const snapshotsCollectionRef = dbAdmin.collection("dailyStatsSnapshots");
    const q = snapshotsCollectionRef.orderBy("timestamp", "desc").limit(count);
    const querySnapshot = await q.get();
    const snapshots = querySnapshot.docs.map((doc2) => {
      const data = doc2.data();
      const timestamp = data.timestamp instanceof Timestamp$1 ? data.timestamp.toDate() : data.timestamp ? new Date(data.timestamp) : /* @__PURE__ */ new Date(0);
      return {
        id: doc2.id,
        timestamp,
        totalTickets: data.totalTickets ?? 0,
        activeShipments: data.activeShipments ?? 0,
        activeClients: data.activeClients ?? 0
      };
    });
    console.log(`[FirestoreService Admin] Fetched ${snapshots.length} snapshot(s).`);
    return snapshots;
  } catch (error) {
    console.error("[FirestoreService Admin] Error fetching latest stats snapshots:", error);
    if (error.code === 9 || error.code === "FAILED_PRECONDITION") {
      console.error("[FirestoreService Admin] CRITICAL: Firestore query requires an index (likely on timestamp desc). Check Firestore console.");
      throw new Error("Index Firestore manquant (probablement sur timestamp). Vérifiez la console Firestore.");
    }
    throw new Error(`Impossible de récupérer le dernier snapshot de statistiques. Cause: ${error.message || error}`);
  }
};
const GEOCODE_COLLECTION_NAME = "geocodes";
const getGeocodeFromCache = async (address) => {
  console.log(`[FirestoreService Admin] Getting geocode cache for address: ${address}`);
  try {
    const cacheDocRef = dbAdmin.collection(GEOCODE_COLLECTION_NAME).doc(address);
    const docSnap = await cacheDocRef.get();
    if (docSnap.exists) {
      const data = docSnap.data();
      console.log(`[FirestoreService Admin] Geocode cache hit for address: ${address}`);
      return { latitude: data.latitude, longitude: data.longitude };
    } else {
      console.log(`[FirestoreService Admin] Geocode cache miss for address: ${address}`);
      return null;
    }
  } catch (error) {
    console.error("[FirestoreService Admin] Error getting geocode from cache:", error);
    return null;
  }
};
const saveGeocodeToCache = async (address, latitude, longitude) => {
  console.log(`[FirestoreService Admin] Saving geocode cache for address: ${address}`);
  try {
    const cacheDocRef = dbAdmin.collection(GEOCODE_COLLECTION_NAME).doc(address);
    const cacheEntry = {
      latitude,
      longitude,
      timestamp: FieldValue.serverTimestamp()
    };
    await cacheDocRef.set(cacheEntry);
    console.log(`[FirestoreService Admin] Geocode saved to cache for address: ${address}`);
  } catch (error) {
    console.error("[FirestoreService Admin] Error saving geocode to cache:", error);
    if (error.code === 7 || error.code === "PERMISSION_DENIED") {
      console.error("[FirestoreService Admin] CRITICAL: Firestore permission denied saving geocode cache.");
    }
  }
};
const mapFirebaseUserToAppUser = (firebaseUser) => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName
  };
};
const signInWithGoogle = async () => {
  var _a;
  const provider = new GoogleAuthProvider();
  try {
    console.log("[AuthService] Attempting Google Sign-In Popup...");
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    console.log(`[AuthService] Google Sign-In successful for: ${firebaseUser.uid} (${firebaseUser.email})`);
    try {
      console.log(`[AuthService] Checking for existing Firestore profile for: ${firebaseUser.uid}`);
      await getUserProfileSdk(firebaseUser.uid);
      console.log(`[AuthService] Firestore profile found for: ${firebaseUser.uid}`);
    } catch (profileError) {
      if (((_a = profileError.message) == null ? void 0 : _a.includes("not found")) || profileError.code === "not-found") {
        console.log(`[AuthService] No Firestore profile found for ${firebaseUser.uid}. Creating one...`);
        try {
          await createUserProfileSdk(
            firebaseUser.uid,
            firebaseUser.email || `no-email-${firebaseUser.uid}@example.com`,
            // Provide fallback email if null
            firebaseUser.displayName || "Utilisateur Google",
            // Use Google display name or fallback
            "Technician"
            // Default role for new Google users
          );
          console.log(`[AuthService] Firestore profile created successfully for Google user: ${firebaseUser.uid}`);
        } catch (creationError) {
          console.error(`[AuthService] CRITICAL: Failed to create Firestore profile for Google user ${firebaseUser.uid} after successful auth:`, creationError);
        }
      } else {
        console.error(`[AuthService] Error checking Firestore profile for ${firebaseUser.uid}:`, profileError);
        throw new Error("Erreur lors de la vérification du profil utilisateur.");
      }
    }
    return mapFirebaseUserToAppUser(firebaseUser);
  } catch (error) {
    console.error("[AuthService] Google Sign In Error:", error);
    const authError = error;
    if (authError.code === "auth/popup-closed-by-user") {
      throw new Error("Connexion Google annulée.");
    } else if (authError.code === "auth/account-exists-with-different-credential") {
      throw new Error("Un compte existe déjà avec cet email mais avec une méthode de connexion différente.");
    } else if (authError.code === "auth/cancelled-popup-request") {
      throw new Error("Multiples tentatives de connexion Google détectées. Veuillez réessayer.");
    }
    throw new Error("Erreur lors de la connexion avec Google. Veuillez réessayer.");
  }
};
const ToastContext = createContext(void 0);
const ToastProvider = ({
  children
}) => {
  const [toasts, setToasts] = useState([]);
  const toastIdCounter = useRef(0);
  const addToast = useCallback((toastData) => {
    const id = (toastIdCounter.current++).toString();
    let message = "";
    let type = "info";
    let title = void 0;
    if (typeof toastData === "string") {
      message = toastData;
    } else if (toastData == null ? void 0 : toastData.message) {
      message = toastData.message;
      title = toastData.title;
      type = toastData.type || "info";
    } else {
      console.warn("Toast data invalide:", toastData);
      message = "Notification sans message";
      type = "warning";
    }
    const newToast = {
      id,
      message,
      type,
      ...title && { title }
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, 5e3);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);
  return /* @__PURE__ */ jsx(ToastContext.Provider, { value: { toasts, addToast, removeToast }, children });
};
const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
const AuthModal = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useToast();
  if (!isOpen) return null;
  const handleClose = () => {
    setError(null);
    setIsLoading(false);
    setIsGoogleLoading(false);
    onClose();
  };
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      addToast({ type: "success", message: `Connecté avec Google: ${user.displayName || user.email}` });
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur de connexion Google.";
      setError(message);
      addToast({ type: "error", message });
    } finally {
      setIsGoogleLoading(false);
    }
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4",
      onClick: handleClose,
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "auth-modal-title",
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-jdc-card p-6 md:p-8 rounded-lg shadow-xl relative w-full max-w-md",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleClose,
                className: "absolute top-3 right-3 text-jdc-gray-400 hover:text-white focus:outline-none",
                "aria-label": "Fermer la modal",
                children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTimes, size: "lg" })
              }
            ),
            /* @__PURE__ */ jsx("h2", { id: "auth-modal-title", className: "text-2xl font-semibold text-white mb-6 text-center", children: "Connexion" }),
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "secondary",
                className: "w-full mb-4 flex items-center justify-center gap-2 border border-jdc-gray-600 hover:bg-jdc-gray-700",
                onClick: handleGoogleSignIn,
                isLoading: isGoogleLoading,
                disabled: isLoading || isGoogleLoading,
                children: [
                  isGoogleLoading ? /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faSpinner, spin: true }) : /* @__PURE__ */ jsx(FcGoogle, { size: 20 }),
                  /* @__PURE__ */ jsx("span", { children: "Se connecter avec Google" })
                ]
              }
            )
          ]
        }
      )
    }
  );
};
const toastConfig = {
  success: {
    icon: faCheckCircle,
    bgClass: "bg-green-600",
    iconColor: "text-green-100",
    textColor: "text-green-50",
    progressClass: "bg-green-200"
  },
  error: {
    icon: faExclamationCircle,
    bgClass: "bg-red-600",
    iconColor: "text-red-100",
    textColor: "text-red-50",
    progressClass: "bg-red-200"
  },
  info: {
    icon: faInfoCircle,
    bgClass: "bg-blue-600",
    iconColor: "text-blue-100",
    textColor: "text-blue-50",
    progressClass: "bg-blue-200"
  },
  warning: {
    icon: faExclamationTriangle,
    bgClass: "bg-yellow-500",
    iconColor: "text-yellow-100",
    textColor: "text-yellow-50",
    progressClass: "bg-yellow-200"
  }
};
const Toast = ({ toast, onClose }) => {
  const config = toastConfig[toast.type];
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `max-w-sm w-full ${config.bgClass} shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden mb-3 transition-all duration-300 ease-in-out`,
      role: "alert",
      "aria-live": "assertive",
      "aria-atomic": "true",
      children: /* @__PURE__ */ jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: config.icon, className: `h-6 w-6 ${config.iconColor}`, "aria-hidden": "true" }) }),
        /* @__PURE__ */ jsxs("div", { className: "ml-3 w-0 flex-1 pt-0.5", children: [
          /* @__PURE__ */ jsx("p", { className: `text-sm font-medium ${config.textColor}`, children: toast.title }),
          /* @__PURE__ */ jsx("p", { className: `mt-1 text-sm ${config.textColor} opacity-90`, children: toast.message })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "ml-4 flex-shrink-0 flex", children: /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => onClose(toast.id),
            className: `inline-flex rounded-md ${config.bgClass} ${config.textColor} opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${toast.type}-600 focus:ring-white`,
            children: [
              /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Fermer" }),
              /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTimes, className: "h-5 w-5", "aria-hidden": "true" })
            ]
          }
        ) })
      ] }) })
    }
  );
};
const ToastContainerComponent = () => {
  const { toasts, removeToast } = useToast();
  if (!toasts.length) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 flex flex-col items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-end z-50 space-y-3", children: toasts.map((toast) => /* @__PURE__ */ jsx(Toast, { toast, onClose: removeToast }, toast.id)) });
};
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set as an environment variable");
}
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    // use any name you want
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
    // enable this in prod
    maxAge: 60 * 60 * 24 * 30
    // 30 days
  }
});
const { getSession, commitSession, destroySession } = sessionStorage;
const authenticator = new Authenticator(sessionStorage, {
  // Throw errors instead of redirecting to `/login` on failure
  throwOnError: true
});
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const appBaseUrl = process.env.APP_BASE_URL;
if (!googleClientId || !googleClientSecret || !appBaseUrl) {
  throw new Error(
    "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and APP_BASE_URL must be set in .env"
  );
}
const googleCallbackUrl = `${appBaseUrl}/auth/google/callback`;
authenticator.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackUrl,
      // Define the scopes needed for Google APIs
      // Ensure these scopes are enabled in your Google Cloud Console project
      scope: [
        "openid",
        // Required for OpenID Connect
        "email",
        // Get user's email address
        "profile",
        // Get user's basic profile info (name, picture)
        "https://www.googleapis.com/auth/drive",
        // Full access to Drive (adjust if needed)
        "https://www.googleapis.com/auth/calendar",
        // Full access to Calendar (adjust if needed)
        "https://www.googleapis.com/auth/gmail.modify"
        // Read/write access to Gmail (adjust if needed)
      ].join(" "),
      // Request offline access to get a refresh token
      accessType: "offline",
      // Prompt for consent every time to ensure refresh token is always sent (useful during development)
      // In production, you might remove this or set to 'auto' after the first consent
      prompt: "consent"
    },
    async ({
      accessToken,
      refreshToken,
      extraParams,
      // Contains token expiry (expires_in)
      profile
      // User profile from Google
    }) => {
      var _a, _b, _c, _d, _e, _f;
      console.log("[Auth Server] Google Strategy Callback triggered");
      console.log("[Auth Server] Profile ID:", profile.id);
      console.log("[Auth Server] Profile Email:", (_b = (_a = profile.emails) == null ? void 0 : _a[0]) == null ? void 0 : _b.value);
      console.log("[Auth Server] Access Token received:", !!accessToken);
      console.log("[Auth Server] Refresh Token received:", !!refreshToken);
      const email = (_d = (_c = profile.emails) == null ? void 0 : _c[0]) == null ? void 0 : _d.value;
      const displayName = profile.displayName || "Utilisateur Google";
      const googleId = profile.id;
      if (!email) {
        throw new Error("Email not found in Google profile.");
      }
      if (!email.endsWith("@jdc.fr")) {
        throw new Error("Seuls les emails @jdc.fr sont autorisés.");
      }
      let userProfile;
      try {
        try {
          console.log(`[Auth Server] Attempting to find Firestore profile for Google ID: ${googleId}`);
          await getUserProfileSdk(googleId);
          console.log(`[Auth Server] Firestore profile found for Google ID: ${googleId}`);
        } catch (profileError) {
          if (((_e = profileError.message) == null ? void 0 : _e.includes("not found")) || profileError.code === "not-found" || ((_f = profileError.message) == null ? void 0 : _f.includes("simulation"))) {
            console.log(`[Auth Server] Firestore profile for Google ID ${googleId} not found. Attempting creation...`);
            try {
              await createUserProfileSdk(
                googleId,
                // Using Google ID as the user ID here - NEEDS REVIEW/ADAPTATION
                email,
                displayName,
                "Technician"
                // Or determine role based on logic
                // Add googleId field if modifying existing structure
              );
              console.log(`[Auth Server] Firestore profile created successfully for Google ID: ${googleId}`);
            } catch (creationError) {
              console.error(`[Auth Server] FAILED to create Firestore profile for Google ID ${googleId} (Email: ${email}). Error:`, creationError);
            }
          } else {
            console.error(`[Auth Server] Unexpected error looking up Firestore profile for Google ID ${googleId}:`, profileError);
          }
        }
        userProfile = {
          userId: googleId,
          // Using Google ID
          email,
          displayName,
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken,
          // Calculate expiry time (extraParams.expires_in is in seconds)
          tokenExpiry: Date.now() + extraParams.expires_in * 1e3
        };
      } catch (error) {
        console.error("[Auth Server] Error finding/creating user profile:", error);
        throw new Error("Failed to process user profile.");
      }
      console.log("[Auth Server] Returning userProfile to authenticator:", userProfile);
      return userProfile;
    }
  )
);
const links = () => [
  // Google Fonts - Roboto
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" },
  // App Styles
  { rel: "stylesheet", href: tailwindStylesUrl },
  { rel: "stylesheet", href: globalStylesUrl },
  { rel: "stylesheet", href: nProgressStyles },
  { rel: "stylesheet", href: mapboxStylesUrl }
  // Add Mapbox GL CSS here
];
const loader$9 = async ({ request }) => {
  console.log("Root Loader: Checking authentication state via remix-auth.");
  const userSession = await authenticator.isAuthenticated(request);
  console.log("Root Loader: Returning data:", { user: userSession });
  return json({ user: userSession });
};
const action$2 = async ({ request }) => {
  const formData = await request.formData();
  const action2 = formData.get("_action");
  console.warn("Root Action: Received unexpected action:", action2);
  return json({ ok: false, error: "Invalid root action" }, { status: 400 });
};
async function getClientUserProfile(userId) {
  if (!userId) return null;
  console.log(`[getClientUserProfile] Fetching profile client-side for ID: ${userId}`);
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : void 0;
      const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : void 0;
      console.log(`[getClientUserProfile] Profile found for ID: ${userId}`);
      return {
        uid: userId,
        // Use the passed userId as uid
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        secteurs: data.secteurs,
        createdAt,
        updatedAt
      };
    } else {
      console.warn(`[getClientUserProfile] No profile found for ID: ${userId}`);
      return null;
    }
  } catch (error) {
    console.error(`[getClientUserProfile] Error fetching profile for ID ${userId}:`, error);
    throw new Error(`Impossible de récupérer le profil client (ID: ${userId}).`);
  }
}
function App({ children }) {
  const { user } = useLoaderData();
  const location = useLocation();
  const navigation = useNavigation();
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  useEffect(() => {
    if (navigation.state === "idle" && !profileLoading) {
      NProgress.done();
    } else {
      NProgress.start();
    }
  }, [navigation.state, profileLoading]);
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      const currentUserId = user == null ? void 0 : user.userId;
      if (currentUserId) {
        console.log(`[App Effect] User session found (userId: ${currentUserId}). Fetching profile client-side...`);
        setProfileLoading(true);
        setProfile(null);
        try {
          const clientProfile = await getClientUserProfile(currentUserId);
          if (isMounted) {
            setProfile(clientProfile);
            if (!clientProfile) {
              console.warn(`[App Effect] Profile not found client-side for userId: ${currentUserId}`);
            }
          }
        } catch (error) {
          console.error("[App Effect] Error fetching profile client-side:", error);
          if (isMounted) setProfile(null);
          addToast({ message: `Erreur chargement profil: ${error.message}`, type: "error" });
        } finally {
          if (isMounted) setProfileLoading(false);
        }
      } else {
        console.log("[App Effect] No user session, clearing profile.");
        if (isMounted) {
          setProfile(null);
          setProfileLoading(false);
        }
      }
    };
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [user, addToast]);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const isDashboard = location.pathname === "/dashboard";
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Header,
      {
        user,
        profile,
        onToggleMobileMenu: toggleMobileMenu,
        onLoginClick: openAuthModal,
        loadingAuth: navigation.state !== "idle" || profileLoading
      }
    ),
    /* @__PURE__ */ jsx(
      MobileMenu,
      {
        isOpen: isMobileMenuOpen,
        onClose: toggleMobileMenu,
        user,
        profile,
        onLoginClick: openAuthModal,
        loadingAuth: navigation.state !== "idle" || profileLoading
      }
    ),
    /* @__PURE__ */ jsx(AuthModal, { isOpen: isAuthModalOpen, onClose: closeAuthModal }),
    " ",
    /* @__PURE__ */ jsx("main", { className: `container mx-auto px-4 py-6 ${isDashboard ? "mt-0" : "mt-16 md:mt-20"}`, children: /* @__PURE__ */ jsx(Outlet, { context: { user, profile, profileLoading } }) }),
    /* @__PURE__ */ jsx(ToastContainerComponent, {}),
    " "
  ] });
}
function Document() {
  return /* @__PURE__ */ jsxs("html", { lang: "fr", className: "h-full bg-jdc-blue-dark", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { className: "h-full font-sans text-jdc-gray-300", children: [
      " ",
      /* @__PURE__ */ jsx(ToastProvider, { children: /* @__PURE__ */ jsx(App, { children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { children: "Chargement de l'application..." }) }) }) }),
      /* @__PURE__ */ jsx("div", { id: "modal-root" }),
      " ",
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function ErrorBoundary() {
  return /* @__PURE__ */ jsxs("html", { lang: "fr", className: "h-full bg-jdc-blue-dark", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("title", { children: "Oops! Une erreur est survenue" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { className: "h-full font-sans text-white flex flex-col items-center justify-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-4", children: "Une erreur est survenue" }),
      /* @__PURE__ */ jsx("p", { children: "Nous sommes désolés, quelque chose s'est mal passé." }),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  action: action$2,
  default: Document,
  links,
  loader: loader$9
}, Symbol.toStringTag, { value: "Module" }));
async function loader$8({ request }) {
  return authenticator.authenticate("google", request, {
    // Redirect to the dashboard upon successful authentication
    successRedirect: "/dashboard",
    // Redirect to a login or error page upon failure
    // You might want a more specific error page later
    failureRedirect: "/?error=google-auth-failed"
    // Redirect to homepage on failure
  });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$8
}, Symbol.toStringTag, { value: "Module" }));
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_BASE_URL = process.env.APP_BASE_URL;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !APP_BASE_URL) {
  console.error("Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or APP_BASE_URL in environment variables.");
}
const REDIRECT_URI = `${APP_BASE_URL}/auth/google/callback`;
async function getGoogleAuthClient(session) {
  if (!(session == null ? void 0 : session.googleAccessToken) || !session.googleRefreshToken) {
    throw new Error("User session or Google tokens are missing.");
  }
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Server Google credentials (ID or Secret) are not configured.");
  }
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
  const tokens = {
    access_token: session.googleAccessToken,
    refresh_token: session.googleRefreshToken,
    // scope: session.scopes, // Include scopes if stored in session
    token_type: "Bearer",
    expiry_date: session.tokenExpiry
  };
  oauth2Client.setCredentials(tokens);
  if (session.tokenExpiry && session.tokenExpiry < Date.now() + 6e4) {
    console.log("[GoogleAuthClient] Access token expired or expiring soon. Refreshing...");
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      console.log("[GoogleAuthClient] Token refreshed successfully.");
      oauth2Client.setCredentials(credentials);
    } catch (error) {
      console.error("[GoogleAuthClient] Error refreshing access token:", error);
      throw new Error("Failed to refresh Google access token. Please re-authenticate.");
    }
  }
  return oauth2Client;
}
async function readSheetData(authClient, spreadsheetId, range) {
  var _a, _b, _c;
  const sheets = google.sheets({ version: "v4", auth: authClient });
  console.log(`[GoogleSheets] Reading data from spreadsheetId: ${spreadsheetId}, range: ${range}`);
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });
    console.log(`[GoogleSheets] Successfully read data for range: ${range}`);
    return response.data.values ?? [];
  } catch (error) {
    console.error(`[GoogleSheets] Error reading sheet data (ID: ${spreadsheetId}, Range: ${range}):`, ((_a = error.response) == null ? void 0 : _a.data) || error.message);
    if (((_b = error.response) == null ? void 0 : _b.status) === 403) {
      throw new Error(`Permission denied for spreadsheet ${spreadsheetId}. Ensure the user granted 'drive' or 'spreadsheets' scope and has access to the sheet.`);
    }
    if (((_c = error.response) == null ? void 0 : _c.status) === 404) {
      throw new Error(`Spreadsheet or sheet/range not found (ID: ${spreadsheetId}, Range: ${range}).`);
    }
    throw new Error(`Failed to read Google Sheet data: ${error.message}`);
  }
}
async function getCalendarEvents(authClient, timeMin, timeMax) {
  var _a, _b, _c;
  const calendar = google.calendar({ version: "v3", auth: authClient });
  console.log(`[GoogleCalendar] Fetching events from primary calendar between ${timeMin} and ${timeMax}`);
  try {
    const response = await calendar.events.list({
      calendarId: "primary",
      // Use the primary calendar of the authenticated user
      timeMin,
      timeMax,
      singleEvents: true,
      // Expand recurring events into single instances
      orderBy: "startTime",
      // Order events by start time
      maxResults: 50
      // Limit the number of events fetched (adjust as needed)
    });
    const events = response.data.items ?? [];
    console.log(`[GoogleCalendar] Successfully fetched ${events.length} events.`);
    return events;
  } catch (error) {
    console.error(`[GoogleCalendar] Error fetching calendar events:`, ((_a = error.response) == null ? void 0 : _a.data) || error.message);
    if (((_b = error.response) == null ? void 0 : _b.status) === 403) {
      throw new Error(`Permission denied for Google Calendar. Ensure the user granted 'calendar' or 'calendar.readonly' scope.`);
    }
    if (((_c = error.response) == null ? void 0 : _c.status) === 404) {
      throw new Error(`Primary calendar not found.`);
    }
    throw new Error(`Failed to fetch Google Calendar events: ${error.message}`);
  }
}
const KEZIA_SPREADSHEET_ID = "1uzzHN8tzc53mOOpH8WuXJHIUsk9f17eYc0qsod-Yryk";
const KEZIA_SHEET_NAME = "EN COURS";
const KEZIA_DATA_RANGE = `${KEZIA_SHEET_NAME}!A:P`;
const EDITABLE_COL_INDICES = [13, 14, 15];
const loader$7 = async ({ request }) => {
  const session = await authenticator.isAuthenticated(request);
  if (!session) {
    return redirect("/?error=unauthenticated");
  }
  try {
    const authClient = await getGoogleAuthClient(session);
    const sheetValues = await readSheetData(authClient, KEZIA_SPREADSHEET_ID, KEZIA_DATA_RANGE);
    if (!sheetValues || sheetValues.length === 0) {
      return json({ headers: [], rows: [], error: "Aucune donnée trouvée dans la feuille." });
    }
    const headers = sheetValues[0];
    const rows = sheetValues.slice(1);
    return json({
      headers,
      rows,
      warning: "Modification désactivée : Aucune colonne d'identification unique n'a été spécifiée pour cette feuille."
    });
  } catch (error) {
    console.error("[installations.kezia Loader] Error:", error);
    if (error.message.includes("token") || error.message.includes("authenticate")) {
      return redirect("/auth/google?error=token_error");
    }
    return json({ headers: [], rows: [], error: error.message || "Erreur lors du chargement des données Kezia." }, { status: 500 });
  }
};
function KeziaInstallations() {
  const { headers, rows, error, warning } = useLoaderData();
  const [editedData, setEditedData] = useState({});
  const handleInputChange = (rowIndex, colIndex, value) => {
    setEditedData((prev) => ({
      ...prev,
      [rowIndex]: {
        ...prev[rowIndex],
        [colIndex]: value
      }
    }));
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold text-white", children: [
      "Installations Kezia (Feuille: ",
      KEZIA_SHEET_NAME,
      ")"
    ] }),
    /* @__PURE__ */ jsx(Link, { to: "/dashboard", className: "text-jdc-blue hover:underline", children: "← Retour au Tableau de Bord" }),
    error && /* @__PURE__ */ jsxs("div", { className: "bg-red-900 bg-opacity-50 text-red-300 p-4 rounded-md", children: [
      /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Erreur :" }),
      /* @__PURE__ */ jsx("p", { children: error })
    ] }),
    warning && /* @__PURE__ */ jsxs("div", { className: "bg-yellow-900 bg-opacity-70 text-yellow-300 p-4 rounded-md", children: [
      /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Attention :" }),
      /* @__PURE__ */ jsx("p", { children: warning })
    ] }),
    !error && rows.length > 0 && /* @__PURE__ */ jsx("div", { className: "overflow-x-auto bg-jdc-card rounded-lg shadow", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-jdc-gray-700", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-jdc-gray-800", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { scope: "col", className: "px-3 py-3 text-left text-xs font-medium text-jdc-gray-300 uppercase tracking-wider sticky left-0 bg-jdc-gray-800 z-10", children: "#" }),
        headers.map((header, index) => /* @__PURE__ */ jsxs(
          "th",
          {
            scope: "col",
            className: `px-3 py-3 text-left text-xs font-medium text-jdc-gray-300 uppercase tracking-wider ${index < 1 ? "sticky left-10 bg-jdc-gray-800 z-10" : ""}`,
            children: [
              header || `Colonne ${String.fromCharCode(65 + index)}`,
              " "
            ]
          },
          index
        ))
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "bg-jdc-card divide-y divide-jdc-gray-700", children: rows.map((row, rowIndex) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-jdc-gray-800/50", children: [
        /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 whitespace-nowrap text-sm text-jdc-gray-400 sticky left-0 bg-inherit z-10", children: [
          rowIndex + 2,
          " "
        ] }),
        row.map((cell, colIndex) => {
          var _a;
          return /* @__PURE__ */ jsx(
            "td",
            {
              className: `px-3 py-2 whitespace-nowrap text-sm ${colIndex < 1 ? "sticky left-10 bg-inherit z-10" : ""}`,
              children: EDITABLE_COL_INDICES.includes(colIndex) ? /* @__PURE__ */ jsx(
                "input",
                {
                  type: colIndex === 14 ? "date" : "text",
                  value: ((_a = editedData[rowIndex]) == null ? void 0 : _a[colIndex]) ?? cell ?? "",
                  onChange: (e) => handleInputChange(rowIndex, colIndex, e.target.value),
                  className: "bg-jdc-gray-700 text-white rounded px-2 py-1 w-full focus:ring-jdc-blue focus:border-jdc-blue",
                  placeholder: `Modifier ${headers[colIndex] || `Col ${String.fromCharCode(65 + colIndex)}`}`
                }
              ) : /* @__PURE__ */ jsx("span", { className: "text-jdc-gray-300", children: cell })
            },
            colIndex
          );
        })
      ] }, rowIndex)) })
    ] }) }),
    !error && rows.length === 0 && !warning && /* @__PURE__ */ jsx("p", { className: "text-jdc-gray-400", children: "Aucune donnée à afficher." })
  ] });
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: KeziaInstallations,
  loader: loader$7
}, Symbol.toStringTag, { value: "Module" }));
const loader$6 = async ({ request }) => {
  var _a;
  const userSession = await authenticator.isAuthenticated(request);
  if (!userSession) {
    return redirect("/?error=unauthenticated");
  }
  const accessToken = userSession.googleAccessToken;
  if (!accessToken) {
    console.error("[google-drive-files Loader] No access token found in session.");
    return redirect("/auth/google?error=token_missing");
  }
  console.log("[google-drive-files Loader] Access token found. Fetching Drive files...");
  try {
    const driveApiUrl = `https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType,webViewLink)`;
    const response = await fetch(driveApiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (!response.ok) {
      const errorBody = await response.json();
      console.error("[google-drive-files Loader] Google Drive API error:", response.status, errorBody);
      if (response.status === 401) {
        return redirect("/auth/google?error=token_invalid");
      }
      throw new Error(`Google Drive API request failed: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`[google-drive-files Loader] Successfully fetched ${((_a = data.files) == null ? void 0 : _a.length) ?? 0} files.`);
    return json({ files: data.files ?? [] });
  } catch (error) {
    console.error("[google-drive-files Loader] Error fetching Google Drive files:", error);
    return json({ files: [], error: error.message || "Failed to fetch files" }, { status: 500 });
  }
};
function GoogleDriveFiles() {
  const { files, error } = useLoaderData();
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-white", children: "Fichiers Google Drive (Test API)" }),
    /* @__PURE__ */ jsx(Link, { to: "/dashboard", className: "text-jdc-blue hover:underline", children: "← Retour au Tableau de Bord" }),
    error && /* @__PURE__ */ jsxs("div", { className: "bg-red-900 bg-opacity-50 text-red-300 p-4 rounded-md", children: [
      /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Erreur lors de la récupération des fichiers :" }),
      /* @__PURE__ */ jsx("p", { children: error }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm", children: "Cela peut être dû à un jeton expiré ou à des permissions insuffisantes. Essayez de vous reconnecter via Google." }),
      /* @__PURE__ */ jsx(Link, { to: "/auth/google", className: "text-jdc-yellow hover:underline font-semibold mt-1 block", children: "Se reconnecter avec Google" })
    ] }),
    !error && files && files.length > 0 && /* @__PURE__ */ jsx("ul", { className: "bg-jdc-card rounded-lg shadow p-4 space-y-2", children: files.map((file) => /* @__PURE__ */ jsxs("li", { className: "border-b border-jdc-gray-700 pb-2 last:border-b-0", children: [
      /* @__PURE__ */ jsx("p", { className: "font-medium text-white", children: file.name }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-jdc-gray-400", children: file.mimeType }),
      file.webViewLink && /* @__PURE__ */ jsx(
        "a",
        {
          href: file.webViewLink,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-xs text-jdc-blue hover:underline",
          children: "Ouvrir dans Drive"
        }
      )
    ] }, file.id)) }),
    !error && files && files.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-jdc-gray-400", children: "Aucun fichier trouvé (ou accès non autorisé)." })
  ] });
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: GoogleDriveFiles,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
async function loader$5({ request }) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/dashboard"
    // Or wherever you want authenticated users to go
  });
  return authenticator.authenticate("google", request);
}
async function action$1({ request }) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/dashboard"
  });
  return authenticator.authenticate("google", request);
}
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
const Input = forwardRef(
  ({ label, id, name, type = "text", error, icon, className = "", wrapperClassName = "", ...props }, ref) => {
    const inputId = id || name;
    const hasIcon = !!icon;
    const baseInputStyle = "block w-full rounded-md bg-jdc-gray-800 border-transparent focus:border-jdc-yellow focus:ring focus:ring-jdc-yellow focus:ring-opacity-50 placeholder-jdc-gray-400 text-white disabled:opacity-50 disabled:cursor-not-allowed";
    const iconPadding = hasIcon ? "pl-10" : "pl-3";
    const errorStyle = error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-transparent";
    return /* @__PURE__ */ jsxs("div", { className: `mb-4 ${wrapperClassName}`, children: [
      label && /* @__PURE__ */ jsx("label", { htmlFor: inputId, className: "block text-sm font-medium text-jdc-gray-300 mb-1", children: label }),
      /* @__PURE__ */ jsxs("div", { className: "relative rounded-md shadow-sm", children: [
        hasIcon && /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3", children: React.cloneElement(icon, { className: `h-5 w-5 ${props.disabled ? "text-jdc-gray-500" : "text-jdc-gray-400"}` }) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            ref,
            type,
            id: inputId,
            name,
            className: `${baseInputStyle} ${iconPadding} pr-3 py-2 ${errorStyle} ${className}`,
            "aria-invalid": error ? "true" : "false",
            "aria-describedby": error ? `${inputId}-error` : void 0,
            ...props
          }
        )
      ] }),
      error && !props.disabled && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-500", id: `${inputId}-error`, children: error })
    ] });
  }
);
Input.displayName = "Input";
const useGeminiSummary = (apiKey) => {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const genAI = useMemo(() => {
    console.log("[useGeminiSummary] Initializing with API Key:", "Provided");
    try {
      return new GoogleGenerativeAI(apiKey);
    } catch (err) {
      console.error("[useGeminiSummary] Error initializing GoogleGenerativeAI:", err);
      setError("Erreur d'initialisation de l'API Gemini. Vérifiez la clé API.");
      return null;
    }
  }, [apiKey]);
  const resetSummaryState = useCallback(() => {
    setSummary("");
    setIsLoading(false);
    setError(null);
    setIsCached(false);
  }, []);
  const generateSummary = useCallback(async (ticket, prompt, saveSummaryCallback) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    console.log("[useGeminiSummary] generateSummary called for ticket:", ticket == null ? void 0 : ticket.id);
    setIsLoading(true);
    setError(null);
    setIsCached(false);
    if (!ticket) {
      console.warn("[useGeminiSummary] No ticket provided.");
      setError("Ticket non fourni.");
      setIsLoading(false);
      return;
    }
    if (ticket.summary && typeof ticket.summary === "string" && ticket.summary.trim() !== "") {
      console.log(`[useGeminiSummary] Cache hit for ticket ${ticket.id}. Using existing summary.`);
      setSummary(ticket.summary);
      setIsCached(true);
      setIsLoading(false);
      setError(null);
      console.log(`[useGeminiSummary] Cache check successful for ticket ${ticket.id}. State set from cache.`);
      return;
    }
    console.log("[useGeminiSummary] Cache miss or summary empty. Proceeding towards API call.");
    setSummary("");
    if (!prompt) {
      console.log("[useGeminiSummary] No prompt provided, skipping generation.");
      setError("Prompt vide fourni pour la génération.");
      setIsLoading(false);
      return;
    }
    if (!genAI) {
      console.error("[useGeminiSummary] genAI client not initialized. Cannot generate.");
      setError("Client API Gemini non initialisé. Vérifiez la clé API.");
      setIsLoading(false);
      return;
    }
    console.log("[useGeminiSummary] Generating with prompt:", prompt);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });
      const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048
      };
      const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
      ];
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings
      });
      const response = result.response;
      console.log("[useGeminiSummary] Raw API Response:", response);
      if ((_e = (_d = (_c = (_b = (_a = response == null ? void 0 : response.candidates) == null ? void 0 : _a[0]) == null ? void 0 : _b.content) == null ? void 0 : _c.parts) == null ? void 0 : _d[0]) == null ? void 0 : _e.text) {
        const generatedText = response.candidates[0].content.parts[0].text;
        console.log("[useGeminiSummary] Generated text:", generatedText);
        setSummary(generatedText);
        setIsCached(false);
        try {
          console.log(`[useGeminiSummary] Attempting to save generated summary for ticket ${ticket.id}...`);
          await saveSummaryCallback(generatedText);
          console.log(`[useGeminiSummary] Successfully saved summary for ticket ${ticket.id}.`);
        } catch (saveError) {
          console.error(`[useGeminiSummary] Failed to save summary for ticket ${ticket.id}:`, saveError);
          setError(`Résumé généré mais échec de la sauvegarde: ${saveError.message || "Erreur inconnue"}`);
        }
      } else {
        const blockReason = (_f = response == null ? void 0 : response.promptFeedback) == null ? void 0 : _f.blockReason;
        const finishReason = (_h = (_g = response == null ? void 0 : response.candidates) == null ? void 0 : _g[0]) == null ? void 0 : _h.finishReason;
        console.warn(`[useGeminiSummary] Gemini response issue. Block Reason: ${blockReason}, Finish Reason: ${finishReason}`);
        setError(blockReason ? `Génération bloquée: ${blockReason}` : finishReason ? `Génération terminée avec raison: ${finishReason}` : "Aucune réponse textuelle reçue de l'IA.");
        setSummary("");
      }
    } catch (err) {
      console.error("[useGeminiSummary] Error generating summary with Gemini:", err);
      if ((_i = err.message) == null ? void 0 : _i.includes("API key not valid")) {
        setError("Clé API Gemini invalide ou expirée.");
      } else if ((_j = err.message) == null ? void 0 : _j.includes("SAFETY")) {
        setError("La génération a été bloquée pour des raisons de sécurité.");
      } else if ((_k = err.message) == null ? void 0 : _k.includes("quota")) {
        setError("Quota d'API Gemini dépassé.");
      } else {
        setError(`Erreur de génération: ${err.message || "Une erreur inconnue est survenue."}`);
      }
      setSummary("");
    } finally {
      setIsLoading(false);
    }
  }, [genAI, apiKey]);
  return { summary, isLoading, error, generateSummary, isCached, resetSummaryState };
};
const getInitialSAPStatus = (ticket) => {
  if (!(ticket == null ? void 0 : ticket.statutSAP)) {
    return "Nouveau";
  }
  return ticket.statutSAP;
};
const getSAPStatusBadgeClass = (status) => {
  switch (status == null ? void 0 : status.toLowerCase()) {
    case "nouveau":
      return "badge-info";
    case "en cours":
      return "badge-primary";
    case "terminé":
      return "badge-success";
    case "annulé":
      return "badge-error";
    default:
      return "badge-ghost";
  }
};
const GEMINI_API_KEY = "AIzaSyAZqeCNWSWu1D4iFthrCW7sx9Ky2jlqoUg";
const TicketSAPDetails = ({ ticket, onClose, sectorId, onTicketUpdated }) => {
  const [newComment, setNewComment] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [commentError, setCommentError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const problemDescriptionForAI = (ticket == null ? void 0 : ticket.demandeSAP) || (ticket == null ? void 0 : ticket.descriptionProbleme) || (ticket == null ? void 0 : ticket.description) || "";
  const summaryPrompt = useMemo(() => {
    if (!problemDescriptionForAI || (ticket == null ? void 0 : ticket.summary)) {
      return "";
    }
    const prompt = `Résume ce problème SAP en 1 ou 2 phrases maximum, en français: ${problemDescriptionForAI}`;
    return prompt;
  }, [ticket == null ? void 0 : ticket.id, problemDescriptionForAI, ticket == null ? void 0 : ticket.summary]);
  const {
    summary: generatedSummary,
    isLoading: isSummaryLoading,
    error: summaryError,
    generateSummary: triggerSummaryGeneration,
    isCached: isSummaryCached,
    // Get isCached state
    resetSummaryState: resetSummaryHookState
    // Get reset function
  } = useGeminiSummary(GEMINI_API_KEY);
  const solutionPrompt = useMemo(() => {
    if (!problemDescriptionForAI || (ticket == null ? void 0 : ticket.solution)) {
      return "";
    }
    const prompt = `Propose une solution concise (1-2 phrases), en français, pour ce problème SAP: ${problemDescriptionForAI}`;
    return prompt;
  }, [ticket == null ? void 0 : ticket.id, problemDescriptionForAI, ticket == null ? void 0 : ticket.solution]);
  const {
    summary: generatedSolution,
    isLoading: isSolutionLoading,
    error: solutionError,
    generateSummary: triggerSolutionGeneration,
    isCached: isSolutionCached,
    // Get isCached state
    resetSummaryState: resetSolutionHookState
    // Get reset function
  } = useGeminiSummary(GEMINI_API_KEY);
  const handleSaveSummary = useCallback(async (summaryToSave) => {
    if (!ticket || !sectorId) return;
    console.log(`[TicketSAPDetails] Calling updateSAPTICKET to save SUMMARY for ticket ${ticket.id}`);
    setUpdateError(null);
    try {
      await updateSAPTICKET(sectorId, ticket.id, { summary: summaryToSave });
      onTicketUpdated();
    } catch (error) {
      console.error("Error saving SAP summary via callback:", error);
      setUpdateError(`Erreur sauvegarde résumé: ${error.message}`);
      throw error;
    }
  }, [ticket, sectorId, onTicketUpdated]);
  const handleSaveSolution = useCallback(async (solutionToSave) => {
    if (!ticket || !sectorId) return;
    console.log(`[TicketSAPDetails] Calling updateSAPTICKET to save SOLUTION for ticket ${ticket.id}`);
    setUpdateError(null);
    try {
      await updateSAPTICKET(sectorId, ticket.id, { solution: solutionToSave });
      onTicketUpdated();
    } catch (error) {
      console.error("Error saving SAP solution via callback:", error);
      setUpdateError(`Erreur sauvegarde solution: ${error.message}`);
      throw error;
    }
  }, [ticket, sectorId, onTicketUpdated]);
  useEffect(() => {
    console.log("[TicketSAPDetails Effect] Running for ticket:", ticket == null ? void 0 : ticket.id);
    resetSummaryHookState();
    resetSolutionHookState();
    if (ticket) {
      setCurrentStatus(getInitialSAPStatus(ticket));
      if (summaryPrompt) {
        console.log("[TicketSAPDetails Effect] Triggering SUMMARY generation for ticket:", ticket.id);
        triggerSummaryGeneration(ticket, summaryPrompt, handleSaveSummary);
      } else {
        console.log("[TicketSAPDetails Effect] Skipping SUMMARY generation (prompt is empty - likely cached or no description).");
      }
      if (solutionPrompt) {
        console.log("[TicketSAPDetails Effect] Triggering SOLUTION generation for ticket:", ticket.id);
        triggerSolutionGeneration(ticket, solutionPrompt, handleSaveSolution);
      } else {
        console.log("[TicketSAPDetails Effect] Skipping SOLUTION generation (prompt is empty - likely cached or no description).");
      }
    } else {
      console.log("[TicketSAPDetails Effect] No ticket, resetting status.");
      setCurrentStatus("");
    }
    setStatusUpdateError(null);
    setCommentError(null);
    setUpdateError(null);
    setNewComment("");
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
  const handleClose = () => {
    resetSummaryHookState();
    resetSolutionHookState();
    onClose();
  };
  const handleAddComment = async () => {
    if (newComment.trim() && sectorId && (ticket == null ? void 0 : ticket.id)) {
      setIsAddingComment(true);
      setCommentError(null);
      const updatedComments = [newComment, ...ticket.commentaires || []];
      try {
        await updateSAPTICKET(sectorId, ticket.id, { commentaires: updatedComments });
        setNewComment("");
        onTicketUpdated();
      } catch (error) {
        setCommentError(`Erreur ajout commentaire SAP: ${error.message}`);
      } finally {
        setIsAddingComment(false);
      }
    }
  };
  const handleStatusChange = async () => {
    if (sectorId && (ticket == null ? void 0 : ticket.id) && currentStatus && currentStatus !== (ticket == null ? void 0 : ticket.statutSAP)) {
      setIsUpdatingStatus(true);
      setStatusUpdateError(null);
      try {
        await updateSAPTICKET(sectorId, ticket.id, { statutSAP: currentStatus });
        onTicketUpdated();
      } catch (error) {
        setStatusUpdateError(`Erreur MàJ statut SAP: ${error.message}`);
        setCurrentStatus(getInitialSAPStatus(ticket));
      } finally {
        setIsUpdatingStatus(false);
      }
    }
  };
  if (!ticket) {
    return null;
  }
  const displaySummary = (ticket == null ? void 0 : ticket.summary) || generatedSummary;
  const displaySolution = (ticket == null ? void 0 : ticket.solution) || generatedSolution;
  console.log("[TicketSAPDetails Render] Received Ticket Prop:", JSON.stringify(ticket, null, 2));
  console.log("[TicketSAPDetails Render] Calculated displaySummary:", displaySummary);
  console.log("[TicketSAPDetails Render] Calculated displaySolution:", displaySolution);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  const modalContent = (
    // Outer container: Fixed position, full screen, z-index, flex center
    // Add onClick={handleClose} to the outer div for click-outside-to-close behavior
    /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70", onClick: handleClose, children: /* @__PURE__ */ jsxs("div", { className: "w-11/12 max-w-3xl relative bg-jdc-card text-jdc-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto p-6", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleClose,
          className: "btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10",
          "aria-label": "Fermer",
          children: "✕"
        }
      ),
      /* @__PURE__ */ jsx("h3", { className: "font-bold text-xl mb-1", children: ticket.raisonSociale || "Client Inconnu" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-400 mb-4", children: [
        "Ticket SAP: ",
        ticket.numeroSAP || "N/A"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 py-4 text-sm border-t border-b border-gray-700", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("b", { children: "Code Client:" }),
          " ",
          ticket.codeClient || "N/A"
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("b", { children: "Téléphone:" }),
          " ",
          ticket.telephone || "N/A"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsx("b", { children: "Adresse:" }),
          " ",
          ticket.adresse || "N/A"
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("b", { children: "Date Création:" }),
          " ",
          formatDateForDisplay(parseFrenchDate(ticket.date))
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("b", { children: "Secteur:" }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "badge badge-neutral", children: ticket.secteur || "N/A" })
        ] }),
        ticket.deducedSalesperson && /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("b", { children: "Commercial:" }),
          " ",
          ticket.deducedSalesperson
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "my-4", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "sap-ticket-status-select", className: "block text-sm font-medium text-gray-300 mb-1", children: "Statut SAP" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "sap-ticket-status-select",
              className: "select select-bordered select-sm w-full max-w-xs bg-jdc-gray text-jdc-white",
              value: currentStatus,
              onChange: (e) => setCurrentStatus(e.target.value),
              disabled: isUpdatingStatus,
              children: [
                /* @__PURE__ */ jsx("option", { className: "text-black", value: "Nouveau", children: "Nouveau" }),
                /* @__PURE__ */ jsx("option", { className: "text-black", value: "En cours", children: "En cours" }),
                /* @__PURE__ */ jsx("option", { className: "text-black", value: "En attente client", children: "En attente client" }),
                /* @__PURE__ */ jsx("option", { className: "text-black", value: "Résolu", children: "Résolu" }),
                /* @__PURE__ */ jsx("option", { className: "text-black", value: "Terminé", children: "Terminé" }),
                /* @__PURE__ */ jsx("option", { className: "text-black", value: "Annulé", children: "Annulé" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn btn-primary btn-sm",
              onClick: handleStatusChange,
              disabled: isUpdatingStatus || currentStatus === (ticket == null ? void 0 : ticket.statutSAP),
              children: isUpdatingStatus ? /* @__PURE__ */ jsx(FaSpinner, { className: "animate-spin" }) : "Mettre à jour"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: `badge ${getSAPStatusBadgeClass(currentStatus)} ml-auto`, children: currentStatus })
        ] }),
        statusUpdateError && /* @__PURE__ */ jsx("p", { className: "text-error text-xs mt-1", children: statusUpdateError })
      ] }),
      /* @__PURE__ */ jsx("hr", { className: "my-3 border-gray-700" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h4", { className: "text-md font-semibold mb-1 text-blue-300", children: [
            "Résumé IA ",
            isSummaryCached && /* @__PURE__ */ jsx("span", { className: "text-xs font-normal text-gray-400", children: "(cache)" })
          ] }),
          isSummaryLoading && /* @__PURE__ */ jsx("span", { className: "loading loading-dots loading-sm" }),
          (summaryError || updateError && updateError.includes("résumé")) && !displaySummary && /* @__PURE__ */ jsxs("p", { className: "text-error text-xs", children: [
            "Erreur: ",
            summaryError || updateError
          ] }),
          displaySummary ? /* @__PURE__ */ jsx("div", { className: "prose prose-sm max-w-none text-gray-300", children: /* @__PURE__ */ jsx(ReactMarkdown, { children: displaySummary }) }) : !isSummaryLoading && !summaryError && !(updateError && updateError.includes("résumé")) ? /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 italic", children: "Aucun résumé." }) : null
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h4", { className: "text-md font-semibold mb-1 text-green-300", children: [
            "Solution Proposée IA ",
            isSolutionCached && /* @__PURE__ */ jsx("span", { className: "text-xs font-normal text-gray-400", children: "(cache)" })
          ] }),
          isSolutionLoading && /* @__PURE__ */ jsx("span", { className: "loading loading-dots loading-sm" }),
          (solutionError || updateError && updateError.includes("solution")) && !displaySolution && /* @__PURE__ */ jsxs("p", { className: "text-error text-xs", children: [
            "Erreur: ",
            solutionError || updateError
          ] }),
          displaySolution ? /* @__PURE__ */ jsx("div", { className: "prose prose-sm max-w-none text-gray-300", children: /* @__PURE__ */ jsx(ReactMarkdown, { children: displaySolution }) }) : !isSolutionLoading && !solutionError && !(updateError && updateError.includes("solution")) ? /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 italic", children: "Aucune solution." }) : null
        ] })
      ] }),
      /* @__PURE__ */ jsx("hr", { className: "my-3 border-gray-700" }),
      /* @__PURE__ */ jsxs("details", { className: "mb-3 text-sm", children: [
        /* @__PURE__ */ jsx("summary", { className: "cursor-pointer font-medium text-gray-400 hover:text-jdc-white", children: "Voir la description du problème SAP" }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 p-3 border border-gray-600 rounded bg-jdc-gray text-xs max-h-32 overflow-y-auto", children: /* @__PURE__ */ jsx("pre", { className: "whitespace-pre-wrap break-words font-mono", children: ticket.demandeSAP || ticket.descriptionProbleme || ticket.description || "N/A" }) })
      ] }),
      /* @__PURE__ */ jsx("hr", { className: "my-3 border-gray-700" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "text-md font-semibold mb-2", children: "Commentaires" }),
        /* @__PURE__ */ jsx("div", { className: "max-h-40 overflow-y-auto mb-3 border border-gray-600 rounded p-3 bg-jdc-gray text-sm space-y-2", children: ticket.commentaires && ticket.commentaires.length > 0 ? ticket.commentaires.map((commentaire, index) => /* @__PURE__ */ jsx("p", { className: "border-b border-gray-700 pb-1 mb-1", children: commentaire }, index)) : /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 italic", children: "Aucun commentaire." }) }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            placeholder: "Ajouter un commentaire...",
            className: "textarea textarea-bordered w-full text-sm bg-jdc-gray",
            rows: 2,
            value: newComment,
            onChange: (e) => setNewComment(e.target.value),
            disabled: isAddingComment
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn btn-secondary btn-sm mt-2",
            onClick: handleAddComment,
            disabled: isAddingComment || !newComment.trim(),
            children: isAddingComment ? /* @__PURE__ */ jsx(FaSpinner, { className: "animate-spin" }) : "Ajouter Commentaire"
          }
        ),
        commentError && /* @__PURE__ */ jsx("p", { className: "text-error text-xs mt-1", children: commentError })
      ] })
    ] }) })
  );
  if (!isClient) {
    return null;
  }
  const portalRoot = document.getElementById("modal-root");
  if (!portalRoot) {
    console.error("Modal root element #modal-root not found in the DOM.");
    return null;
  }
  return ReactDOM.createPortal(modalContent, portalRoot);
};
const shipmentStatusStyles = {
  OUI: { bgColor: "bg-green-700", textColor: "text-green-100" },
  NON: { bgColor: "bg-red-700", textColor: "text-red-100" },
  DEFAULT: { bgColor: "bg-jdc-gray-700", textColor: "text-jdc-gray-200" }
};
function getShipmentStatusStyle(status) {
  const upperStatus = status == null ? void 0 : status.toUpperCase();
  if (upperStatus === "OUI") {
    return shipmentStatusStyles.OUI;
  }
  if (upperStatus === "NON") {
    return shipmentStatusStyles.NON;
  }
  return shipmentStatusStyles.DEFAULT;
}
const ticketStatusStyles = {
  NOUVEAU: { bgColor: "bg-blue-600", textColor: "text-blue-100" },
  EN_COURS: { bgColor: "bg-yellow-600", textColor: "text-yellow-100" },
  RESOLU: { bgColor: "bg-green-600", textColor: "text-green-100" },
  FERME: { bgColor: "bg-gray-600", textColor: "text-gray-100" },
  ANNULE: { bgColor: "bg-red-600", textColor: "text-red-100" },
  EN_ATTENTE: { bgColor: "bg-purple-600", textColor: "text-purple-100" },
  DEMANDE_DE_RMA: { bgColor: "bg-purple-700", textColor: "text-purple-100" },
  // Added style for RMA
  A_CLOTUREE: { bgColor: "bg-teal-600", textColor: "text-teal-100" },
  // Added style for A Cloturee
  DEFAULT: { bgColor: "bg-jdc-gray-700", textColor: "text-jdc-gray-200" }
};
function getTicketStatusStyle(status) {
  const upperStatus = status == null ? void 0 : status.toUpperCase().replace(/\s+/g, "_");
  switch (upperStatus) {
    case "NOUVEAU":
    case "OUVERT":
      return ticketStatusStyles.NOUVEAU;
    case "EN_COURS":
    case "EN_TRAITEMENT":
      return ticketStatusStyles.EN_COURS;
    case "RESOLU":
    case "TERMINE":
      return ticketStatusStyles.RESOLU;
    case "FERME":
    case "CLOTURE":
      return ticketStatusStyles.FERME;
    case "ANNULE":
      return ticketStatusStyles.ANNULE;
    case "EN_ATTENTE":
    case "ATTENTE_CLIENT":
      return ticketStatusStyles.EN_ATTENTE;
    case "DEMANDE_DE_RMA":
      return ticketStatusStyles.DEMANDE_DE_RMA;
    case "A_CLOTUREE":
      return ticketStatusStyles.A_CLOTUREE;
    default:
      if (status) {
        console.warn(`Unknown ticket status encountered: "${status}". Using default style.`);
      }
      return ticketStatusStyles.DEFAULT;
  }
}
const meta$3 = () => {
  return [{ title: "Tickets SAP | JDC Dashboard" }];
};
const groupTicketsByRaisonSociale = (tickets) => {
  const grouped = /* @__PURE__ */ new Map();
  if (!Array.isArray(tickets)) {
    return grouped;
  }
  tickets.forEach((ticket) => {
    const raisonSociale = ticket.raisonSociale;
    if (raisonSociale) {
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
function TicketsSap() {
  var _a;
  const { user, profile: initialProfile } = useOutletContext();
  const userProfile = initialProfile;
  const [allTickets, setAllTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSector, setSelectedSector] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNumberOptions, setShowNumberOptions] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  useEffect(() => {
    let isMounted = true;
    const fetchTickets = async () => {
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
        const sectorsToQuery = userProfile.secteurs ?? [];
        if (sectorsToQuery.length === 0) {
          console.warn(`Tickets SAP: User ${user.userId} (Role: ${userProfile.role}) has no sectors assigned.`);
          setAllTickets([]);
          setIsLoading(false);
          return;
        }
        console.log(`Tickets SAP: Fetching tickets for sectors: ${sectorsToQuery.join(", ")}`);
        const fetchedTickets = await getAllTicketsForSectorsSdk(sectorsToQuery);
        if (isMounted) {
          console.log(`Tickets SAP: Fetched ${fetchedTickets.length} tickets.`);
          const ticketsWithRaisonSociale = fetchedTickets.filter((t) => t.raisonSociale);
          setAllTickets(ticketsWithRaisonSociale);
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching Tickets SAP:", err);
          setError(`Erreur de chargement initial: ${err.message}`);
          setAllTickets([]);
          setIsLoading(false);
        }
      }
    };
    fetchTickets();
    return () => {
      isMounted = false;
      console.log("Tickets SAP: Unmounting or user changed.");
    };
  }, [user, userProfile]);
  const availableSectors = useMemo(() => {
    var _a2;
    return ((_a2 = userProfile == null ? void 0 : userProfile.secteurs) == null ? void 0 : _a2.slice().sort()) ?? [];
  }, [userProfile]);
  const filteredAndGroupedTickets = useMemo(() => {
    let filtered = allTickets;
    if (selectedSector && selectedSector !== "") {
      filtered = filtered.filter((t) => t.secteur === selectedSector);
    }
    if (searchTerm.trim() !== "") {
      const lowerSearchTerm = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (t) => t.raisonSociale && t.raisonSociale.toLowerCase().includes(lowerSearchTerm) || t.client && t.client.toLowerCase().includes(lowerSearchTerm) || t.id && t.id.toLowerCase().includes(lowerSearchTerm) || t.description && t.description.toLowerCase().includes(lowerSearchTerm) || t.statut && t.statut.toLowerCase().includes(lowerSearchTerm) || t.numeroSAP && t.numeroSAP.toLowerCase().includes(lowerSearchTerm) || t.deducedSalesperson && t.deducedSalesperson.toLowerCase().includes(lowerSearchTerm) || t.adresse && t.adresse.toLowerCase().includes(lowerSearchTerm) || t.telephone && t.telephone.toLowerCase().includes(lowerSearchTerm)
      );
    }
    return groupTicketsByRaisonSociale(filtered);
  }, [allTickets, selectedSector, searchTerm]);
  const clientGroups = useMemo(() => {
    const findMostRecentDate = (tickets) => {
      let mostRecent = null;
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
    const groupsWithDates = Array.from(filteredAndGroupedTickets.entries()).map(
      ([raisonSociale, tickets]) => ({
        raisonSociale,
        tickets,
        mostRecentDate: findMostRecentDate(tickets)
      })
    );
    groupsWithDates.sort((a, b) => {
      if (!b.mostRecentDate) return -1;
      if (!a.mostRecentDate) return 1;
      return b.mostRecentDate.getTime() - a.mostRecentDate.getTime();
    });
    return groupsWithDates.map((group) => [group.raisonSociale, group.tickets]);
  }, [filteredAndGroupedTickets]);
  const handleWebexCall = useCallback((ticketId, phoneNumbers) => {
    if (phoneNumbers.length === 1) {
      window.location.href = `webexphone://call?uri=tel:${phoneNumbers[0]}`;
      setShowNumberOptions((prevState) => ({ ...prevState, [ticketId]: false }));
    } else if (phoneNumbers.length > 1) {
      setShowNumberOptions((prevState) => ({ ...prevState, [ticketId]: !prevState[ticketId] }));
    }
  }, []);
  const handleNumberSelection = useCallback((number) => {
    window.location.href = `webexphone://call?uri=tel:${number}`;
  }, []);
  const handleTicketClick = (ticket) => {
    console.log("Ticket clicked:", ticket);
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };
  const refreshTickets = useCallback(async () => {
    if (!user || !userProfile) return;
    console.log("Tickets SAP: Refreshing tickets manually...");
    setIsLoading(true);
    try {
      const sectorsToQuery = userProfile.secteurs ?? [];
      if (sectorsToQuery.length > 0) {
        const fetchedTickets = await getAllTicketsForSectorsSdk(sectorsToQuery);
        const ticketsWithRaisonSociale = fetchedTickets.filter((t) => t.raisonSociale);
        setAllTickets(ticketsWithRaisonSociale);
      } else {
        setAllTickets([]);
      }
      setError(null);
    } catch (err) {
      console.error("Error refreshing tickets:", err);
      setError(`Erreur lors du rafraîchissement: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user, userProfile]);
  const handleTicketUpdated = () => {
    console.log("Ticket update detected from modal, manually refreshing list.");
    refreshTickets();
  };
  if (!user && !isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "text-center text-jdc-gray-400 py-10", children: "Veuillez vous connecter pour voir les tickets SAP." });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold text-white mb-4 flex items-center", children: [
      /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTicket, className: "mr-3 text-jdc-blue" }),
      "Gestion des Tickets SAP"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-jdc-card rounded-lg shadow", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-span-1", children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: "sector-filter", className: "block text-sm font-medium text-jdc-gray-300 mb-1", children: [
          /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faFilter, className: "mr-1" }),
          " Filtrer par Secteur"
        ] }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "sector-filter",
            name: "sector-filter",
            value: selectedSector,
            onChange: (e) => setSelectedSector(e.target.value),
            className: "block w-full rounded-md bg-jdc-gray-800 border-transparent focus:border-jdc-blue focus:ring focus:ring-jdc-blue focus:ring-opacity-50 text-white py-2 pl-3 pr-10",
            disabled: isLoading || availableSectors.length === 0,
            children: [
              /* @__PURE__ */ jsxs("option", { value: "", children: [
                "Tous les secteurs (",
                ((_a = userProfile == null ? void 0 : userProfile.secteurs) == null ? void 0 : _a.length) ?? 0,
                ")"
              ] }),
              availableSectors.map((sector) => /* @__PURE__ */ jsx("option", { value: sector, children: sector }, sector))
            ]
          }
        ),
        availableSectors.length === 0 && !isLoading && !error && /* @__PURE__ */ jsx("p", { className: "text-xs text-jdc-gray-500 mt-1", children: "Aucun secteur assigné à votre profil." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "col-span-1 md:col-span-2", children: /* @__PURE__ */ jsx(
        Input,
        {
          label: "Rechercher (Raison Sociale, Client, ID, SAP, Adresse, Vendeur...)",
          id: "search-client",
          name: "search-client",
          placeholder: "Entrez un nom, ID, mot-clé...",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          icon: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faSearch }),
          wrapperClassName: "mb-0",
          disabled: isLoading
        }
      ) })
    ] }),
    isLoading && /* @__PURE__ */ jsxs("div", { className: "text-center text-jdc-gray-400 py-10", children: [
      /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faSpinner, spin: true, className: "text-2xl mr-2" }),
      "Chargement des tickets... "
    ] }),
    error && !isLoading && /* @__PURE__ */ jsxs("div", { className: "text-center text-red-400 bg-red-900 bg-opacity-50 p-4 rounded-lg flex items-center justify-center", children: [
      /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faExclamationTriangle, className: "mr-2" }),
      error
    ] }),
    !isLoading && !error && clientGroups.length === 0 && allTickets.length > 0 && /* @__PURE__ */ jsx("div", { className: "text-center text-jdc-gray-400 py-10", children: "Aucun ticket trouvé correspondant à votre recherche ou filtre (ou sans raison sociale)." }),
    !isLoading && !error && allTickets.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center text-jdc-gray-400 py-10", children: (userProfile == null ? void 0 : userProfile.secteurs) && userProfile.secteurs.length > 0 ? "Aucun ticket SAP avec une raison sociale trouvée pour les secteurs assignés." : "Aucun ticket SAP trouvé. Vérifiez vos secteurs assignés ou contactez un administrateur." }),
    !isLoading && !error && clientGroups.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: clientGroups.map(([raisonSociale, clientTickets]) => /* @__PURE__ */ jsx("div", { className: "bg-jdc-card rounded-lg shadow overflow-hidden", children: /* @__PURE__ */ jsxs("details", { className: "group", open: clientGroups.length < 5, children: [
      /* @__PURE__ */ jsxs("summary", { className: "flex items-center justify-between p-4 cursor-pointer hover:bg-jdc-gray-800 list-none transition-colors", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center min-w-0 mr-2", children: [
          /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faUserTag, className: "mr-3 text-jdc-gray-300 text-lg flex-shrink-0" }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-white text-lg block truncate", title: raisonSociale, children: raisonSociale }),
            /* @__PURE__ */ jsxs("span", { className: "ml-0 md:ml-3 text-sm text-jdc-gray-400", children: [
              "(",
              clientTickets.length,
              " ticket",
              clientTickets.length > 1 ? "s" : "",
              ")"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          FontAwesomeIcon,
          {
            icon: faChevronRight,
            className: "text-jdc-gray-400 transition-transform duration-200 group-open:rotate-90 text-xl flex-shrink-0"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "border-t border-jdc-gray-700 bg-jdc-gray-900 p-4 space-y-3", children: clientTickets.sort((a, b) => {
        const dateA = parseFrenchDate(a.date);
        const dateB = parseFrenchDate(b.date);
        if (!dateB) return -1;
        if (!dateA) return 1;
        return dateB.getTime() - dateA.getTime();
      }).map((ticket) => {
        var _a2;
        const statusStyle = getTicketStatusStyle(ticket.statut);
        const parsedDate = parseFrenchDate(ticket.date);
        const displayDate = formatDateForDisplay(parsedDate);
        const phoneNumbersArray = ((_a2 = ticket.telephone) == null ? void 0 : _a2.split(",").map((num) => num.trim()).filter((num) => num)) || [];
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "border-b border-jdc-gray-700 pb-3 last:border-b-0 text-sm cursor-pointer hover:bg-jdc-gray-800 transition-colors duration-150 p-3 rounded",
            onClick: () => handleTicketClick(ticket),
            role: "button",
            tabIndex: 0,
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === " ") handleTicketClick(ticket);
            },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 mb-2 md:mb-0 md:mr-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center mb-1", children: [
                    /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faInfoCircle, className: "mr-2 text-jdc-blue w-4 text-center" }),
                    /* @__PURE__ */ jsx("span", { className: "text-jdc-gray-100 font-semibold", title: `SAP: ${ticket.numeroSAP || "N/A"}`, children: ticket.numeroSAP || "N/A" }),
                    /* @__PURE__ */ jsx("span", { className: `ml-3 inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyle.bgColor} ${statusStyle.textColor}`, children: ticket.statut || "Inconnu" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center text-xs text-jdc-gray-400", children: [
                    /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faCalendarAlt, className: "mr-2 text-jdc-gray-500 w-4 text-center" }),
                    /* @__PURE__ */ jsx("span", { children: displayDate }),
                    /* @__PURE__ */ jsx("span", { className: "mx-2", children: "|" }),
                    /* @__PURE__ */ jsxs("span", { className: "text-jdc-gray-500", title: `ID: ${ticket.id}`, children: [
                      "ID: ",
                      ticket.id.substring(0, 8),
                      "..."
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "mx-2", children: "|" }),
                    /* @__PURE__ */ jsxs("span", { className: "text-jdc-gray-500", children: [
                      "Secteur: ",
                      ticket.secteur || "N/A"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 relative", children: phoneNumbersArray.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsxs(
                    Button,
                    {
                      variant: "secondary",
                      size: "sm",
                      onClick: (e) => {
                        e.stopPropagation();
                        handleWebexCall(ticket.id, phoneNumbersArray);
                      },
                      className: "text-jdc-blue border-jdc-blue hover:bg-jdc-blue hover:text-white",
                      title: phoneNumbersArray.length === 1 ? `Appeler ${phoneNumbersArray[0]}` : "Appeler...",
                      children: [
                        /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faPhone, className: "mr-2" }),
                        /* @__PURE__ */ jsx("span", { children: "Appeler" }),
                        phoneNumbersArray.length > 1 && /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: showNumberOptions[ticket.id] ? faChevronUp : faChevronDown, className: "ml-2" })
                      ]
                    }
                  ),
                  showNumberOptions[ticket.id] && phoneNumbersArray.length > 1 && /* @__PURE__ */ jsx("div", { className: "absolute right-0 mt-2 w-48 bg-jdc-gray-800 rounded-md shadow-lg z-10 border border-jdc-gray-700", children: /* @__PURE__ */ jsx("ul", { className: "py-1", children: phoneNumbersArray.map((number, index) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
                    "a",
                    {
                      href: `webexphone://call?uri=tel:${number}`,
                      onClick: (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleNumberSelection(number);
                        setShowNumberOptions((prevState) => ({ ...prevState, [ticket.id]: false }));
                      },
                      className: "block px-4 py-2 text-sm text-jdc-gray-200 hover:bg-jdc-blue hover:text-white",
                      children: number
                    }
                  ) }, index)) }) })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-xs", children: [
                ticket.deducedSalesperson && /* @__PURE__ */ jsxs("div", { className: "flex items-center text-jdc-gray-400", children: [
                  /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faUserTie, className: "mr-2 text-jdc-gray-500 w-4 text-center" }),
                  /* @__PURE__ */ jsx("span", { children: ticket.deducedSalesperson })
                ] }),
                ticket.adresse && /* @__PURE__ */ jsxs("div", { className: "flex items-center text-jdc-gray-400", children: [
                  /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faMapMarkerAlt, className: "mr-2 text-jdc-gray-500 w-4 text-center" }),
                  /* @__PURE__ */ jsx("span", { className: "truncate", title: ticket.adresse, children: ticket.adresse })
                ] }),
                ticket.description && /* @__PURE__ */ jsx("div", { className: "text-jdc-gray-300 pt-1", children: /* @__PURE__ */ jsx("p", { className: "line-clamp-2", title: ticket.description, children: ticket.description }) }),
                ticket.demandeSAP && /* @__PURE__ */ jsxs("div", { className: "text-jdc-gray-500 italic pt-1", children: [
                  "Demande SAP: (",
                  ticket.demandeSAP.length > 40 ? ticket.demandeSAP.substring(0, 37) + "..." : ticket.demandeSAP,
                  ")"
                ] })
              ] })
            ]
          },
          ticket.id
        );
      }) })
    ] }) }, raisonSociale)) }),
    isModalOpen && selectedTicket && /* @__PURE__ */ jsx(
      TicketSAPDetails,
      {
        ticket: selectedTicket,
        sectorId: selectedTicket.secteur,
        onClose: handleCloseModal,
        onTicketUpdated: handleTicketUpdated
      }
    )
  ] });
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: TicketsSap,
  meta: meta$3
}, Symbol.toStringTag, { value: "Module" }));
const loader$4 = async ({ request }) => {
  console.log(`API Health Check Request: ${request.url}`);
  return json({ status: "ok" }, 200);
};
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
const meta$2 = () => {
  return [{ title: "Envois CTN | JDC Dashboard" }];
};
const groupShipmentsByClient = (shipments) => {
  const grouped = /* @__PURE__ */ new Map();
  if (!Array.isArray(shipments)) {
    return grouped;
  }
  shipments.forEach((shipment) => {
    const clientName = shipment.nomClient || "Client Inconnu";
    const existing = grouped.get(clientName);
    if (existing) {
      existing.push(shipment);
    } else {
      grouped.set(clientName, [shipment]);
    }
  });
  return grouped;
};
function EnvoisCtn() {
  const { user } = useOutletContext();
  const { addToast } = useToast();
  const [userProfile, setUserProfile] = useState(null);
  const [allShipments, setAllShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingGroup, setDeletingGroup] = useState(null);
  const [selectedSector, setSelectedSector] = useState("");
  const [searchParams] = useSearchParams();
  const initialSearchTerm = searchParams.get("client") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  useEffect(() => {
    const clientParam = searchParams.get("client");
    if (clientParam && clientParam !== searchTerm) {
      setSearchTerm(clientParam);
    }
  }, [searchParams, searchTerm]);
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        setAllShipments([]);
        setUserProfile(null);
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
      } catch (err) {
        console.error("Error fetching data for Envois CTN:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Erreur de chargement des données: ${errorMessage}`);
        setAllShipments([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);
  const filteredAndGroupedShipments = useMemo(() => {
    let filtered = allShipments;
    (userProfile == null ? void 0 : userProfile.role) === "Admin";
    if (selectedSector && selectedSector !== "") {
      filtered = filtered.filter((s) => s.secteur === selectedSector);
    }
    if (searchTerm.trim() !== "") {
      const lowerSearchTerm = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (s) => s.nomClient && s.nomClient.toLowerCase().includes(lowerSearchTerm) || s.codeClient && s.codeClient.toLowerCase().includes(lowerSearchTerm) || s.id && s.id.toLowerCase().includes(lowerSearchTerm) || s.articleNom && s.articleNom.toLowerCase().includes(lowerSearchTerm)
      );
    }
    return groupShipmentsByClient(filtered);
  }, [allShipments, selectedSector, searchTerm, userProfile]);
  const clientGroups = useMemo(() => {
    const sortedEntries = Array.from(filteredAndGroupedShipments.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return sortedEntries;
  }, [filteredAndGroupedShipments]);
  const availableSectors = useMemo(() => {
    const uniqueSectors = new Set(allShipments.map((s) => s.secteur).filter(Boolean));
    return Array.from(uniqueSectors).sort();
  }, [allShipments]);
  const handleDeleteGroup = useCallback(async (clientName, shipmentsToDelete) => {
    if (!shipmentsToDelete || shipmentsToDelete.length === 0) return;
    const shipmentCount = shipmentsToDelete.length;
    const confirmation = window.confirm(`Êtes-vous sûr de vouloir supprimer les ${shipmentCount} envoi${shipmentCount > 1 ? "s" : ""} pour le client "${clientName}" ? Cette action est irréversible.`);
    if (confirmation) {
      setDeletingGroup(clientName);
      const shipmentIdsToDelete = shipmentsToDelete.map((s) => s.id);
      const deletePromises = shipmentIdsToDelete.map((id) => deleteShipmentSdk(id));
      try {
        const results = await Promise.allSettled(deletePromises);
        const successfulDeletes = results.filter((r) => r.status === "fulfilled").length;
        const failedDeletes = results.filter((r) => r.status === "rejected").length;
        if (failedDeletes > 0) {
          console.error(`Failed to delete ${failedDeletes} shipments for client ${clientName}.`);
          const errorMessages = results.filter((r) => r.status === "rejected").map((r) => r.reason instanceof Error ? r.reason.message : String(r.reason)).join(", ");
          addToast({ type: "error", message: `Erreur lors de la suppression de ${failedDeletes} envoi${failedDeletes > 1 ? "s" : ""} pour ${clientName}. Détails: ${errorMessages}` });
        }
        if (successfulDeletes > 0) {
          setAllShipments((prevShipments) => prevShipments.filter((s) => !shipmentIdsToDelete.includes(s.id)));
          addToast({ type: "success", message: `${successfulDeletes} envoi${successfulDeletes > 1 ? "s" : ""} pour ${clientName} supprimé${successfulDeletes > 1 ? "s" : ""} avec succès.` });
        }
      } catch (error2) {
        console.error("Unexpected error during group deletion:", error2);
        const errorMessage = error2 instanceof Error ? error2.message : String(error2);
        addToast({ type: "error", message: `Erreur inattendue lors de la suppression du groupe: ${errorMessage}` });
      } finally {
        setDeletingGroup(null);
      }
    }
  }, [addToast]);
  const isAdmin = (userProfile == null ? void 0 : userProfile.role) === "Admin";
  if (!user && !isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "text-center text-jdc-gray-400 py-10", children: "Veuillez vous connecter pour voir les envois." });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-semibold text-white mb-4 flex items-center", children: [
      /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTruckFast, className: "mr-3 text-jdc-yellow" }),
      "Suivi des Envois CTN"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-jdc-card rounded-lg shadow", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-span-1", children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: "sector-filter", className: "block text-sm font-medium text-jdc-gray-300 mb-1", children: [
          /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faFilter, className: "mr-1" }),
          " Filtrer par Secteur"
        ] }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "sector-filter",
            name: "sector-filter",
            value: selectedSector,
            onChange: (e) => setSelectedSector(e.target.value),
            className: "block w-full rounded-md bg-jdc-gray-800 border-transparent focus:border-jdc-yellow focus:ring focus:ring-jdc-yellow focus:ring-opacity-50 text-white py-2 pl-3 pr-10",
            disabled: isLoading || availableSectors.length === 0,
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Tous les secteurs" }),
              availableSectors.map((sector) => /* @__PURE__ */ jsx("option", { value: sector, children: sector }, sector))
            ]
          }
        ),
        availableSectors.length === 0 && !isLoading && allShipments.length > 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-jdc-gray-500 mt-1", children: "Aucun secteur trouvé dans les envois affichés." }),
        availableSectors.length === 0 && !isLoading && allShipments.length === 0 && !error && /* @__PURE__ */ jsx("p", { className: "text-xs text-jdc-gray-500 mt-1", children: "Aucun envoi accessible trouvé." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "col-span-1 md:col-span-2", children: /* @__PURE__ */ jsx(
        Input,
        {
          label: "Rechercher (Client, ID, Article...)",
          id: "search-client",
          name: "search-client",
          placeholder: "Entrez un nom, code, ID, article...",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          icon: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faSearch }),
          wrapperClassName: "mb-0",
          disabled: isLoading
        }
      ) })
    ] }),
    isLoading && /* @__PURE__ */ jsxs("div", { className: "text-center text-jdc-gray-400 py-10", children: [
      /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faSpinner, spin: true, className: "text-2xl mr-2" }),
      "Chargement des envois..."
    ] }),
    error && !isLoading && /* @__PURE__ */ jsx("div", { className: "text-center text-red-400 bg-red-900 bg-opacity-50 p-4 rounded-lg", children: error }),
    !isLoading && !error && clientGroups.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center text-jdc-gray-400 py-10", children: allShipments.length > 0 ? "Aucun envoi trouvé correspondant à votre recherche ou filtre." : "Aucun envoi accessible trouvé pour votre compte. Vérifiez vos secteurs assignés si vous n'êtes pas Admin." }),
    !isLoading && !error && clientGroups.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: clientGroups.map(([clientName, clientShipments]) => {
      var _a;
      return /* @__PURE__ */ jsx("div", { className: "bg-jdc-card rounded-lg shadow overflow-hidden", children: /* @__PURE__ */ jsxs("details", { className: "group", children: [
        /* @__PURE__ */ jsxs("summary", { className: "flex items-center justify-between p-4 cursor-pointer hover:bg-jdc-gray-800 list-none transition-colors gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center min-w-0 mr-2 flex-grow", children: [
            /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faBuilding, className: "mr-3 text-jdc-gray-300 text-lg flex-shrink-0" }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-white text-lg block truncate", title: clientName, children: clientName }),
              /* @__PURE__ */ jsxs("span", { className: "ml-0 md:ml-3 text-sm text-jdc-gray-400", children: [
                "(",
                clientShipments.length,
                " envoi",
                clientShipments.length > 1 ? "s" : "",
                ")"
              ] }),
              ((_a = clientShipments[0]) == null ? void 0 : _a.codeClient) && clientShipments[0].codeClient !== clientName && /* @__PURE__ */ jsxs("span", { className: "block text-xs text-jdc-gray-500 truncate", title: `Code: ${clientShipments[0].codeClient}`, children: [
                "Code: ",
                clientShipments[0].codeClient
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center flex-shrink-0 space-x-3", children: [
            isAdmin && /* @__PURE__ */ jsx(
              Button,
              {
                variant: "danger",
                size: "sm",
                title: `Supprimer tous les envois pour ${clientName}`,
                onClick: (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteGroup(clientName, clientShipments);
                },
                isLoading: deletingGroup === clientName,
                disabled: deletingGroup !== null && deletingGroup !== clientName,
                leftIcon: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTrash }),
                className: "flex-shrink-0",
                children: "Suppr. Groupe"
              }
            ),
            /* @__PURE__ */ jsx(
              FontAwesomeIcon,
              {
                icon: faChevronRight,
                className: "text-jdc-gray-400 transition-transform duration-200 group-open:rotate-90 text-xl flex-shrink-0"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "border-t border-jdc-gray-700 bg-jdc-gray-900 p-4 space-y-3", children: clientShipments.map((shipment) => {
          const statusStyle = getShipmentStatusStyle(shipment.statutExpedition);
          const truncatedArticle = shipment.articleNom && shipment.articleNom.length > 50 ? `${shipment.articleNom.substring(0, 47)}...` : shipment.articleNom;
          return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm border-b border-jdc-gray-700 pb-2 last:border-b-0 gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 mr-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-jdc-gray-200 block font-medium truncate", title: shipment.articleNom, children: truncatedArticle || "Article non spécifié" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center flex-wrap mt-1 space-x-2", children: [
                /* @__PURE__ */ jsx("span", { className: `inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyle.bgColor} ${statusStyle.textColor}`, children: shipment.statutExpedition || "Inconnu" }),
                /* @__PURE__ */ jsxs("span", { className: "text-jdc-gray-500 text-xs whitespace-nowrap", title: `ID: ${shipment.id}`, children: [
                  "ID: ",
                  shipment.id.substring(0, 8),
                  "..."
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-jdc-gray-500 text-xs whitespace-nowrap", children: [
                  "Secteur: ",
                  shipment.secteur || "N/A"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center flex-shrink-0 space-x-2", children: shipment.trackingLink && /* @__PURE__ */ jsx(
              Button,
              {
                as: "link",
                to: shipment.trackingLink,
                target: "_blank",
                rel: "noopener noreferrer",
                variant: "secondary",
                size: "sm",
                title: "Suivre le colis",
                leftIcon: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faExternalLinkAlt }),
                children: "Suivi"
              }
            ) })
          ] }, shipment.id);
        }) })
      ] }) }, clientName);
    }) })
  ] });
}
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: EnvoisCtn,
  meta: meta$2
}, Symbol.toStringTag, { value: "Module" }));
const getStatTypeFromTitle = (title) => {
  if (title.toLowerCase().includes("ticket")) return "ticket SAP";
  if (title.toLowerCase().includes("envois")) return "envois CTN";
  if (title.toLowerCase().includes("client")) return "clients actifs";
  return "données";
};
const StatsCard = ({ title, value, icon, isLoading = false, evolutionValue }) => {
  const showEvolution = typeof evolutionValue === "number" && evolutionValue !== 0;
  const isPositive = evolutionValue && evolutionValue > 0;
  const evolutionColor = isPositive ? "text-green-500" : "text-red-500";
  const evolutionArrow = isPositive ? "↑" : "↓";
  const statType = getStatTypeFromTitle(title);
  return /* @__PURE__ */ jsxs("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg flex items-start space-x-4 transition-colors duration-200 hover:bg-jdc-gray-800", children: [
    /* @__PURE__ */ jsx("div", { className: "p-3 rounded-full bg-jdc-yellow text-black flex-shrink-0 mt-1", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon, className: "h-6 w-6" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-grow", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-jdc-gray-400", children: title }),
      /* @__PURE__ */ jsx("p", { className: `text-2xl font-semibold text-white mt-1 ${isLoading ? "animate-pulse" : ""}`, children: isLoading ? /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faSpinner, spin: true }) : value }),
      !isLoading && showEvolution && /* @__PURE__ */ jsxs("p", { className: `text-xs font-medium ${evolutionColor} mt-1`, children: [
        "évolution ",
        statType,
        " (24h) : ",
        evolutionArrow,
        " ",
        isPositive ? "+" : "",
        evolutionValue
      ] }),
      !isLoading && !showEvolution && /* @__PURE__ */ jsxs("p", { className: "text-xs font-medium text-transparent mt-1 h-[1em]", children: [
        " ",
        "  "
      ] })
    ] })
  ] });
};
const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        "jdc-yellow": "#FFD700"
      }
    }
  }
};
const jdcYellowColor = tailwindConfig.theme.extend.colors["jdc-yellow"];
const RecentTickets = ({ tickets, isLoading = false, error = null }) => {
  const getClientDisplay = (ticket) => {
    return ticket.raisonSociale || ticket.codeClient || "Client inconnu";
  };
  const getSummaryDisplay = (summary) => {
    if (!summary) return "Pas de résumé";
    return summary.length > 40 ? summary.substring(0, 40) + "..." : summary;
  };
  const getStatusClasses = (status) => {
    switch (status) {
      case "Nouveau":
        return "bg-green-600 text-white";
      case "Demande de RMA":
        return "bg-blue-600 text-white";
      case "Ouvert":
        return "bg-red-600 text-white";
      case "En cours":
        return "bg-yellow-500 text-black";
      case "Fermé":
        return "bg-gray-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg", children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold text-white mb-3 flex items-center", children: [
      /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTicket, className: "mr-2", color: jdcYellowColor }),
      "Tickets SAP Récents"
    ] }),
    isLoading && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center text-jdc-gray-300 py-4", children: [
      /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faSpinner, spin: true, className: "mr-2" }),
      "Chargement..."
    ] }),
    error && !isLoading && /* @__PURE__ */ jsxs("div", { className: "flex items-center text-red-400 py-4", children: [
      /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faExclamationTriangle, className: "mr-2" }),
      "Erreur: ",
      error
    ] }),
    !isLoading && !error && tickets.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-jdc-gray-400 text-center py-4", children: "Aucun ticket récent à afficher." }),
    !isLoading && !error && tickets.length > 0 && /* @__PURE__ */ jsx("ul", { className: "space-y-2 max-h-60 overflow-y-auto pr-2", children: tickets.map((ticket) => /* @__PURE__ */ jsxs("li", { className: "flex justify-between items-start text-sm p-2 bg-jdc-gray-800 rounded hover:bg-jdc-gray-700", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-grow mr-2", children: [
        /* @__PURE__ */ jsx("span", { className: "font-medium text-white block", children: getClientDisplay(ticket) }),
        /* @__PURE__ */ jsxs("span", { className: "text-jdc-gray-400 block text-xs", children: [
          getSummaryDisplay(ticket.summary),
          " - ",
          ticket.secteur || "Secteur N/A"
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-jdc-gray-500 block text-xs italic", children: formatDateForDisplay(parseFrenchDate(ticket.date)) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 text-right", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${getStatusClasses(ticket.statut)}`, children: ticket.statut || "N/A" }) })
    ] }, ticket.id)) })
  ] });
};
const getUniqueClientNames = (shipments) => {
  if (!Array.isArray(shipments)) {
    return [];
  }
  const names = /* @__PURE__ */ new Set();
  shipments.forEach((shipment) => {
    if (shipment.nomClient) {
      names.add(shipment.nomClient);
    }
  });
  return Array.from(names).sort((a, b) => a.localeCompare(b));
};
const RecentShipments = ({ shipments, isLoading }) => {
  const uniqueClientNames = useMemo(() => getUniqueClientNames(shipments), [shipments]);
  return /* @__PURE__ */ jsxs("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg", children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold text-white mb-3 flex items-center", children: [
      /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTruckFast, className: "mr-2 text-jdc-yellow" }),
      "Clients CTN Récents (via Envois)"
    ] }),
    isLoading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center text-jdc-gray-300 py-4", children: [
      /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTruckFast, spin: true, className: "mr-2" }),
      "Chargement..."
    ] }) : uniqueClientNames.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-jdc-gray-400 text-center py-4", children: "Aucun client trouvé dans les envois récents." }) : (
      // Use similar list styling as RecentTickets
      /* @__PURE__ */ jsx("ul", { className: "space-y-2 max-h-60 overflow-y-auto pr-2", children: uniqueClientNames.map((clientName) => (
        // Apply tile styling to the list item itself
        /* @__PURE__ */ jsx("li", { className: "text-sm p-2 bg-jdc-gray-800 rounded hover:bg-jdc-gray-700 transition-colors duration-150", children: /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/envois-ctn?client=${encodeURIComponent(clientName)}`,
            className: "flex items-center w-full",
            children: [
              /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faBuilding, className: "mr-2 text-jdc-gray-300 flex-shrink-0" }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-medium text-white truncate", title: clientName, children: clientName })
            ]
          }
        ) }, clientName)
      )) })
    )
  ] });
};
function ClientOnly({ children, fallback = null }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) {
    return fallback;
  }
  return children();
}
const InteractiveMap = lazy(() => import("./InteractiveMap-C21fgt-C.js"));
const meta$1 = () => {
  return [{ title: "Tableau de Bord | JDC Dashboard" }];
};
const loader$3 = async ({ request }) => {
  console.log("Dashboard Loader: Executing...");
  const session = await authenticator.isAuthenticated(request);
  let calendarEvents = [];
  let calendarError = null;
  if (session) {
    console.log("Dashboard Loader: User authenticated, attempting to fetch calendar events.");
    try {
      const authClient = await getGoogleAuthClient(session);
      const { startOfWeek, endOfWeek } = getWeekDateRangeForAgenda();
      const timeMin = startOfWeek.toISOString();
      const timeMax = endOfWeek.toISOString();
      const rawEvents = await getCalendarEvents(authClient, timeMin, timeMax);
      calendarEvents = rawEvents.map((event) => ({
        id: event.id,
        summary: event.summary,
        start: event.start,
        end: event.end,
        htmlLink: event.htmlLink
      }));
      console.log(`Dashboard Loader: Fetched ${calendarEvents.length} calendar events.`);
    } catch (error) {
      console.error("Dashboard Loader: Error fetching calendar events:", error);
      calendarError = error.message || "Erreur lors de la récupération de l'agenda.";
      if (error.message.includes("token") || error.message.includes("authenticate")) {
        calendarError = "Erreur d'authentification Google Calendar. Veuillez vous reconnecter.";
      }
      if (error.message.includes("Permission denied")) {
        calendarError = "Accès à Google Calendar refusé. Vérifiez les autorisations.";
      }
      if (error.message.includes("Quota exceeded") || error.message.includes("RESOURCE_EXHAUSTED")) {
        calendarError = "Quota Google Calendar dépassé.";
      }
    }
  } else {
    console.log("Dashboard Loader: User not authenticated.");
  }
  return json({ calendarEvents, calendarError });
};
const MapLoadingFallback = () => /* @__PURE__ */ jsxs("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[450px]", children: [
  /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faSpinner, spin: true, className: "text-jdc-yellow text-3xl mb-4" }),
  /* @__PURE__ */ jsx("p", { className: "text-jdc-gray-400 text-center", children: "Chargement de la carte..." })
] });
const MapLoginPrompt = () => /* @__PURE__ */ jsxs("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[450px]", children: [
  /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faMapMarkedAlt, className: "text-jdc-gray-500 text-4xl mb-4" }),
  /* @__PURE__ */ jsx("p", { className: "text-jdc-gray-400 text-center", children: "Connectez-vous pour voir la carte des tickets." })
] });
const WeeklyAgenda = ({ events, error, isLoading }) => {
  if (isLoading) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg min-h-[200px] flex items-center justify-center", children: [
      /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faSpinner, spin: true, className: "text-jdc-yellow text-xl mr-2" }),
      /* @__PURE__ */ jsx("span", { className: "text-jdc-gray-400", children: "Chargement de l'agenda..." })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg min-h-[200px]", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold text-white mb-2 flex items-center", children: [
        /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faCalendarDays, className: "mr-2 text-jdc-blue" }),
        "Agenda de la semaine"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-red-400 bg-red-900 bg-opacity-50 p-3 rounded", children: [
        /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faExclamationTriangle, className: "mr-1" }),
        " ",
        error
      ] })
    ] });
  }
  if (events.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg min-h-[200px]", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold text-white mb-2 flex items-center", children: [
        /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faCalendarDays, className: "mr-2 text-jdc-blue" }),
        "Agenda de la semaine"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-jdc-gray-400", children: "Aucun événement trouvé pour cette période." })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "bg-jdc-card p-4 rounded-lg shadow-lg min-h-[200px]", children: [
    /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold text-white mb-3 flex items-center", children: [
      /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faCalendarDays, className: "mr-2 text-jdc-blue" }),
      "Agenda de la semaine"
    ] }),
    /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: events.map((event) => /* @__PURE__ */ jsxs("li", { className: "text-sm border-b border-jdc-gray-700 pb-1 last:border-b-0", children: [
      /* @__PURE__ */ jsx("span", { className: "font-medium text-jdc-gray-200", children: event.summary || "(Sans titre)" }),
      /* @__PURE__ */ jsxs("span", { className: "text-xs text-jdc-gray-400 ml-2", children: [
        "(",
        formatEventTime(event.start),
        " - ",
        formatEventTime(event.end),
        ")"
      ] }),
      event.htmlLink && /* @__PURE__ */ jsx("a", { href: event.htmlLink, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-jdc-blue hover:underline ml-2", children: "(Voir)" })
    ] }, event.id)) })
  ] });
};
const formatEventTime = (eventDateTime) => {
  if (!eventDateTime) return "N/A";
  if (eventDateTime.dateTime) {
    try {
      return new Date(eventDateTime.dateTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Heure invalide";
    }
  }
  if (eventDateTime.date) {
    try {
      const [year, month, day] = eventDateTime.date.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
    } catch {
      return "Date invalide";
    }
  }
  return "N/A";
};
function Dashboard() {
  const { user, profile, profileLoading } = useOutletContext();
  const { calendarEvents, calendarError } = useLoaderData();
  const [liveTicketCount, setLiveTicketCount] = useState(null);
  const [liveDistinctClientCountFromEnvoi, setLiveDistinctClientCountFromEnvoi] = useState(null);
  const [evolution, setEvolution] = useState({
    ticketCount: null,
    distinctClientCountFromEnvoi: null
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [recentShipments, setRecentShipments] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [clientError, setClientError] = useState(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  useEffect(() => {
    const loadDashboardData = async () => {
      if (profileLoading) {
        console.log("Dashboard Effect: Waiting for profile to load...");
        return;
      }
      if (user && !profile) {
        console.warn("Dashboard Effect: User session exists but profile is null after loading.");
      }
      if (!user) {
        setLoadingStats(false);
        setLoadingTickets(false);
        setLoadingShipments(false);
        setLiveTicketCount(null);
        setLiveDistinctClientCountFromEnvoi(null);
        setEvolution({ ticketCount: null, distinctClientCountFromEnvoi: null });
        setRecentTickets([]);
        setRecentShipments([]);
        setClientError(null);
        return;
      }
      setLoadingStats(true);
      setLoadingTickets(true);
      setLoadingShipments(true);
      setClientError(null);
      console.log("Dashboard Effect: Fetching client-side data (stats, tickets, shipments)...");
      try {
        const userProfile = profile;
        const userSectors = (userProfile == null ? void 0 : userProfile.secteurs) ?? [];
        const sectorsForTickets = userSectors;
        const sectorsForShipments = (userProfile == null ? void 0 : userProfile.role) === "Admin" ? [] : userSectors;
        console.log(`Dashboard Effect: Using sectors for tickets: ${JSON.stringify(sectorsForTickets)}`);
        console.log(`Dashboard Effect: Using sectors for shipments: ${sectorsForShipments.length === 0 && (userProfile == null ? void 0 : userProfile.role) === "Admin" ? "(Admin - All)" : JSON.stringify(sectorsForShipments)}`);
        const results = await Promise.allSettled([
          getLatestStatsSnapshotsSdk(1),
          getTotalTicketCountSdk(sectorsForTickets),
          getDistinctClientCountFromEnvoiSdk(userProfile),
          // Pass profile directly
          getRecentTicketsForSectors(sectorsForTickets, 20),
          getRecentShipmentsForSectors(sectorsForShipments, 20)
        ]);
        const snapshotResult = results[0];
        const ticketCountResult = results[1];
        const distinctClientCountResult = results[2];
        const latestSnapshot = snapshotResult.status === "fulfilled" && snapshotResult.value.length > 0 ? snapshotResult.value[0] : null;
        const fetchedLiveTicketCount = ticketCountResult.status === "fulfilled" ? ticketCountResult.value : null;
        const fetchedLiveDistinctClientCountFromEnvoi = distinctClientCountResult.status === "fulfilled" ? distinctClientCountResult.value : null;
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(`Dashboard Effect: Error fetching client-side data at index ${index}:`, result.reason);
            if (!clientError) {
              if (index === 0) setClientError("Erreur chargement évolution.");
              if (index === 1) setClientError("Erreur chargement total tickets.");
              if (index === 2) setClientError("Erreur chargement clients distincts.");
            }
          }
        });
        setLiveTicketCount(fetchedLiveTicketCount);
        setLiveDistinctClientCountFromEnvoi(fetchedLiveDistinctClientCountFromEnvoi);
        const calculatedEvolution = { ticketCount: null, distinctClientCountFromEnvoi: null };
        if (latestSnapshot) {
          if (fetchedLiveTicketCount !== null && latestSnapshot.totalTickets !== void 0) {
            calculatedEvolution.ticketCount = fetchedLiveTicketCount - latestSnapshot.totalTickets;
          }
          if (fetchedLiveDistinctClientCountFromEnvoi !== null && latestSnapshot.activeClients !== void 0) {
            calculatedEvolution.distinctClientCountFromEnvoi = fetchedLiveDistinctClientCountFromEnvoi - latestSnapshot.activeClients;
          }
        } else {
          if (snapshotResult.status === "rejected" && !clientError) {
            setClientError("Données snapshot manquantes.");
          }
        }
        setEvolution(calculatedEvolution);
        const recentTicketsResult = results[3];
        const recentShipmentsResult = results[4];
        setRecentTickets(recentTicketsResult.status === "fulfilled" ? recentTicketsResult.value : []);
        setRecentShipments(recentShipmentsResult.status === "fulfilled" ? recentShipmentsResult.value : []);
      } catch (err) {
        setClientError(err.message || "Erreur générale chargement données client.");
        setLiveTicketCount(null);
        setLiveDistinctClientCountFromEnvoi(null);
        setEvolution({ ticketCount: null, distinctClientCountFromEnvoi: null });
        setRecentTickets([]);
        setRecentShipments([]);
      } finally {
        setLoadingStats(false);
        setLoadingTickets(false);
        setLoadingShipments(false);
        console.log("Dashboard Effect: Client-side data fetching finished.");
      }
    };
    loadDashboardData();
  }, [user, profile, profileLoading, fetchTrigger]);
  const formatStatValue = (value, isLoading) => {
    if (isLoading) return "...";
    if (value === null || value === void 0) return "N/A";
    return value.toString();
  };
  const statsData = [
    { title: "Tickets SAP (Total)", valueState: liveTicketCount, icon: faTicket, evolutionKey: "ticketCount", loadingState: loadingStats },
    { title: "Clients CTN (Distincts)", valueState: liveDistinctClientCountFromEnvoi, icon: faUsers, evolutionKey: "distinctClientCountFromEnvoi", loadingState: loadingStats }
  ];
  const isOverallLoading = loadingStats || loadingTickets || loadingShipments || profileLoading;
  const ticketsForList = recentTickets.slice(0, 5);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold text-white", children: "Tableau de Bord" }),
    clientError && /* @__PURE__ */ jsxs("div", { className: "flex items-center p-4 bg-red-800 text-white rounded-lg mb-4", children: [
      /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faExclamationTriangle, className: "mr-2" }),
      clientError
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: statsData.map((stat) => {
      const isLoading = stat.loadingState;
      const mainValue = stat.valueState;
      const evolutionDisplayValue = evolution[stat.evolutionKey];
      return /* @__PURE__ */ jsx(
        StatsCard,
        {
          title: stat.title,
          value: formatStatValue(mainValue, isLoading),
          icon: stat.icon,
          isLoading,
          evolutionValue: evolutionDisplayValue
        },
        stat.title
      );
    }) }),
    /* @__PURE__ */ jsx(
      WeeklyAgenda,
      {
        events: calendarEvents,
        error: calendarError,
        isLoading: !user && !calendarError
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "w-full mb-6", children: /* @__PURE__ */ jsx(ClientOnly, { fallback: /* @__PURE__ */ jsx(MapLoadingFallback, {}), children: () => (
      // Use profile from context
      user ? /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(MapLoadingFallback, {}), children: /* @__PURE__ */ jsx(
        InteractiveMap,
        {
          tickets: recentTickets,
          isLoadingTickets: loadingTickets
        }
      ) }) : /* @__PURE__ */ jsx(MapLoginPrompt, {})
    ) }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsx(
        RecentTickets,
        {
          tickets: ticketsForList,
          isLoading: loadingTickets
        }
      ),
      /* @__PURE__ */ jsx(
        RecentShipments,
        {
          shipments: recentShipments,
          isLoading: loadingShipments
        }
      )
    ] }),
    !user && !isOverallLoading && !clientError && /* @__PURE__ */ jsx("div", { className: "p-4 bg-jdc-card rounded-lg text-center text-jdc-gray-300 mt-6", children: "Veuillez vous connecter pour voir le tableau de bord." })
  ] });
}
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Dashboard,
  loader: loader$3,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
async function loader$2({ request }) {
  var _a, _b;
  const url = new URL(request.url);
  const code = ((_a = url.searchParams.get("code")) == null ? void 0 : _a.trim()) || "";
  const nom = ((_b = url.searchParams.get("nom")) == null ? void 0 : _b.trim()) || "";
  console.log("Articles Loader: Returning search params", { code, nom });
  return json({ searchParams: { code, nom } });
}
function ArticlesSearch() {
  const { searchParams: loaderSearchParams } = useLoaderData();
  const [searchParams] = useSearchParams();
  const { user, loadingAuth } = useOutletContext();
  const [localArticles, setLocalArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [codeSearch, setCodeSearch] = useState(loaderSearchParams.code);
  const [nomSearch, setNomSearch] = useState(loaderSearchParams.nom);
  const [uploadingImageId, setUploadingImageId] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [deletingImageUrl, setDeletingImageUrl] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  useEffect(() => {
    var _a, _b;
    const currentCode = ((_a = searchParams.get("code")) == null ? void 0 : _a.trim()) || "";
    const currentNom = ((_b = searchParams.get("nom")) == null ? void 0 : _b.trim()) || "";
    setCodeSearch(currentCode);
    setNomSearch(currentNom);
    if (!loadingAuth && user && (currentCode || currentNom)) {
      const performSearch = async () => {
        setIsLoading(true);
        setFetchError(null);
        setLocalArticles([]);
        console.log("Client Search: Performing search for", { code: currentCode, nom: currentNom });
        try {
          const results = await searchArticles({ code: currentCode, nom: currentNom });
          setLocalArticles(results);
          console.log("Client Search: Found results", results);
        } catch (err) {
          console.error("Client Search: Error fetching articles", err);
          setFetchError(err.message || "Erreur lors de la recherche côté client.");
        } finally {
          setIsLoading(false);
        }
      };
      performSearch();
    } else {
      setLocalArticles([]);
      setIsLoading(false);
      setFetchError(null);
    }
  }, [searchParams, loadingAuth, user]);
  const handleAddPhotoClick = (articleId) => {
    setUploadError(null);
    setUploadingImageId(null);
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("data-article-id", articleId);
      fileInputRef.current.click();
    }
  };
  const handleFileSelected = async (event) => {
    var _a, _b;
    const file = (_a = event.target.files) == null ? void 0 : _a[0];
    const targetArticleId = event.target.getAttribute("data-article-id");
    if (file && targetArticleId) {
      console.log(`Fichier sélectionné: ${file.name} pour l'article ID: ${targetArticleId}`);
      setUploadingImageId(targetArticleId);
      setUploadError(null);
      setDeleteError(null);
      const CLOUDINARY_CLOUD_NAME = "dkeqzl54y";
      const CLOUDINARY_UPLOAD_PRESET = "jdc-img";
      const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      try {
        console.log(`Upload vers Cloudinary pour l'article ${targetArticleId}...`);
        const response = await fetch(CLOUDINARY_API_URL, {
          method: "POST",
          body: formData
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erreur API Cloudinary:", errorData);
          throw new Error(((_b = errorData.error) == null ? void 0 : _b.message) || `Échec de l'upload Cloudinary (HTTP ${response.status})`);
        }
        const data = await response.json();
        const imageUrl = data.secure_url;
        console.log("Upload Cloudinary réussi. URL:", imageUrl);
        await addArticleImageUrl(targetArticleId, imageUrl);
        console.log("Mise à jour Firestore terminée pour", targetArticleId);
        setLocalArticles(
          (prevArticles) => prevArticles.map((art) => {
            if (art.id === targetArticleId) {
              const updatedUrls = [...art.imageUrls || [], imageUrl];
              return { ...art, imageUrls: updatedUrls };
            }
            return art;
          })
        );
      } catch (error) {
        console.error("Erreur pendant l'upload ou la mise à jour Firestore:", error);
        setUploadError(error.message || "Échec de l'upload de l'image.");
      } finally {
        setUploadingImageId(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
          fileInputRef.current.removeAttribute("data-article-id");
        }
      }
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.removeAttribute("data-article-id");
      }
    }
  };
  const openImageModal = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setIsImageModalOpen(true);
  };
  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImageUrl(null);
  };
  const handleDeleteImage = async (articleId, imageUrl) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette image ? Cette action est irréversible.")) {
      return;
    }
    console.log(`Tentative de suppression de l'image: ${imageUrl} pour l'article: ${articleId}`);
    setDeletingImageUrl(imageUrl);
    setDeleteError(null);
    setUploadError(null);
    try {
      await deleteArticleImageUrl(articleId, imageUrl);
      console.log("Suppression de l'URL dans Firestore réussie.");
      setLocalArticles(
        (prevArticles) => prevArticles.map((art) => {
          if (art.id === articleId) {
            const updatedUrls = (art.imageUrls || []).filter((url) => url !== imageUrl);
            return { ...art, imageUrls: updatedUrls };
          }
          return art;
        })
      );
    } catch (error) {
      console.error("Erreur pendant la suppression de l'URL de l'image:", error);
      setDeleteError(error.message || "Échec de la suppression de l'image.");
    } finally {
      setDeletingImageUrl(null);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto p-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-4 text-gray-100", children: "Recherche d'Articles" }),
    /* @__PURE__ */ jsx(Form, { method: "get", className: "mb-6 p-4 border border-gray-700 rounded-lg shadow-sm bg-jdc-blue-darker", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "code", className: "block text-sm font-medium text-gray-300 mb-1", children: "Code Article" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "code",
            id: "code",
            value: codeSearch,
            onChange: (e) => setCodeSearch(e.target.value),
            className: "w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-jdc-gray-800 text-gray-100 placeholder-gray-400",
            placeholder: "Code exact"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "nom", className: "block text-sm font-medium text-gray-300 mb-1", children: "Nom Article" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "nom",
            id: "nom",
            value: nomSearch,
            onChange: (e) => setNomSearch(e.target.value),
            className: "w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-jdc-gray-800 text-gray-100 placeholder-gray-400",
            placeholder: "Nom partiel ou complet"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "md:pt-6", children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-150 ease-in-out",
          children: "Rechercher"
        }
      ) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-jdc-blue-darker p-4 border border-gray-700 rounded-lg shadow-sm", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-3 text-gray-200", children: "Résultats" }),
      isLoading && /* @__PURE__ */ jsx("p", { className: "text-gray-400 italic", children: "Chargement des articles..." }),
      fetchError && !isLoading && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-sm", children: fetchError }),
      deleteError && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-sm mt-2", children: deleteError }),
      " ",
      !isLoading && !fetchError && /* @__PURE__ */ jsx(Fragment, { children: localArticles.length > 0 ? /* @__PURE__ */ jsx("ul", { className: "divide-y divide-gray-700", children: localArticles.map((article) => {
        const isUploadingCurrent = uploadingImageId === article.id;
        return /* @__PURE__ */ jsxs("li", { className: "py-4 px-1 hover:bg-jdc-gray-800", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("p", { className: "font-medium text-gray-100", children: [
                "Code: ",
                article.Code
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-300", children: [
                "Désignation: ",
                article.Désignation
              ] }),
              article.imageUrls && article.imageUrls.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: article.imageUrls.map((url, index) => {
                const isDeletingCurrent = deletingImageUrl === url;
                return /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
                  " ",
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: url,
                      alt: `Image ${index + 1} pour ${article.Code}`,
                      className: `h-16 w-16 object-cover rounded border border-gray-600 transition-opacity ${isDeletingCurrent ? "opacity-50" : "group-hover:opacity-70 cursor-pointer"}`,
                      loading: "lazy",
                      onClick: () => !isDeletingCurrent && openImageModal(url)
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: (e) => {
                        e.stopPropagation();
                        handleDeleteImage(article.id, url);
                      },
                      disabled: isDeletingCurrent,
                      className: `absolute top-0 right-0 p-1 bg-red-600 bg-opacity-75 rounded-full text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity ${isDeletingCurrent ? "cursor-not-allowed opacity-50" : "hover:bg-red-700"}`,
                      "aria-label": "Supprimer l'image",
                      children: isDeletingCurrent ? /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faSpinner, spin: true, className: "h-3 w-3" }) : /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTrashAlt, className: "h-3 w-3" })
                    }
                  )
                ] }, index);
              }) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "ml-4 flex-shrink-0", children: /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => handleAddPhotoClick(article.id),
                disabled: isUploadingCurrent,
                className: `inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded shadow-sm text-white ${isUploadingCurrent ? "bg-gray-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-jdc-blue-darker focus:ring-indigo-500"}`,
                children: [
                  isUploadingCurrent ? /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faSpinner, spin: true, className: "mr-2" }) : /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faPlus, className: "-ml-1 mr-2 h-4 w-4", "aria-hidden": "true" }),
                  /* @__PURE__ */ jsx("span", { children: isUploadingCurrent ? "Upload..." : "Photo" })
                ]
              }
            ) })
          ] }),
          uploadError && uploadingImageId === article.id && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-xs mt-1", children: uploadError })
        ] }, article.id);
      }) }) : /* @__PURE__ */ jsxs("p", { className: "text-gray-400 italic", children: [
        searchParams.get("code") || searchParams.get("nom") ? "Aucun article trouvé pour ces critères." : "Effectuez une recherche pour afficher les résultats.",
        !user && !loadingAuth && " Veuillez vous connecter pour effectuer une recherche."
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "file",
        ref: fileInputRef,
        onChange: handleFileSelected,
        accept: "image/*",
        style: { display: "none" },
        "data-article-id": ""
      }
    ),
    isImageModalOpen && selectedImageUrl && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4",
        onClick: closeImageModal,
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "relative bg-white p-2 rounded-lg max-w-3xl max-h-[80vh]",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  src: selectedImageUrl,
                  alt: "Image agrandie",
                  className: "block max-w-full max-h-[calc(80vh-40px)] object-contain"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: closeImageModal,
                  className: "absolute top-2 right-2 text-black bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-1 focus:outline-none",
                  "aria-label": "Fermer l'image",
                  children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTimes, size: "lg" })
                }
              )
            ]
          }
        )
      }
    )
  ] });
}
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ArticlesSearch,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const meta = () => {
  return [{ title: "Clients | JDC Dashboard" }];
};
function Clients() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-white", children: "Gestion des Clients" }),
    /* @__PURE__ */ jsx("p", { className: "text-jdc-gray-400 mt-2", children: "Page en construction." })
  ] });
}
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Clients,
  meta
}, Symbol.toStringTag, { value: "Module" }));
async function action({ request }) {
  await authenticator.logout(request, { redirectTo: "/" });
}
async function loader$1() {
  return redirect("/");
}
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const loader = async ({ request }) => {
  return redirect("/dashboard");
};
function Index() {
  return /* @__PURE__ */ jsx("div", { className: "p-6 text-center", children: /* @__PURE__ */ jsx("h1", { className: "text-xl text-jdc-gray-300", children: "Redirection vers le tableau de bord..." }) });
}
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const Card = ({ children, className = "", as = "div" }) => {
  const Tag = as;
  const baseStyle = "bg-jdc-card rounded-lg shadow-lg overflow-hidden transition duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-xl";
  return /* @__PURE__ */ jsx(Tag, { className: `${baseStyle} ${className}`, children });
};
const CardHeader = ({ children, className = "" }) => {
  const baseStyle = "px-4 py-3 sm:px-6 border-b border-jdc-gray-800";
  return /* @__PURE__ */ jsx("div", { className: `${baseStyle} ${className}`, children });
};
const CardBody = ({ children, className = "" }) => {
  const baseStyle = "px-4 py-4 sm:p-6";
  return /* @__PURE__ */ jsx("div", { className: `${baseStyle} ${className}`, children });
};
const Select = ({
  label,
  id,
  name,
  options,
  value,
  onChange,
  disabled,
  required,
  error,
  className = "",
  containerClassName = "",
  ...props
}) => {
  const baseStyle = "block w-full px-3 py-2 bg-jdc-gray-800 border border-jdc-gray-700 rounded-md shadow-sm placeholder-jdc-gray-500 focus:outline-none focus:ring-jdc-yellow focus:border-jdc-yellow sm:text-sm text-white disabled:opacity-50";
  const errorStyle = error ? "border-red-500 ring-red-500" : "border-jdc-gray-700";
  return /* @__PURE__ */ jsxs("div", { className: `mb-4 ${containerClassName}`, children: [
    label && /* @__PURE__ */ jsxs("label", { htmlFor: id || name, className: "block text-sm font-medium text-jdc-gray-300 mb-1", children: [
      label,
      " ",
      required && /* @__PURE__ */ jsx("span", { className: "text-red-500", children: "*" })
    ] }),
    /* @__PURE__ */ jsx(
      "select",
      {
        id: id || name,
        name,
        value,
        onChange,
        disabled,
        required,
        className: `${baseStyle} ${errorStyle} ${className}`,
        ...props,
        children: options.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
      }
    ),
    error && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: error })
  ] });
};
const DEFAULT_ROLES = ["Admin", "Technician", "Viewer"];
const DEFAULT_SECTORS = ["CHR", "HACCP", "Kezia", "Tabac"];
const EditUserModal = ({
  isOpen,
  onClose,
  user,
  onSave,
  availableRoles = DEFAULT_ROLES,
  availableSectors = DEFAULT_SECTORS
  // Use passed or default sectors
}) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        role: user.role || "Technician",
        secteurs: user.secteurs || []
        // Initialize with current sectors
      });
      setError(null);
    } else if (!isOpen) {
      setFormData({});
      setIsSaving(false);
      setError(null);
    }
  }, [user, isOpen]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSectorToggle = (sector) => {
    setFormData((prev) => {
      const currentSectors = prev.secteurs || [];
      const isSelected = currentSectors.includes(sector);
      let newSectors;
      if (isSelected) {
        newSectors = currentSectors.filter((s) => s !== sector);
      } else {
        newSectors = [...currentSectors, sector];
      }
      return { ...prev, secteurs: newSectors };
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setError(null);
    const updatedUserData = {
      ...user,
      // Start with original user data
      displayName: formData.displayName || user.displayName,
      role: formData.role || user.role,
      secteurs: formData.secteurs || [],
      // Use the updated sectors array
      uid: user.uid,
      email: user.email
    };
    try {
      await onSave(updatedUserData);
    } catch (err) {
      console.error("Error saving user:", err);
      setError(err.message || "Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };
  if (!isOpen || !user) {
    return null;
  }
  const roleOptions = availableRoles.map((role) => ({ value: role, label: role }));
  const currentSelectedSectors = formData.secteurs || [];
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300 ease-in-out", children: /* @__PURE__ */ jsxs("div", { className: "bg-jdc-card rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 ease-in-out scale-100", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-white", children: "Modifier l'utilisateur" }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-jdc-gray-400 hover:text-white", disabled: isSaving, children: "×" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-jdc-gray-300 mb-1", children: "Email" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white bg-jdc-gray-800 px-3 py-2 rounded", children: formData.email })
      ] }),
      /* @__PURE__ */ jsx(
        Input,
        {
          label: "Nom d'affichage",
          id: "displayName",
          name: "displayName",
          value: formData.displayName || "",
          onChange: handleChange,
          disabled: isSaving,
          placeholder: "Nom affiché dans l'application"
        }
      ),
      /* @__PURE__ */ jsx(
        Select,
        {
          label: "Rôle",
          id: "role",
          name: "role",
          options: roleOptions,
          value: formData.role || "",
          onChange: handleChange,
          disabled: isSaving,
          required: true
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-jdc-gray-300 mb-2", children: "Secteurs" }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: availableSectors.map((sector) => {
          const isSelected = currentSelectedSectors.includes(sector);
          return /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: isSelected ? "primary" : "secondary",
              size: "sm",
              onClick: () => handleSectorToggle(sector),
              disabled: isSaving,
              className: `transition-colors duration-150 ${isSelected ? "" : "opacity-70 hover:opacity-100"}`,
              children: sector
            },
            sector
          );
        }) })
      ] }),
      error && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-400 mt-2", children: error }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-3 pt-4", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: onClose, disabled: isSaving, children: "Annuler" }),
        /* @__PURE__ */ jsx(Button, { type: "submit", variant: "primary", isLoading: isSaving, disabled: isSaving, children: "Enregistrer" })
      ] })
    ] })
  ] }) });
};
const AVAILABLE_SECTORS = ["CHR", "HACCP", "Kezia", "Tabac"];
const AVAILABLE_ROLES = ["Admin", "Technician", "Viewer"];
function AdminPanel() {
  const { user, profile, loadingAuth } = useOutletContext();
  const { addToast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  useEffect(() => {
    var _a;
    if (loadingAuth) {
      setIsAuthorized(null);
      return;
    }
    const isAdmin = user && ((_a = profile == null ? void 0 : profile.role) == null ? void 0 : _a.toLowerCase()) === "admin";
    setIsAuthorized(isAdmin);
  }, [user, profile, loadingAuth]);
  const fetchUsers = useCallback(async () => {
    console.log("[AdminPanel] Fetching user list...");
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const fetchedUsers = await getAllUserProfilesSdk();
      console.log("[AdminPanel] User list fetched successfully:", fetchedUsers);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("[AdminPanel] Error fetching user list:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setErrorUsers(`Impossible de charger la liste des utilisateurs: ${errorMessage}. Vérifiez les permissions Firestore ou la console.`);
      addToast({ type: "error", message: "Erreur lors du chargement des utilisateurs." });
    } finally {
      setLoadingUsers(false);
    }
  }, [addToast]);
  useEffect(() => {
    if (isAuthorized === true) {
      fetchUsers();
    } else if (isAuthorized === false) {
      setUsers([]);
    }
  }, [isAuthorized, fetchUsers]);
  const handleOpenEditModal = (userToEdit) => {
    console.log("[AdminPanel] Opening edit modal for user:", userToEdit.uid);
    setEditingUser(userToEdit);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    console.log("[AdminPanel] Closing edit modal.");
    setIsEditModalOpen(false);
    setEditingUser(null);
  };
  const handleSaveUser = async (updatedUser) => {
    if (!editingUser) return;
    console.log("[AdminPanel] Attempting to save user (client-side):", updatedUser.uid, updatedUser);
    const dataToUpdate = {};
    if (updatedUser.displayName !== editingUser.displayName) {
      dataToUpdate.displayName = updatedUser.displayName;
    }
    if (updatedUser.role !== editingUser.role) {
      dataToUpdate.role = updatedUser.role;
    }
    const sortedCurrentSectors = [...editingUser.secteurs || []].sort();
    const sortedUpdatedSectors = [...updatedUser.secteurs || []].sort();
    if (JSON.stringify(sortedCurrentSectors) !== JSON.stringify(sortedUpdatedSectors)) {
      dataToUpdate.secteurs = updatedUser.secteurs || [];
    }
    if (Object.keys(dataToUpdate).length === 0) {
      addToast({ type: "info", message: "Aucune modification détectée." });
      handleCloseEditModal();
      return;
    }
    try {
      await updateUserProfileSdk(editingUser.uid, dataToUpdate);
      addToast({ type: "success", message: "Utilisateur mis à jour avec succès." });
      handleCloseEditModal();
      fetchUsers();
    } catch (error) {
      console.error("[AdminPanel] Error saving user (client-side SDK):", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      addToast({ type: "error", message: `Erreur lors de la mise à jour : ${errorMessage}` });
      throw error;
    }
  };
  if (loadingAuth || isAuthorized === null) {
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center items-center h-64", children: /* @__PURE__ */ jsx("p", { className: "text-jdc-gray-400 animate-pulse", children: "Vérification de l'accès..." }) });
  }
  if (!isAuthorized) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-10", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-red-500 mb-4", children: "Accès Refusé" }),
      /* @__PURE__ */ jsx("p", { className: "text-jdc-gray-300", children: "Vous n'avez pas les permissions nécessaires." }),
      /* @__PURE__ */ jsx(Link, { to: "/dashboard", className: "text-jdc-yellow hover:underline mt-4 inline-block", children: "Retour au tableau de bord" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-white mb-6", children: "Panneau d'Administration" }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium text-white", children: "Informations Administrateur" }) }),
      /* @__PURE__ */ jsxs(CardBody, { children: [
        /* @__PURE__ */ jsxs("p", { className: "text-jdc-gray-300", children: [
          "Connecté en tant que : ",
          /* @__PURE__ */ jsx("span", { className: "font-medium text-white", children: profile == null ? void 0 : profile.email })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-jdc-gray-300", children: [
          "Rôle : ",
          /* @__PURE__ */ jsx("span", { className: "font-medium text-white", children: profile == null ? void 0 : profile.role })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium text-white", children: "Gestion des Utilisateurs Existants" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-jdc-gray-400", children: "Modifier les rôles et les secteurs des utilisateurs." })
      ] }),
      /* @__PURE__ */ jsxs(CardBody, { children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative mb-4", role: "alert", children: [
          /* @__PURE__ */ jsx("strong", { className: "font-bold", children: "Attention Sécurité ! " }),
          /* @__PURE__ */ jsx("span", { className: "block sm:inline", children: "La modification des utilisateurs est effectuée côté client via SDK. Ceci est INSECURISÉ pour les opérations sensibles (changement de rôle admin) et doit être remplacé par des fonctions backend sécurisées (ex: Cloud Functions) à terme." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-yellow-900 border border-yellow-700 text-yellow-100 px-4 py-3 rounded relative mb-4", role: "alert", children: [
          /* @__PURE__ */ jsx("strong", { className: "font-bold", children: "Info : " }),
          /* @__PURE__ */ jsx("span", { className: "block sm:inline", children: 'La création de nouveaux utilisateurs se fait désormais via la fenêtre de connexion (bouton "Créer un compte").' })
        ] }),
        loadingUsers && /* @__PURE__ */ jsx("div", { className: "text-center py-4", children: /* @__PURE__ */ jsx("p", { className: "text-jdc-gray-400 animate-pulse", children: "Chargement de la liste..." }) }),
        errorUsers && !loadingUsers && /* @__PURE__ */ jsx("div", { className: "text-center py-4 text-red-400", children: /* @__PURE__ */ jsx("p", { children: errorUsers }) }),
        !loadingUsers && !errorUsers && users.length > 0 && /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-jdc-gray-700", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-jdc-gray-800/50", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-jdc-gray-300 uppercase tracking-wider", children: "Nom" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-jdc-gray-300 uppercase tracking-wider", children: "Email" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-jdc-gray-300 uppercase tracking-wider", children: "Rôle" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-jdc-gray-300 uppercase tracking-wider", children: "Secteurs" }),
            /* @__PURE__ */ jsx("th", { className: "relative px-6 py-3", children: /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Actions" }) })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "bg-jdc-card divide-y divide-jdc-gray-700", children: users.map((u) => {
            var _a;
            return /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-white", children: u.displayName || /* @__PURE__ */ jsx("i", { className: "text-jdc-gray-500", children: "Non défini" }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-jdc-gray-300", children: u.email }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-jdc-gray-300", children: u.role }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-jdc-gray-300", children: ((_a = u.secteurs) == null ? void 0 : _a.join(", ")) || /* @__PURE__ */ jsx("i", { className: "text-jdc-gray-500", children: "Aucun" }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "secondary",
                  size: "sm",
                  onClick: () => handleOpenEditModal(u),
                  children: "Modifier"
                }
              ) })
            ] }, u.uid);
          }) })
        ] }) }),
        !loadingUsers && !errorUsers && users.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center py-4 text-jdc-gray-400", children: /* @__PURE__ */ jsx("p", { children: "Aucun utilisateur trouvé." }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      EditUserModal,
      {
        isOpen: isEditModalOpen,
        onClose: handleCloseEditModal,
        user: editingUser,
        onSave: handleSaveUser,
        availableRoles: AVAILABLE_ROLES,
        availableSectors: AVAILABLE_SECTORS
      }
    )
  ] });
}
const route13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AdminPanel
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-W6N1lzry.js", "imports": ["/assets/jsx-runtime-CQPF1LdT.js", "/assets/components-DwAki7mf.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/assets/root-BWiY4xXM.js", "imports": ["/assets/jsx-runtime-CQPF1LdT.js", "/assets/components-DwAki7mf.js", "/assets/index-C9mCl7jc.js", "/assets/Button-CsBiVYsy.js", "/assets/iconBase-DbY_1wiR.js", "/assets/firestore.service-B-C4dBwJ.js", "/assets/ToastContext-BMoWAI_y.js"], "css": [] }, "routes/auth.google.callback": { "id": "routes/auth.google.callback", "parentId": "routes/auth.google", "path": "callback", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth.google.callback-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/installations.kezia": { "id": "routes/installations.kezia", "parentId": "root", "path": "installations/kezia", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/installations.kezia-6icRZbfw.js", "imports": ["/assets/jsx-runtime-CQPF1LdT.js", "/assets/components-DwAki7mf.js"], "css": [] }, "routes/google-drive-files": { "id": "routes/google-drive-files", "parentId": "root", "path": "google-drive-files", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/google-drive-files-ebhLKVcC.js", "imports": ["/assets/jsx-runtime-CQPF1LdT.js", "/assets/components-DwAki7mf.js"], "css": [] }, "routes/auth.google": { "id": "routes/auth.google", "parentId": "root", "path": "auth/google", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth.google-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/tickets-sap": { "id": "routes/tickets-sap", "parentId": "root", "path": "tickets-sap", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/tickets-sap-0EohGCfz.js", "imports": ["/assets/jsx-runtime-CQPF1LdT.js", "/assets/firestore.service-B-C4dBwJ.js", "/assets/Input-DDK31hED.js", "/assets/Button-CsBiVYsy.js", "/assets/components-DwAki7mf.js", "/assets/iconBase-DbY_1wiR.js", "/assets/index-C9mCl7jc.js", "/assets/styleUtils-BGyYvGHo.js"], "css": [] }, "routes/api.health": { "id": "routes/api.health", "parentId": "root", "path": "api/health", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api.health-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/envois-ctn": { "id": "routes/envois-ctn", "parentId": "root", "path": "envois-ctn", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/envois-ctn-D_HToYUq.js", "imports": ["/assets/jsx-runtime-CQPF1LdT.js", "/assets/firestore.service-B-C4dBwJ.js", "/assets/Input-DDK31hED.js", "/assets/Button-CsBiVYsy.js", "/assets/index-C9mCl7jc.js", "/assets/styleUtils-BGyYvGHo.js", "/assets/ToastContext-BMoWAI_y.js", "/assets/components-DwAki7mf.js"], "css": [] }, "routes/dashboard": { "id": "routes/dashboard", "parentId": "root", "path": "dashboard", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/dashboard-C4u1F5kj.js", "imports": ["/assets/dashboard-BFWp1Lf2.js", "/assets/jsx-runtime-CQPF1LdT.js", "/assets/index-C9mCl7jc.js", "/assets/firestore.service-B-C4dBwJ.js", "/assets/components-DwAki7mf.js"], "css": [] }, "routes/articles": { "id": "routes/articles", "parentId": "root", "path": "articles", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/articles-BHC43Pfz.js", "imports": ["/assets/jsx-runtime-CQPF1LdT.js", "/assets/firestore.service-B-C4dBwJ.js", "/assets/index-C9mCl7jc.js", "/assets/components-DwAki7mf.js"], "css": [] }, "routes/clients": { "id": "routes/clients", "parentId": "root", "path": "clients", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/clients-DKUzeXhc.js", "imports": ["/assets/jsx-runtime-CQPF1LdT.js"], "css": [] }, "routes/logout": { "id": "routes/logout", "parentId": "root", "path": "logout", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/logout-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-BFgNuKKy.js", "imports": ["/assets/jsx-runtime-CQPF1LdT.js"], "css": [] }, "routes/admin": { "id": "routes/admin", "parentId": "root", "path": "admin", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/admin-1Gq30yL6.js", "imports": ["/assets/jsx-runtime-CQPF1LdT.js", "/assets/Button-CsBiVYsy.js", "/assets/Input-DDK31hED.js", "/assets/firestore.service-B-C4dBwJ.js", "/assets/ToastContext-BMoWAI_y.js", "/assets/components-DwAki7mf.js"], "css": [] } }, "url": "/assets/manifest-76fbe0d8.js", "version": "76fbe0d8" };
const mode = "production";
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "v3_fetcherPersist": false, "v3_relativeSplatPath": false, "v3_throwAbortReason": false, "v3_routeConfig": false, "v3_singleFetch": false, "v3_lazyRouteDiscovery": false, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/auth.google.callback": {
    id: "routes/auth.google.callback",
    parentId: "routes/auth.google",
    path: "callback",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/installations.kezia": {
    id: "routes/installations.kezia",
    parentId: "root",
    path: "installations/kezia",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/google-drive-files": {
    id: "routes/google-drive-files",
    parentId: "root",
    path: "google-drive-files",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/auth.google": {
    id: "routes/auth.google",
    parentId: "root",
    path: "auth/google",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/tickets-sap": {
    id: "routes/tickets-sap",
    parentId: "root",
    path: "tickets-sap",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/api.health": {
    id: "routes/api.health",
    parentId: "root",
    path: "api/health",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/envois-ctn": {
    id: "routes/envois-ctn",
    parentId: "root",
    path: "envois-ctn",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/dashboard": {
    id: "routes/dashboard",
    parentId: "root",
    path: "dashboard",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/articles": {
    id: "routes/articles",
    parentId: "root",
    path: "articles",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "routes/clients": {
    id: "routes/clients",
    parentId: "root",
    path: "clients",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "routes/logout": {
    id: "routes/logout",
    parentId: "root",
    path: "logout",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route12
  },
  "routes/admin": {
    id: "routes/admin",
    parentId: "root",
    path: "admin",
    index: void 0,
    caseSensitive: void 0,
    module: route13
  }
};
export {
  assetsBuildDirectory as a,
  basename as b,
  serverManifest as c,
  entry as e,
  future as f,
  getGeocodeFromCache as g,
  isSpaMode as i,
  mode as m,
  publicPath as p,
  routes as r,
  saveGeocodeToCache as s
};
