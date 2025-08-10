import React, { useEffect, useRef, useState } from 'react'
import IconChevronUp from '../../components/ui/icons/IconChevronUp';
import IconChevronDown from '../../components/ui/icons/IconChevronDown';

import './settings.css'
import Menu from './Menu';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();


  const getCurrentTab = React.useCallback(() => {
    if (location.pathname.includes('change-password')) return { id: 'CHANGE_PASSWORD', label: 'Change Password' };
    if (location.pathname.includes('integrations/api')) return { id: 'API', label: 'API' };
    if (location.pathname.includes('domain')) return { id: 'DOMAIN', label: 'Domain' };
    return { id: 'MY_PROFILE', label: 'My Profile' };
  }, [location.pathname]);


  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentSetting, setCurrentSetting] = useState(getCurrentTab());
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-update on location change
  useEffect(() => {
    setCurrentSetting(getCurrentTab());
  }, [location.pathname, getCurrentTab]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width >= 700 && mobileNavOpen) {
          setMobileNavOpen(false);
        }
      }
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, [mobileNavOpen]);


  return (
    <div ref={containerRef} className='w-full h-screen p-2 px-4 pt-9 md:px-6 overflow-hidden flex flex-col cq-settings'>
      {/* Top Heading */}
      <div className='mb-8'>
        <div>
          <h5 className='text-5xl font-black mb-2'>Settings</h5>
          <p className='txt-2 tex-xl'>Manage your account settings and preferences.</p>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="flex mobile-header pb-2 w-full">
        <div className="flex items-center justify-between p-4 border-b border-b-[var(--clr-border)] w-full">
          <span className="font-semibold text-lg text-[var(--clr-secondary)]">{currentSetting.label}</span>
          <button className='cursor-pointer' onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Toggle Menu">
            {mobileNavOpen ? (
              <IconChevronUp className="h-6 w-6 text-gray-800" />
            ) : (
              <IconChevronDown className="h-6 w-6 text-gray-800" />
            )}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <section className="relative flex-1 overflow-hidden flex">
        {/* Sidebar (Desktop) */}
        <nav className="hidden custom-scroll settings-sidebar border-r border-r-[var(--clr-border)] w-64 px-2 overflow-y-auto">
          <Menu
            currentSetting={currentSetting}
            setCurrent={(tab) => {
              setCurrentSetting(tab)
              navigate(getPathForSetting(tab.id))
            }}
          />
        </nav>

        {/* Sidebar (Mobile, dropdown style) */}
        {mobileNavOpen && (
          <nav className="absolute custom-scroll inset-0 right-0 z-50 bg-[var(--clr-primary)] flex-1 overflow-y-auto">
            <Menu
              currentSetting={currentSetting}
              onItemClick={() => setMobileNavOpen(false)}
              setCurrent={(tab) => {
                setCurrentSetting(tab)
                navigate(getPathForSetting(tab.id))
              }}
            />
          </nav>
        )}

        {/* Main Content */}
        <main className="py-6 flex-1 custom-scroll overflow-y-auto">
          <Outlet />
        </main>
      </section>

    </div>
  )
}

export default Settings


// Helper function to map tab ID to path
const getPathForSetting = (id: string) => {
  switch (id) {
    case 'MY_PROFILE':
      return 'profile';
    case 'DOMAIN':
      return 'domain';
    case 'CHANGE_PASSWORD':
      return 'change-password';
    case 'API':
      return 'integrations/api';
    default:
      return 'profile';
  }
};