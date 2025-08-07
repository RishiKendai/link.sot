// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navigate, createBrowserRouter as Router, RouterProvider } from 'react-router-dom'

import Layout from './Layout.tsx'

import { AuthProvider } from './context/AuthContext.tsx'
import './global.css'
import ProtectedLayout from './context/ProtectedLayout.tsx'
import lazyLoad from './lazyLoad.ts'
import LinkAnalytics from './pages/link/LinkAnalytics.tsx'
import Profile from './pages/settings/Profile.tsx'
import Password from './pages/settings/Password.tsx'
import API from './pages/settings/API.tsx'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const App = lazyLoad(() => import('./pages/App.tsx'))
const Dashboard = lazyLoad(() => import('./pages/Dashboard.tsx'))
const Link = lazyLoad(() => import('./pages/link/Link.tsx'))
const Analytics = lazyLoad(() => import('./pages/analytics/Index.tsx'))
const LinkCreate = lazyLoad(() => import('./pages/link/LinkCreate.tsx'))
const LinkEdit = lazyLoad(() => import('./pages/link/LinkEdit.tsx'))
const PublicLink = lazyLoad(() => import('./pages/PublicLink.tsx'))
const PasswordVerification = lazyLoad(() => import('./pages/PasswordVerification.tsx'))
const LinkDetails = lazyLoad(() => import('./pages/link/LinkDetails.tsx'))
const ErrorPage = lazyLoad(() => import('./pages/ErrorPage.tsx'))
const Settings = lazyLoad(() => import('./pages/settings/Settings.tsx'))



// Protected routes component that includes AuthProvider
const ProtectedRoutes = () => (
  <AuthProvider>
    <Layout />
  </AuthProvider>
)

const router = Router([
  {
    path: '/',
    element: <ProtectedRoutes />,
    children: [
      {
        index: true,
        element: <App />
      },
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: '/dashboard',
            element: <Dashboard />,
            errorElement: <ErrorPage />
          },
          {
            path: '/links',
            children: [
              {
                index: true,
                element: <Link />
              },
              {
                path: '/links/edit/:id',
                element: <LinkEdit />
              },
              {
                path: '/links/create',
                element: <LinkCreate />
              },
              {
                path: '/links/:id/details',
                element: <LinkDetails />,
                errorElement: <ErrorPage />
              },
              {
                path: '/links/analytics/:id',
                element: <LinkAnalytics />
              }
            ]
          },
          {
            path: '/analytics',
            element: <Analytics />,
            // errorElement: <ErrorPage />
          },
          {
            path: '/settings',
            element: <Settings />, // this stays the layout
            children: [
              { index: true, element: <Navigate to="profile" replace /> }, // default redirect
              { path: 'profile', element: <Profile /> },
              { path: 'change-password', element: <Password /> },
              { path: 'integrations/api', element: <API /> }
            ]
          }
        ]
      }
    ]
  },
  // Public route for link access (outside of AuthProvider)
  {
    path: '/:short',
    element: <PublicLink />
  },
  {
    path: '/:short/password',
    element: <PasswordVerification />
  }
])

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    {/* <ReactQueryDevtools /> */}
  </QueryClientProvider>
  //  </StrictMode>,
)
