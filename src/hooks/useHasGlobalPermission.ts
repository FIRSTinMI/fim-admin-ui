import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../supabaseContext";
import { GlobalPermission } from "src/data/globalPermission";

export default function useHasGlobalPermission(permissions: GlobalPermission[]) {
  const [hasPermission, setHasPermission] = useState(false);
  const auth = useContext(AuthContext);
  useEffect(() => {
    if (!auth.globalPermissions) setHasPermission(false);
    else if (auth.globalPermissions.includes(GlobalPermission.Superuser)) setHasPermission(true);
    else if (permissions.length === 0) setHasPermission(true);
    else {
      for (const permission of permissions) {
        if (auth.globalPermissions.includes(permission)) {
          setHasPermission(true);
          break;
        }
      }
    }
  }, [auth.globalPermissions, permissions]);

  return hasPermission;
}