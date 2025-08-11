import { createBrowserRouter, Navigate } from "react-router-dom";
import lazyLoad from "./lazyLoad";
import './global.css';

import AuthLayout from "./AuthLayout"; // wraps AuthProvider + Outlet
import ProtectedLayout from "./context/ProtectedLayout"; // checks auth + Outlet
import Layout from "./Layout"; // contains Sidebar + Outlet
import ErrorPage from "./pages/ErrorPage";
import NotFound from './pages/NotFound';
import Profile from './pages/settings/Profile';
import Domain from './pages/settings/Domain';
import Password from './pages/settings/Password';
import API from './pages/settings/API';

// Lazy imports
const App = lazyLoad(() => import("./pages/App"));
const Dashboard = lazyLoad(() => import("./pages/Dashboard"));
const Link = lazyLoad(() => import("./pages/link/Link"));
const LinkEdit = lazyLoad(() => import("./pages/link/LinkEdit"));
const LinkCreate = lazyLoad(() => import("./pages/link/LinkCreate"));
const LinkDetails = lazyLoad(() => import("./pages/link/LinkDetails"));
const LinkAnalytics = lazyLoad(() => import("./pages/link/LinkAnalytics"));
const Analytics = lazyLoad(() => import("./pages/analytics"));
const Settings = lazyLoad(() => import("./pages/settings/Settings"));

const router = createBrowserRouter([
    // Branch with AuthProvider + private routes
    {
        element: <AuthLayout />, // AuthProvider here
        children: [
            {
                element: <Layout />, // Has Sidebar
                errorElement: <ErrorPage />,
                children: [
                    { index: true, element: <App /> }, // landing page (auth or guest)
                    {
                        element: <ProtectedLayout />, // just auth check + redirect
                        children: [
                            { path: "dashboard", element: <Dashboard /> },
                            {
                                path: "links",
                                children: [
                                    { index: true, element: <Link /> },
                                    { path: "edit/:id", element: <LinkEdit /> },
                                    { path: "create", element: <LinkCreate /> },
                                    { path: ":id/details", element: <LinkDetails /> },
                                    { path: "analytics/:id", element: <LinkAnalytics /> }
                                ]
                            },
                            { path: "analytics", element: <Analytics /> },
                            {
                                path: 'settings',
                                element: <Settings />, // this stays the layout
                                children: [
                                    { index: true, element: <Navigate to="profile" replace /> }, // default redirect
                                    { path: 'profile', element: <Profile /> },
                                    { path: 'domain', element: <Domain /> },
                                    { path: 'change-password', element: <Password /> },
                                    { path: 'integrations/api', element: <API /> }
                                ]
                            },
                        ]
                    }
                ]
            }
        ]
    },
    // Fallback
    { path: "*", element: <NotFound /> }
]);

export default router;
