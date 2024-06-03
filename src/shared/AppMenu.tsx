import { Divider, Drawer, DrawerProps, IconButton, List, Toolbar, Tooltip, styled } from "@mui/material";

import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import EventIcon from '@mui/icons-material/Event';
import WarningIcon from '@mui/icons-material/Warning';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Link, useLocation } from "react-router-dom";
import { useCallback, useContext, useEffect, useState } from "react";
import { SupabaseContext } from "../supabaseContext";

type AppMenuProps = {
  isOpen: boolean;
  menuWidth: number; //px
  toggleMenu?: () => void;
};

type MenuItem = {
  title: string,
  url: string,
  requiredRole?: string,
  icon: JSX.Element
};

const allMenuItems: MenuItem[] = [
  {
    title: 'Events',
    url: '/events',
    requiredRole: 'Events_View',
    icon: <EventIcon />
  }, {
    title: 'Routes',
    url: '/routes',
    icon: <LocalShippingIcon />
  }, {
    title: 'Alerts',
    url: '/alerts',
    icon: <WarningIcon />
  }, {
    title: 'Users',
    url: '/users',
    requiredRole: 'Superuser',
    icon: <PersonIcon />
  }
];

const secondaryListItems = (
  <>
    
  </>
);

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'isOpen' && prop !== 'menuWidth' })<DrawerProps & AppMenuProps>(
  ({ theme, isOpen, menuWidth }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: menuWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!isOpen && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(0), //theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(7),
        },
      }),
    },
  }),
);

function AppMenu({ isOpen, menuWidth, toggleMenu }: AppMenuProps) {
  const location = useLocation();
  const supabase = useContext(SupabaseContext);

  const tooltippedIcon = useCallback(({title, children}: {title: string, children: JSX.Element}) => {
    if (!isOpen) {
      return <Tooltip title={title} placement="right">
        {children}
      </Tooltip>
    } else {
      return children;
    }
  }, [isOpen]);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  useEffect(() => {
    const subscription = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        setMenuItems(allMenuItems.filter(i => {
          if (!i.requiredRole) return true;
          if (!session.user?.app_metadata || !session.user.app_metadata['globalRoles']) return false;
          if (session.user.app_metadata['globalRoles'].includes('Superuser')) return true;
          return session.user.app_metadata['globalRoles'].includes(i.requiredRole);
        }));
      } else {
        setMenuItems([]);
      }
    });

    return () => {subscription.data.subscription.unsubscribe()}
  }, [supabase, menuItems]);

  return (
    <StyledDrawer variant="permanent" isOpen={isOpen} menuWidth={menuWidth}>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: [1],
        }}
      >
        <IconButton onClick={toggleMenu}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List component="nav">
        {menuItems.map(item => (
          <ListItemButton key={item.url} component={Link} to={item.url} selected={location.pathname.startsWith(item.url)}>
            <ListItemIcon>
              {tooltippedIcon({
                title: item.title,
                children: item.icon
              })}
            </ListItemIcon>
            <ListItemText primary={item.title} />
          </ListItemButton>
        ))}
        {/* <Divider sx={{ my: 1 }} /> */}
        {secondaryListItems}
      </List>
    </StyledDrawer>
  );
}

export default AppMenu;