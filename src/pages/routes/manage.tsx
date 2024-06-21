import { useParams } from "react-router-dom";
import useHasGlobalPermission from "src/hooks/useHasGlobalPermission";
import { getUpcomingEventsForRoute } from "src/data/supabase/truckRoutes";
import { useSupaQuery } from "src/hooks/useSupaQuery";

function TruckRoutesManage() {
  const params = useParams();
  const hasEventsView = useHasGlobalPermission("Events_View");

  const eventsQuery = useSupaQuery({
    queryKey: ['routeEvents', params['id']],
    queryFn: async (client) => await getUpcomingEventsForRoute(client, parseInt(params['id']!, 10)),
    enabled: hasEventsView
  });

  return (<>
    <p>Editing {params['id']}</p>
    {hasEventsView && eventsQuery.isSuccess && <section>
      Upcoming events
      {eventsQuery.data?.map(e => (<p key={e.id}>{e.name}</p>))}
    </section>}
  </>);
}

export default TruckRoutesManage;