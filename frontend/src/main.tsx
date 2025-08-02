// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter as Router, RouterProvider } from 'react-router-dom'

import Layout from './Layout.tsx'

import { AuthProvider } from './context/AuthContext.tsx'
import './global.css'
import ProtectedLayout from './context/ProtectedLayout.tsx'
import lazyLoad from './lazyLoad.ts'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const App = lazyLoad(() => import('./pages/App.tsx'))
const Dashboard = lazyLoad(() => import('./pages/Dashboard.tsx'))
const Link = lazyLoad(() => import('./pages/Link.tsx'))
const Analytics = lazyLoad(() => import('./pages/Analytics.tsx'))
const LinkCreate = lazyLoad(() => import('./pages/LinkCreate.tsx'))
const LinkEdit = lazyLoad(() => import('./pages/LinkEdit.tsx'))
const PublicLink = lazyLoad(() => import('./pages/PublicLink.tsx'))
const PasswordVerification = lazyLoad(() => import('./pages/PasswordVerification.tsx'))
const LinkDetails = lazyLoad(() => import('./pages/LinkDetails.tsx'))
const ErrorPage = lazyLoad(() => import('./pages/ErrorPage.tsx'))
const Settings = lazyLoad(() => import('./pages/Settings.tsx'))



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
              }
            ]
          },
          {
            path: '/analytics',
            element: <Analytics />
          }, {
            path: '/settings',
            element: <Settings />
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
