import { Drawer, DrawerProps, List, Tooltip, styled, useMediaQuery, useTheme } from "@mui/material";

import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
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
  // }, {
  //   title: 'Alerts',
  //   url: '/alerts',
  //   icon: <WarningIcon />
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
        // width: theme.spacing(0), //theme.spacing(7),
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
  const theme = useTheme();
  const mobileMatches = useMediaQuery(theme.breakpoints.up('sm'));

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
          const permissions = session.user?.app_metadata ? session.user?.app_metadata['globalPermissions'] : null;
          if (!permissions) return false;
          if (permissions.includes('Superuser')) return true;
          return permissions.includes(i.requiredRole);
        }));
      } else {
        setMenuItems([]);
      }
    });

    return () => {subscription.data.subscription.unsubscribe()}
  }, [supabase]);

  return (
    <StyledDrawer variant={mobileMatches ? 'permanent' : 'temporary'} isOpen={isOpen} menuWidth={menuWidth} open={isOpen} onClose={toggleMenu}>
      <List component="nav" sx={{ mt: 8 }}>
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