import { useMemo } from "react";
import { useSupaQuery } from "./useSupaQuery";
import { getCurrentUserStaffForEvent } from "src/data/supabase/eventStaffs";
import { EventPermission } from "src/data/eventPermission";
import { GlobalPermission } from "src/data/globalPermission";
import useHasGlobalPermission from "./useHasGlobalPermission";

export default function useHasEventPermission(eventId: string | undefined, globalPermissions: GlobalPermission[], eventPermissions: EventPermission[]) {
  const query = useSupaQuery({
    queryKey: ['currentUserStaff', eventId],
    queryFn: (client) => getCurrentUserStaffForEvent(client, eventId),
    staleTime: 5 * 60_000
  });
  const hasGlobalPermission = useHasGlobalPermission(globalPermissions);

  const hasPermission = useMemo(() => {
    if (hasGlobalPermission) return true;
    if (query.data === null || !query.data?.permissions) return false;
    if (eventPermissions.length === 0) return false;
    for (const permission of eventPermissions) {
      if (query.data.permissions.includes(permission)) return true;
    }
    return false;
  }, [query.data, eventPermissions, hasGlobalPermission])

  return hasPermission;
}