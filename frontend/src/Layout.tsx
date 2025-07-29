import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { Toaster } from 'sonner';
import clsx from 'clsx';

export default function NavWrapper() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        {isLandingPage ? '' : <Sidebar />}
        <main className={clsx('flex', isLandingPage ? 'pt-0' : 'pt-24 md:pt-0')}>
          <Outlet />
        </main>
        <Toaster position='bottom-left' />
      </Suspense>
    </>
  );
}