import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { Toaster } from 'sonner';
import clsx from 'clsx';
import { useAuth } from './context/UseAuth';
import PageLoader from './components/PageLoader';

export default function NavWrapper() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const isLandingPage = location.pathname === '/';

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        {!isLandingPage && isAuthenticated && !isLoading && <Sidebar />}
        <main className={clsx('flex', isLandingPage ? 'pt-0' : 'pt-24 md:pt-0')}>
          <Outlet />
        </main>
        <Toaster position='bottom-left' theme='dark' />
      </Suspense>
    </>
  );
}