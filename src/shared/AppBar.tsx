import { AppBarProps as MuiAppBarProps, Button, IconButton, AppBar as MuiAppBar, Toolbar, Typography, styled, Menu, MenuItem, Snackbar, Alert, AlertColor } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { useState, useEffect, useContext, useCallback } from "react";
import { SupabaseContext } from "../supabaseContext";
import { Session } from "@supabase/supabase-js";
import { Link, useNavigate } from "react-router-dom";

type AppBarProps = {
  isOpen: boolean;
  toggleMenu?: () => void
};

const StyledAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'isOpen'
})<MuiAppBarProps & AppBarProps>(({ theme, isOpen }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(isOpen && {
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

type SnackbarContent = {
  severity: AlertColor,
  message: string
};

function AppBar({ isOpen, toggleMenu }: AppBarProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [snackbarText, setSnackbarText] = useState<SnackbarContent | null>(null);
  const supabase = useContext(SupabaseContext);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const openUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (event.shiftKey) setShowAdvanced(true);
  };

  const closeUserMenu = () => {
    setAnchorEl(null);
    setShowAdvanced(false);
    setSnackbarText(null);
  };

  const logOut = async () => {
    await supabase.auth.signOut();
    closeUserMenu();
    navigate('/auth');
  };

  const copyToken = useCallback(async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (token) {
      try {
        await navigator.clipboard.writeText(token);
      } catch {
        setSnackbarText({
          severity: 'error',
          message: 'Unable to set clipboard'
        });
        return;
      }
    } else {
      setSnackbarText({
        severity: 'error',
        message: 'Unable to get token'
      });
      return;
    }

    setSnackbarText({
      severity: 'success',
      message: 'Access token copied!'
    });
  }, [supabase.auth]);

  const closeSnackbar = useCallback(() => {
    setSnackbarText(null);
  }, []);

  return (
    <>
      <StyledAppBar isOpen={isOpen} position="absolute">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label={`${isOpen ? "Collapse" : "Expand"} Main Navigation`}
            sx={{ mr: 2 }}
            onClick={toggleMenu}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            FiM Admin
          </Typography>
          {session && <>
            <Button color="inherit" aria-haspopup="true" onClick={openUserMenu}>{session.user.email}</Button>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={closeUserMenu}
              >
                <MenuItem onClick={logOut}>Log out</MenuItem>
                {showAdvanced && <MenuItem onClick={copyToken}>Copy Access Token</MenuItem>}
              </Menu>
          </>}
          {!session && <Button component={Link} to="/auth" color="inherit">Not Logged In</Button>}
          <Snackbar
            open={snackbarText !== null}
            onClose={closeSnackbar}
          >
            <Alert severity={snackbarText?.severity} sx={{width: '100%'}} onClose={closeSnackbar}>
              {snackbarText?.message}
            </Alert>
          </Snackbar>
        </Toolbar>
      </StyledAppBar>
    </>
  );
}

export default AppBar;