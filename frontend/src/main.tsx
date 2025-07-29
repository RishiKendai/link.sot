// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter as Router, RouterProvider } from 'react-router-dom'

import App from './pages/App.tsx'
import Layout from './Layout.tsx'

import { AuthProvider } from './context/AuthContext.tsx'
import './global.css'
import ProtectedLayout from './context/ProtectedLayout.tsx'
import Dashboard from './pages/Dashboard.tsx'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Link from './pages/Link.tsx'
import Analytics from './pages/Analytics.tsx'
import LinkCreate from './pages/LinkCreate.tsx'
import LinkEdit from './pages/LinkEdit.tsx'
import PublicLink from './pages/PublicLink.tsx'
import PasswordVerification from './pages/PasswordVerification.tsx'

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
            element: <Dashboard />
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
                element: <LinkEdit/>
              },
              {
                path: '/links/create',
                element: <LinkCreate />
              }
            ]
          },
          {
            path: '/analytics',
            element: <Analytics />
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
