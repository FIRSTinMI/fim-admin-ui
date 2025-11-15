import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { useState, useCallback, Suspense, ReactElement } from "react";
import "./App.css";

import {
  Box,
  CssBaseline,
  ThemeProvider,
  Toolbar,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import AppBar from "./shared/AppBar";
import AppMenu from "./shared/AppMenu";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Auth from "./pages/auth";
import { SupabaseContextProvider } from "./supabaseContext";
import NotFound from "./pages/not-found";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import useIsAuthenticated from "./hooks/useIsAuthenticated";
import { Loading } from "./shared/Loading";
import ErrorBoundary from "./shared/ErrorBoundary";
import { SnackbarProvider } from "notistack";
import NiceModal from '@ebay/nice-modal-react';

const menuWidth: number = 240; //px
const queryClient = new QueryClient();

const AlertsRoutes = React.lazy(() => import("./pages/alerts"));
const EventsRoutes = React.lazy(() => import("./pages/events"));
const UsersRoutes = React.lazy(() => import("./pages/users"));
const AvToolsRoutes = React.lazy(() => import("./pages/av-tools"));
const RoutesRoutes = React.lazy(() => import("./pages/routes"));
const EquipmentRoutes = React.lazy(() => import("./pages/equipment"));

const Lazy = ({ component }: { component: ReactElement }) => {
  return (
    <Suspense fallback={<Loading />}>
      { component }
    </Suspense>
  );
};

const routes = (
  <Routes>
    <Route index path="/" element={<RootPage />} />
    <Route index path="/auth" element={<Auth />} />
    <Route path="/events/*" element={<Lazy component={<EventsRoutes />} />}/>
    <Route path="/users/*" element={<Lazy component={<UsersRoutes />} />} />
    <Route path="/alerts/*" element={<Lazy component={<AlertsRoutes />} />} />
    <Route path="/av-tools/*" element={<Lazy component={<AvToolsRoutes />} />} />
    <Route path="/routes/*" element={<Lazy component={<RoutesRoutes />} />} />
    <Route path="/equipment/*" element={<Lazy component={<EquipmentRoutes />} />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

function RootPage() {
  const isAuthed = useIsAuthenticated();

  if (isAuthed === null) return <Loading />;
  if (isAuthed) return <Navigate to="/events" />;
  else return <Navigate to="/auth" />;
}

function App() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const toggleMenu = useCallback(() => {
    setMenuOpen((state) => !state);
  }, [setMenuOpen]);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
        typography: (palette) => ({
          h2: {
            paddingBottom: 8,
            borderBottom: `1px solid ${palette.action.selected}`,
            fontSize: 48,
          },
          h3: {
            fontSize: 34,
          },
          h4: {
            fontSize: 24,
          },
        }),
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <NiceModal.Provider>
        <SnackbarProvider>
          <BrowserRouter>
            <Box sx={{ display: "flex" }}>
              <CssBaseline />
              <SupabaseContextProvider>
                <QueryClientProvider client={queryClient}>
                  <AppBar isOpen={menuOpen} toggleMenu={toggleMenu} />
                  <AppMenu
                    isOpen={menuOpen}
                    menuWidth={menuWidth}
                    toggleMenu={toggleMenu}
                  />
                  <Box
                    component="main"
                    sx={{
                      backgroundColor: (theme) =>
                        theme.palette.mode === "light"
                          ? theme.palette.grey[100]
                          : theme.palette.grey[900],
                      flexGrow: 1,
                      minHeight: "100vh",
                      pt: 2,
                      px: 1,
                    }}
                  >
                    <Toolbar />
                    {/* <Button variant="contained">Test Button</Button> */}
                    <ErrorBoundary>{routes}</ErrorBoundary>
                  </Box>
                  <ReactQueryDevtools />
                </QueryClientProvider>
              </SupabaseContextProvider>
            </Box>
          </BrowserRouter>
        </SnackbarProvider>
      </NiceModal.Provider>
    </ThemeProvider>
  );
}

export default App;
