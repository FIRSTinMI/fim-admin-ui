import { useContext, useEffect, useState } from "react";
import { SupabaseContext } from "../supabaseContext";

export default function useHasGlobalPermission(role: string) {
  const [hasPermission, setHasPermission] = useState(false);
  const supabase = useContext(SupabaseContext);
  useEffect(() => {
    const subscription = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        const permissions = session.user?.app_metadata ? session.user?.app_metadata['globalPermissions'] : null;
        if (!permissions) setHasPermission(false);
        else if (permissions.includes('Superuser')) setHasPermission(true);
        else if (permissions.includes(role)) setHasPermission(true);
      } else {
        setHasPermission(false);
      }
    });

    return () => { subscription.data.subscription.unsubscribe(); }
  }, [supabase.auth, role]);

  return hasPermission;
}