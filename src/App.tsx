import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { useState, useCallback } from 'react'
import './App.css'

import { Box, CssBaseline, ThemeProvider, Toolbar, createTheme, useMediaQuery } from '@mui/material';
import AppBar from './shared/AppBar';
import AppMenu from './shared/AppMenu';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Events from './pages/events';
import Auth from './pages/auth';
import { SupabaseContextProvider } from './supabaseContext';
import NotFound from './pages/not-found';
import React from 'react';
import Users from './pages/users';

const menuWidth: number = 240; //px

const routes = (
  <Routes>
    <Route index path="/" element={<Navigate to="/events" />} />
    <Route index path="/auth" element={<Auth />} />
    <Route path="/events/*" element={<Events />} />
    <Route path="/users/*" element={<Users />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

function App() {
  
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const toggleMenu = useCallback(() => {
    setMenuOpen(state => !state);
  }, [setMenuOpen]);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <SupabaseContextProvider>
            <AppBar isOpen={menuOpen} toggleMenu={toggleMenu} />
            <AppMenu isOpen={menuOpen} menuWidth={menuWidth} toggleMenu={toggleMenu} />
            <Box component="main" sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.grey[100]
                  : theme.palette.grey[900],
              flexGrow: 1,
              height: '100vh',
              overflow: 'auto',
              pt: 2,
              px: 1 
            }}>
              <Toolbar />
              {/* <Button variant="contained">Test Button</Button> */}
              
              {routes}
            </Box>
          </SupabaseContextProvider>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
