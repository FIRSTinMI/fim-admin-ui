import { useParams } from "react-router-dom";
import { useSupaQuery } from "src/hooks/useSupaQuery";
import { getEvent } from "src/data/supabase/events";
import { Loading } from "src/shared/Loading";
import { Alert } from "@mui/material";

function EventsManage() {
  const params = useParams();

  const getEventQuery = useSupaQuery({
    queryKey: ['getEvent', params['id']],
    queryFn: (client) => {
      const id = params['id'];
      if (!id) return Promise.resolve(null);
      return getEvent(client, id);
    }
  });

  if (getEventQuery.isLoading) return (<Loading />);
  const data = getEventQuery.data;
  
  if (getEventQuery.isError || !data) return (<Alert severity="error">
    <strong>Error!</strong> Unable to fetch information about this event
  </Alert>);
  
  return (<>
    <h3>Edit {data.name}</h3>
  </>);
}

export default EventsManage;