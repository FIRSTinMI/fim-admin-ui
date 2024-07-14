import { Backdrop, Box, CircularProgress } from "@mui/material";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { FunctionComponent, ReactNode, createContext, useEffect, useState } from "react";
import { createSearchParams, useLocation, useNavigate } from "react-router-dom";

export interface Database {
  public: {
    Tables: {
      a: number
    },
    Views: object,
    Functions: object
  }
}

export type FimSupabaseClient = SupabaseClient<Database, "public", never>;

export const SupabaseContext = createContext<FimSupabaseClient>(undefined as unknown as FimSupabaseClient);

let _supabaseClient = createClient<Database>(
  import.meta.env['PUBLIC_SUPA_BASE_URL'],
  import.meta.env['PUBLIC_SUPA_KEY']
);

export const SupabaseContextProvider: FunctionComponent<{children: ReactNode}> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient<any, "public", any>>();
  const [isInitializingAuth, setIsInitializingAuth] = useState<boolean>(true);
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

  if (!supabaseClient || isInitializingAuth) return (<Box sx={{display: 'flex', justifyContent: 'center', width: '100%', px: 1}}>
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={true}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  </Box>);
  return (
    <SupabaseContext.Provider value={supabaseClient}>
      {supabaseClient && props.children}
    </SupabaseContext.Provider>
  );
}
