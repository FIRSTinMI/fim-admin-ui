import { Backdrop, Box, CircularProgress } from "@mui/material";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { FunctionComponent, ReactNode, createContext, useEffect, useState } from "react";
import { createSearchParams, useLocation, useNavigate } from "react-router-dom";
import { GlobalPermission } from "src/data/globalPermission.ts";

export interface Database {
  public: {
    Tables: {
    },
    Views: object,
    Functions: object
  }
}

export type FimSupabaseClient = SupabaseClient<Database, "public", never> & {
  globalPermissions: GlobalPermission[] | null
};

export const SupabaseContext = createContext<FimSupabaseClient>(undefined as unknown as FimSupabaseClient);

let _supabaseClient = createClient<Database>(
  import.meta.env['PUBLIC_SUPA_BASE_URL'],
  import.meta.env['PUBLIC_SUPA_KEY']
);

export const SupabaseContextProvider: FunctionComponent<{children: ReactNode}> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient<any, "public", any>>();
  const [isInitializingAuth, setIsInitializingAuth] = useState<boolean>(true);
  const [globalPermissions, setGlobalPermissions] = useState<GlobalPermission[] | null>();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    _supabaseClient ??= createClient<Database>(
      import.meta.env['PUBLIC_SUPA_BASE_URL'],
      import.meta.env['PUBLIC_SUPA_KEY']
    );
    setSupabaseClient(_supabaseClient);
    if (isInitializingAuth) {
      const subscription = supabaseClient?.auth.onAuthStateChange(() => {
        setIsInitializingAuth(false);
      });

      return () => { subscription?.data.subscription.unsubscribe(); }
    }
  }, [supabaseClient, isInitializingAuth]);

  // Store global permissions in the context so we can avoid making a bunch of subscriptions to authStateChange
  useEffect(() => {
    if (!supabaseClient?.auth) return () => {};

    const subscription = supabaseClient.auth.onAuthStateChange((_, session) => {
      if (session) {
        const userPermissions = session.user?.app_metadata ? session.user?.app_metadata['globalPermissions'] : null;
        setGlobalPermissions(userPermissions);
      } else {
        setGlobalPermissions(null);
      }
    });

    return () => { subscription.data.subscription.unsubscribe(); }
  }, [supabaseClient?.auth]);

  useEffect(() => {
    if (isInitializingAuth) return;
    if (!location.pathname.startsWith('/auth')) {
      (async () => {
        const session = (await supabaseClient?.auth.getSession())?.data.session;
        if (!session) {
          const params = createSearchParams({ returnUrl: location.pathname });
          navigate(`/auth?${params.toString()}`);
        }
      })();
    }
  }, [supabaseClient, location.pathname, navigate, isInitializingAuth]);
  
  let ctxValue: FimSupabaseClient = supabaseClient as unknown as FimSupabaseClient;
  if (ctxValue) ctxValue.globalPermissions = globalPermissions ?? null;

  if (!supabaseClient || isInitializingAuth) return (<Box sx={{display: 'flex', justifyContent: 'center', width: '100%', px: 1}}>
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={true}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  </Box>);
  return (
    <SupabaseContext.Provider value={ctxValue}>
      {supabaseClient && props.children}
    </SupabaseContext.Provider>
  );
}
