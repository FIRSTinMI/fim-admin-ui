import {
  Drawer,
  DrawerProps,
  List,
  ListSubheader,
  MenuItem as MuiMenuItem,
  styled,
  useMediaQuery,
  useTheme
} from "@mui/material";

import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DevicesIcon from '@mui/icons-material/Devices';
// import WarningIcon from '@mui/icons-material/Warning';
import CameraIcon from '@mui/icons-material/CameraAlt';
import { Link, useLocation } from "react-router-dom";
import { JSX, useId, useMemo } from "react";
import { GlobalPermission } from "src/data/globalPermission.ts";
import useHasGlobalPermission from "src/hooks/useHasGlobalPermission.ts";
import useIsAuthenticated from "src/hooks/useIsAuthenticated.ts";
import { bindFocus, bindHover, bindMenu, usePopupState } from "material-ui-popup-state/hooks";
import HoverMenu from 'material-ui-popup-state/HoverMenu'
import { useGetCurrentEvents } from "src/data/supabase/events.ts";

type AppMenuProps = {
  isOpen: boolean;
  menuWidth: number; //px
  toggleMenu?: () => void;
};

type MenuItem = {
  title: string,
  url: string,
  requiredRole?: GlobalPermission[],
  icon?: JSX.Element,
  subMenu?: MenuItem[]
};

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

function SubmenuItem({ item, onClick }: { item: MenuItem, onClick: () => void }) {
  const hasPermission = useHasGlobalPermission(item.requiredRole ?? []);
  
  return hasPermission ? <MuiMenuItem component={Link} to={item.url} onClick={onClick}>{item.title}</MuiMenuItem> : <></>
}

function MenuItem({ item, icon, isOpen }: { item: MenuItem, icon: JSX.Element, isOpen: boolean }) {
  const hasPermission = useHasGlobalPermission(item.requiredRole ?? []);
  const id = useId();
  const popupState = usePopupState({
    variant: 'popover',
    popupId: `${id}-submenu`
  });
  const location = useLocation();
  
  if (!hasPermission) return;
  
  return (
    <>
      <ListItemButton id={id} component={Link} to={item.url} selected={location.pathname.startsWith(item.url)} {...bindHover(popupState)} {...bindFocus(popupState)} onClick={popupState.close}>
        <ListItemIcon>
          {icon}
        </ListItemIcon>
        <ListItemText primary={item.title} />
      </ListItemButton>
      {!isOpen && 
        <HoverMenu
          {...bindMenu(popupState)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          sx={{'.MuiMenu-paper': {borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px'}}}
        >
          {!isOpen && <ListSubheader sx={{backgroundImage: "var(--Paper-overlay)", lineHeight: '32px'}}>{item.title}</ListSubheader>}
          {item.subMenu?.map((subitem, idx) => <SubmenuItem key={idx} item={subitem} onClick={popupState.close} />)}
        </HoverMenu>
      }
    </>
  );
}

function AppMenu({ isOpen, menuWidth, toggleMenu }: AppMenuProps) {
  const isAuthenticated = useIsAuthenticated();
  const theme = useTheme();
  const mobileMatches = useMediaQuery(theme.breakpoints.up('sm'));
  const currentEvents = useGetCurrentEvents(isAuthenticated ?? false);

  const menuItems = useMemo<MenuItem[]>(() =>
    isAuthenticated ? [
      {
        title: 'Events',
        url: '/events',
        requiredRole: [GlobalPermission.Events_View],
        icon: <EventIcon/>,
        subMenu: (currentEvents.data ?? []).map(e => ({
          title: e.name,
          url: `/events/${e.id}/overview`
        }))
      }, {
        title: 'Routes',
        url: '/routes',
        requiredRole: [GlobalPermission.Equipment_View],
        icon: <LocalShippingIcon/>
        // }, {
        //   title: 'Alerts',
        //   url: '/alerts',
        //   requiredRole: [GlobalPermission.Equipment_Manage],
        //   icon: <WarningIcon />
      }, {
        title: 'AV Tools',
        url: '/av-tools',
        requiredRole: [GlobalPermission.Equipment_Manage, GlobalPermission.Equipment_Av_ManageStream],
        icon: <CameraIcon/>,
        subMenu: [{
          title: 'Match Video Stats',
          url: '/av-tools/match-video-stats',
          requiredRole: [GlobalPermission.Equipment_Manage]
        },
          {
            title: 'Twitch',
            url: '/av-tools/twitch',
            requiredRole: [GlobalPermission.Equipment_Av_ManageStream]
          },
          {
            title: 'YouTube',
            url: '/av-tools/youtube',
            requiredRole: [GlobalPermission.Equipment_Av_ManageStream]
          },
          {
            title: 'Event Livestreams',
            url: '/av-tools/event-livestreams',
            requiredRole: [GlobalPermission.Equipment_Av_ManageStream]
          }]
      }, {
        title: 'Equipment',
        url: '/equipment',
        requiredRole: [GlobalPermission.Equipment_Note, GlobalPermission.Equipment_View],
        icon: <DevicesIcon/>,
        subMenu: [{
          title: 'AV Carts',
          url: '/equipment?typeId=1'
        }, {
          title: 'Logs Viewer',
          url: '/equipment?typeId=overall_logs'
        }]
      }, {
        title: 'Users',
        url: '/users',
        requiredRole: [GlobalPermission.Superuser],
        icon: <PersonIcon/>
      }
    ] : [], [isAuthenticated, currentEvents.data]);

  return (
    <StyledDrawer variant={mobileMatches ? 'permanent' : 'temporary'} isOpen={isOpen} menuWidth={menuWidth} open={isOpen} onClose={toggleMenu}>
      <List component="nav" sx={{ mt: 8 }}>
        {menuItems.map(item => (
          <MenuItem key={item.url} item={item} icon={item.icon ?? <></>} isOpen={isOpen} />
        ))}
        {/* <Divider sx={{ my: 1 }} /> */}
        {secondaryListItems}
      </List>
    </StyledDrawer>
  );
}

export default AppMenu;
