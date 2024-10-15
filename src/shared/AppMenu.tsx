import {Drawer, DrawerProps, List, styled, Tooltip, useMediaQuery, useTheme} from "@mui/material";

import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DevicesIcon from '@mui/icons-material/Devices';
import WarningIcon from '@mui/icons-material/Warning';
import {Link, useLocation} from "react-router-dom";
import {JSX, useCallback, useContext, useEffect, useState} from "react";
import {SupabaseContext} from "../supabaseContext";
import {GlobalPermission} from "src/data/globalPermission.ts";
import useHasGlobalPermission from "src/hooks/useHasGlobalPermission.ts";

type AppMenuProps = {
  isOpen: boolean;
  menuWidth: number; //px
  toggleMenu?: () => void;
};

type MenuItem = {
  title: string,
  url: string,
  requiredRole?: GlobalPermission[],
  icon: JSX.Element
};

const allMenuItems: MenuItem[] = [
  {
    title: 'Events',
    url: '/events',
    requiredRole: [GlobalPermission.Events_View],
    icon: <EventIcon />
  }, {
    title: 'Routes',
    url: '/routes',
    icon: <LocalShippingIcon />
  }, {
    title: 'Alerts',
    url: '/alerts',
    requiredRole: [GlobalPermission.Equipment_Manage],
    icon: <WarningIcon />
  }, {
    title: 'Equipment',
    url: '/equipment',
    requiredRole: [GlobalPermission.Equipment_Note, GlobalPermission.Equipment_Manage],
    icon: <DevicesIcon />
  }, {
    title: 'Users',
    url: '/users',
    requiredRole: [GlobalPermission.Superuser],
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

function MenuItem({ item, icon }: { item: MenuItem, icon: JSX.Element }) {
  const hasPermission = useHasGlobalPermission(item.requiredRole ?? []);
  const location = useLocation();
  
  if (!hasPermission) return;
  
  return (
    <ListItemButton component={Link} to={item.url} selected={location.pathname.startsWith(item.url)}>
      <ListItemIcon>
        {icon}
      </ListItemIcon>
      <ListItemText primary={item.title} />
    </ListItemButton>
  );
}

function AppMenu({ isOpen, menuWidth, toggleMenu }: AppMenuProps) {
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
        setMenuItems(allMenuItems);
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
          <MenuItem key={item.url} item={item} icon={tooltippedIcon({
            title: item.title,
            children: item.icon
          })} />
        ))}
        {/* <Divider sx={{ my: 1 }} /> */}
        {secondaryListItems}
      </List>
    </StyledDrawer>
  );
}

export default AppMenu;