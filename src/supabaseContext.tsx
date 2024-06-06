import { Box, Skeleton } from "@mui/material";
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

const _supabaseClient = createClient<Database>(
  import.meta.env['PUBLIC_SUPA_BASE_URL'],
  import.meta.env['PUBLIC_SUPA_KEY']
);

export const SupabaseContextProvider: FunctionComponent<{children: ReactNode}> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient<any, "public", any>>();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSupabaseClient(_supabaseClient);
  }, []);

  useEffect(() => {
    if (!location.pathname.startsWith('/auth')) {
      (async () => {
        if (!(await supabaseClient?.auth.getSession())?.data) {
          const params = createSearchParams({ returnUrl: location.pathname });
          navigate(`/auth?${params.toString()}`);
        }
      })();
    }
  }, [supabaseClient, location.pathname, navigate]);

  if (!supabaseClient) return (<Box sx={{display: 'flex', justifyContent: 'center', width: '100%', px: 1}}>
    <Skeleton variant="text" width="100%" height="6em" />
  </Box>);
  return (
    <SupabaseContext.Provider value={supabaseClient}>
      {props.children}
    </SupabaseContext.Provider>
  );
}
