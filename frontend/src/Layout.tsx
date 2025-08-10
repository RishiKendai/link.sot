import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { Toaster } from 'sonner';
import clsx from 'clsx';
import Loader from './components/ui/Loader';

export default function NavWrapper() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <>
      <Suspense fallback={<FallbackLoader />}>
        {isLandingPage ? '' : <Sidebar />}
        <main className={clsx('flex', isLandingPage ? 'pt-0' : 'pt-24 md:pt-0')}>
          <Outlet />
        </main>
        <Toaster position='bottom-left' />
      </Suspense>
    </>
  );
}

const FallbackLoader: React.FC = () => (
  <div className='h-screen flex items-center justify-center'>
    <Loader color='#6366f1' className='w-12 h-12'  />
  </div>
);