import React from 'react';
import { Link, NavLink } from '@remix-run/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Added faTachometerAlt, faTicketAlt, faTruck, faSearch
import { faBars, faUserCircle, faSignOutAlt, faSignInAlt, faCog, faTachometerAlt, faTicketAlt, faTruck, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Button } from './ui/Button';
import type { AppUser } from '~/services/auth.service';
import type { UserProfile } from '~/types/firestore.types'; // Import UserProfile

interface HeaderProps {
  user: AppUser | null;
  profile: UserProfile | null; // Renamed from userProfile for consistency with root.tsx context
  onToggleMobileMenu: () => void;
  onLoginClick: () => void;
  // Add onLogoutClick prop if it's missing from the interface
  onLogoutClick?: () => void; // Make optional or ensure it's always passed
  loadingAuth: boolean; // Add loadingAuth prop
}

// Added icons to navItems
// Added icons to navItems and Recherche Articles
const navItems = [
  { name: 'Tableau de Bord', to: '/dashboard', icon: faTachometerAlt },
  { name: 'Tickets SAP', to: '/tickets-sap', icon: faTicketAlt },
  { name: 'Envois CTN', to: '/envois-ctn', icon: faTruck },
  { name: 'Recherche Articles', to: '/articles', icon: faSearch }, // Added new item
];

// Define Admin item separately
const adminItem = { name: 'Admin', to: '/admin', icon: faCog };

const JDC_LOGO_URL = "https://www.jdc.fr/images/logo_jdc_blanc.svg";

export const Header: React.FC<HeaderProps> = ({ user, profile, onToggleMobileMenu, onLoginClick, onLogoutClick, loadingAuth }) => {
  const linkActiveClass = "text-jdc-yellow";
  const linkInactiveClass = "text-jdc-gray-300 hover:text-jdc-yellow transition-colors"; // Changed hover color

  // Determine if the Admin link should be shown
  const showAdminLink = !loadingAuth && profile?.role?.toLowerCase() === 'admin';

  return (
    <header className="bg-jdc-blue-dark border-b border-jdc-gray-800 py-3 px-4 md:px-6 sticky top-0 z-40"> {/* Changed background color */}
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Left Section: Logo, Mobile Button, Desktop Nav */}
        <div className="flex items-center space-x-4 md:space-x-6"> {/* Added spacing */}
           <Link to={user ? "/dashboard" : "/"} className="flex-shrink-0"> {/* Removed right margin */}
             <img src={JDC_LOGO_URL} alt="JDC Logo" className="h-8 w-auto" />
           </Link>
           {/* Mobile Menu Button */}
           <button
             onClick={onToggleMobileMenu}
             className="md:hidden text-jdc-gray-300 hover:text-white focus:outline-none"
             aria-label="Ouvrir le menu"
           >
             <FontAwesomeIcon icon={faBars} size="lg" />
           </button>

           {/* Desktop Navigation (Moved here) */}
           {user && !loadingAuth && ( // Hide nav while auth is loading
             <nav className="hidden md:flex space-x-6 items-center">
               {navItems.map((item) => (
                 <NavLink
                   key={item.to}
                   to={item.to}
                   // Added flex, items-center, transition classes and hover scale
                   className={({ isActive }) => `${isActive ? linkActiveClass : linkInactiveClass} font-medium flex items-center transition-transform duration-200 ease-in-out hover:scale-105`}
                   prefetch="intent" // Keep prefetch for other items
                 >
                   <FontAwesomeIcon icon={item.icon} className="mr-1.5" /> {/* Added icon */}
                   {item.name}
                 </NavLink>
               ))}
               {/* Conditionally render Admin link */}
               {showAdminLink && (
                 <NavLink
                   to={adminItem.to}
                   // Added transition classes and hover scale
                   className={({ isActive }) => `${isActive ? linkActiveClass : linkInactiveClass} font-medium flex items-center transition-transform duration-200 ease-in-out hover:scale-105`}
                   // Removed prefetch="intent" for Admin link
                 >
                    <FontAwesomeIcon icon={adminItem.icon} className="mr-1.5" /> {/* Optional icon */}
                   {adminItem.name}
                 </NavLink>
               )}
             </nav>
           )}
           {/* Show placeholder or spinner during auth load (Moved here) */}
           {loadingAuth && <div className="hidden md:block text-jdc-gray-400 text-sm">Chargement...</div>}
        </div> {/* End of Left Section */}


        {/* Right Section: User Actions */}
        <div className="flex items-center space-x-3">
          {loadingAuth ? (
             <div className="h-8 w-20 bg-jdc-gray-700 rounded animate-pulse"></div> // Placeholder
          ) : user ? (
            <>
              <span className="text-jdc-gray-300 hidden sm:inline" title={user.email ?? ''}>
                <FontAwesomeIcon icon={faUserCircle} className="mr-1" />
                {/* Prefer profile displayName, fallback to user displayName, then email prefix */}
                {profile?.displayName || user.displayName || user.email?.split('@')[0]}
              </span>
              {onLogoutClick && ( // Conditionally render logout button
                 <Button variant="secondary" size="sm" onClick={onLogoutClick} title="Déconnexion"> {/* Changed variant to secondary */}
                   <FontAwesomeIcon icon={faSignOutAlt} />
                   <span className="sr-only sm:not-sr-only sm:ml-1">Déconnexion</span>
                 </Button>
              )}
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={onLoginClick} leftIcon={<FontAwesomeIcon icon={faSignInAlt} />}>
              Connexion
            </Button>
          )}
        </div> {/* End of Right Section */}
      </div>
    </header>
  );
};
