import { useContext, useEffect, useState } from "react";
import { SupabaseContext } from "../supabaseContext";
import { GlobalPermission } from "src/data/globalPermission";

export default function useHasGlobalPermission(permissions: GlobalPermission[]) {
  const [hasPermission, setHasPermission] = useState(false);
  const supabase = useContext(SupabaseContext);
  useEffect(() => {
    const subscription = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        const userPermissions = session.user?.app_metadata ? session.user?.app_metadata['globalPermissions'] : null;
        if (!permissions) setHasPermission(false);
        else if (userPermissions.includes(GlobalPermission.Superuser)) setHasPermission(true);
        else {
          console.log('up', userPermissions, 'p', permissions);
          for (const permission of permissions) {
            if (userPermissions.includes(permission)) {
              setHasPermission(true);
              break;
            }
          }
        }
      } else {
        setHasPermission(false);
      }
    });

    return () => { subscription.data.subscription.unsubscribe(); }
  }, [supabase.auth, permissions]);

  return hasPermission;
}