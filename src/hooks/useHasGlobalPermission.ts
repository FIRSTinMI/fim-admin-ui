import { useContext, useEffect, useState } from "react";
import { SupabaseContext } from "../supabaseContext";
import { GlobalPermission } from "src/data/globalPermission";

export default function useHasGlobalPermission(permissions: GlobalPermission[]) {
  const [hasPermission, setHasPermission] = useState(false);
  const supabase = useContext(SupabaseContext);
  useEffect(() => {
    if (!supabase.globalPermissions) setHasPermission(false);
    else if (supabase.globalPermissions.includes(GlobalPermission.Superuser)) setHasPermission(true);
    else {
      for (const permission of permissions) {
        if (supabase.globalPermissions.includes(permission)) {
          setHasPermission(true);
          break;
        }
      }
    }
  }, [supabase.globalPermissions, permissions]);

  return hasPermission;
}