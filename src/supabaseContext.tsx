import { Box, Skeleton } from "@mui/material";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { FunctionComponent, ReactNode, createContext, useEffect, useState } from "react";
import { createSearchParams, useLocation, useNavigate } from "react-router-dom";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SupabaseContext = createContext<SupabaseClient<any, "public", any>>({} as unknown as SupabaseClient<any, "public", any>); // TODO: Atone for sins

const _supabaseClient = createClient(
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
