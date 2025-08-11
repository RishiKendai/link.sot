import React, { useState, useEffect, useRef } from 'react';
import IconAnalytics from './ui/icons/IconAnalytics';
import IconLink from './ui/icons/IconLink';
import IconDashboard from './ui/icons/IconDashboard';
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/UseAuth';
import IconSidebarToggle from './ui/icons/IconSidebarToggle';
import IconLogout from './ui/icons/IconLogout';
import IconHamburger from './ui/icons/iconHamburger';

import './sidebar.css'
import Tooltip from './ui/Tooltip';
import { useApiMutation } from '../hooks/useApiMutation';
import IconSettings from './ui/icons/IconSettings';

// Define the structure for menu items
interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  link: string;
}

// Menu items with SVG icons
const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <IconDashboard />,
    link: '/dashboard',
  },
  {
    id: 'links',
    label: 'Links',
    icon: <IconLink />,
    link: '/links',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <IconAnalytics />,
    link: '/analytics',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <IconSettings />,
    link: '/settings',
  }
];

const getInitials = (name: string) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? (name[0] + name[name.length - 1]).toLocaleUpperCase()
    : (parts[0][0] + parts[1][0]).toLocaleUpperCase();
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, setUser, setAuthenticated } = useAuth();
  // State for desktop sidebar expansion (true = expanded, false = collapsed)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  // State for mobile sidebar open/close (true = open, false = closed)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // State to manage the currently active menu item
  const [activeItem, setActiveItem] = useState('dashboard');
  // Ref for the sidebar DOM element to detect clicks outside
  const sidebarRef = useRef<HTMLElement>(null);
  // State to determine if the screen is considered mobile (less than 768px)
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  // Refs for logo and toggle button elements
  const logoRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const logoutMutation = useApiMutation(['logout']);

  // Effect to handle window resize and set `isMobileScreen` state
  useEffect(() => {
    const currentPath = location.pathname

    const matchedItem = menuItems.find((item) => {
      return currentPath === item.link || currentPath.startsWith(item.link + '/');
    });

    if (matchedItem) {
      setActiveItem(matchedItem.link);
    }
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
      // On desktop, ensure mobile sidebar is closed
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call on initial load

    return () => window.removeEventListener('resize', handleResize);
  }, [location]);

  // Effect to handle clicks outside the mobile sidebar when it's open
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If mobile sidebar is open, screen is mobile, and the click is outside the sidebar
      // but not on the hamburger button (which would toggle it)
      if (
        isMobileSidebarOpen &&
        isMobileScreen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileSidebarOpen, isMobileScreen]);

  // Mouse event handlers for logo hover
  const handleLogoMouseEnter = () => {
    if (!isSidebarExpanded && !isMobileScreen && logoRef.current && toggleButtonRef.current) {
      logoRef.current.style.display = 'none';
      toggleButtonRef.current.style.display = 'flex';
    }
  };

  const handleLogoMouseLeave = () => {
    if (!isSidebarExpanded && !isMobileScreen && logoRef.current && toggleButtonRef.current) {
      logoRef.current.style.display = 'flex';
      toggleButtonRef.current.style.display = 'none';
    }
  };

  // Toggle function for desktop sidebar expansion/collapse
  const toggleDesktopSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
    if (logoRef.current && toggleButtonRef.current) {
      logoRef.current.style.display = 'flex';
      toggleButtonRef.current.style.display = 'none';
    }
  };

  // Toggle function for mobile sidebar open/close
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Handle menu item click, setting active item and closing mobile sidebar if on mobile
  const handleMenuItemClick = async (id: string) => {
    if (id === 'logout') {
      try {
        await logoutMutation.mutateAsync({ path: '/logout', method: 'POST' });
      } catch {
        // Optionally handle error
      } finally {
        setUser(null);
        setAuthenticated(false);
        window.location.href = '/'; // Redirect to login or landing page
      }
      return;
    }
    setActiveItem(id);
    if (isMobileScreen) {
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    <>

      <div className="flex min-h-screen top-0 float-left sticky z-50">
        {/* Mobile Hamburger Menu Icon (visible only on small screens) */}
        {isMobileScreen && !isMobileSidebarOpen && (
          <div className='fixed top-0 p-4 z-100 backdrop shadow-sm w-full flex items-center'>
            <button
              className="hamburger-menu z-[100] p-3 rounded-full hover:bg-gray-200 hover:scale-105 active:scale-95 mr-2"
              onClick={toggleMobileSidebar}
              aria-label="Toggle sidebar"
            >
              <IconHamburger />
            </button>
            <div className={`flex items-center`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <img height={28} width={28} src='/logo.svg' alt='logo' />
              </div>
              <span className="ml-2 text-2xl font-extrabold txt-gradient gpb">LinkSot</span>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className={`
          flex flex-col py-6 px-4 shadow-lg bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out z-50 overflow-y-auto max-h-screen custom-scroll w-fit
          ${
            // Mobile specific styles: fixed position, slide in/out
            isMobileScreen
              ? isMobileSidebarOpen
                ? 'fixed top-0 left-0 h-full w-65 translate-x-0'
                : 'fixed top-0 left-0 h-full w-0 -translate-x-full opacity-0 pointer-events-none' // Hidden state
              : ''
            }
          ${
            // Desktop specific styles: relative, expanded/collapsed width, no mobile shadow/z-index
            !isMobileScreen
              ? `relative transform-none shadow-none z-auto ${isSidebarExpanded ? 'w-65' : 'w-19 px-2'}`
              : ''
            }
        `}
        >
          {/* Logo Section */}
          <div
            className={`here flex items-center mb-12 ${isSidebarExpanded || isMobileScreen ? 'justify-start' : 'justify-center'}`}
            onMouseEnter={handleLogoMouseEnter}
            onMouseLeave={handleLogoMouseLeave}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center relative">
              {/* Logo - shown when expanded, mobile, or not hovering on collapsed desktop */}
              <div
                ref={logoRef}
                className={`w-full h-full flex items-center justify-center ${!isSidebarExpanded && !isMobileScreen ? 'block' : 'block'
                  } absolute top-0 left-0`}
              >
                <img height={34} width={34} src='/logo.svg' alt='logo' />
              </div>
              
              {/* Toggle button - shown only when hovering on collapsed desktop */}
              {!isSidebarExpanded && !isMobileScreen && (
                <button
                  ref={toggleButtonRef}
                  onClick={toggleDesktopSidebar}
                  className="w-full h-full flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors duration-200"
                  style={{ 
                    display: 'none',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                  aria-label="Toggle sidebar"
                >
                  <IconSidebarToggle
                    size={18}
                    style={{
                      transition: 'transform 0.3s',
                      transform: isSidebarExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                </button>
              )}
            </div>
            {(isSidebarExpanded || isMobileScreen) && ( // Show brand name if expanded or on mobile (when sidebar is open)
              <span className="ml-2 text-3xl font-extrabold txt-gradient gpb">LinkSot</span>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 mb-2">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id} className="relative group"> {/* Added relative for tooltip positioning */}
                  {!isSidebarExpanded && !isMobileScreen ? (
                    <Tooltip text={item.label} dir='right'>
                      <Link
                        to={item.link}
                        className={`
                        flex items-center rounded-xl py-2
                        transition-all duration-200 ease-in-out
                        ${activeItem === item.link ? 'bg-[var(--clr-secondary)]/80  text-white' : 'text-gray-800 hover:bg-gray-100 hover:text-gray-900'}
                        justify-center px-1
                      `}
                        onClick={() => handleMenuItemClick(item.id)}
                      >
                        <span className={`flex items-center justify-center w-full ${activeItem === item.link ? 'text-white' : 'text-gray-800'}`}>
                          {item.icon}
                        </span>
                      </Link>
                    </Tooltip>
                  ) : (
                    <Link
                      to={item.link}
                      className={`
                      flex items-center rounded-xl py-2
                      transition-all duration-200 ease-in-out
                      ${activeItem === item.link ? 'bg-[var(--clr-secondary)]/80  text-white' : 'text-gray-800 hover:bg-gray-100 hover:text-gray-900'}
                      px-4 space-x-3
                    `}
                      onClick={() => handleMenuItemClick(item.id)}
                    >
                      <span className={`${activeItem === item.link ? 'text-white' : 'text-gray-800'}`}>
                        {item.icon}
                      </span>
                      <span className={`font-medium ${activeItem === item.link ? 'text-white' : 'text-gray-800'}`}>
                        {item.label}
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile & Logout */}
          <div className={`border-t border-gray-200 gap-4 pt-6 mt-auto ${isSidebarExpanded || isMobileScreen ? '' : 'flex flex-col items-center'}`}>
            {!isSidebarExpanded && !isMobileScreen ? (
              <Tooltip text={user?.name.toLocaleUpperCase() || ''} dir='right'>
                <div className={`flex items-center justify-center flex-col space-y-2 cursor-default`}>
                  <div className="min-w-10 min-h-10 rounded-full gge flex items-center justify-center text-white font-bold text-base">
                    {getInitials(user?.name || '') || ''}
                  </div>
                </div>
              </Tooltip>
            ) : (
                <div className={`flex items-center mb-4 px-2`}>
                  <div className="min-w-10 min-h-10 rounded-full cursor-default gge flex items-center justify-center text-white font-bold text-base">
                  {getInitials(user?.name || '') || ''}
                </div>
                <div className="ml-3">
                  <p className="text-gray-900 font-medium text-sm">{user?.name.toLocaleUpperCase()}</p>
                  <p className="text-gray-600 text-xs">{user?.email}</p>
                </div>
              </div>
            )}
            {!isSidebarExpanded && !isMobileScreen ? (
              <Tooltip text='Logout' dir='right'>
                <button
                  className={`
                  flex items-center rounded-xl py-2
                  transition-all duration-200 ease-in-out w-full
                  justify-center px-2
                  text-red-600 hover:bg-red-50 hover:text-red-700
                `}
                  onClick={() => handleMenuItemClick('logout')}
                >
                  <span className={`flex items-center justify-center w-full`}>
                    <IconLogout />
                  </span>
                </button>
              </Tooltip>
            ) : (
              <button
                className={`
                flex items-center rounded-xl py-2
                transition-all duration-200 ease-in-out w-full
                px-4 space-x-3
                text-red-600 hover:bg-red-50 hover:text-red-700
              `}
                onClick={() => handleMenuItemClick('logout')}
              >
                <span className={``}>
                  <IconLogout />
                </span>
                <span className="font-medium">Logout</span>
              </button>
            )}
          </div>
        </aside>

        {/* Desktop Sidebar Toggle Handle (ABSOLUTE TO SIDEBAR, only on desktop) */}
        {!isMobileScreen && isSidebarExpanded && (
          <button
            className={`
            absolute top-10 -right-3 h-9 w-9
            hidden md:flex items-center justify-center rounded-full bg-white
            border-y border-r border-gray-200 shadow-md z-50
            hover:bg-gray-100 hover:shadow-lg
            transition-all duration-300 ease-in-out
          `}
            onClick={toggleDesktopSidebar}
            aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <IconSidebarToggle
              size={18}
              style={{
                transition: 'transform 0.3s',
                transform: isSidebarExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            />
          </button>
        )}

      </div>
      {/* Mobile Sidebar Overlay (visible only when mobile sidebar is open and on mobile screen) */}
      {isMobileSidebarOpen && isMobileScreen && (
        <div
          className="fixed inset-0 backdrop z-40"
          aria-hidden="true"
        ></div>
      )}
    </>
  );
};

export default Sidebar;