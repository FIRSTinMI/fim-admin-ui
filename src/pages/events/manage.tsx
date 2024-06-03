import { useContext, useEffect, useState } from "react";
import { SupabaseContext } from "../../supabaseContext";
import { useParams } from "react-router-dom";

function EventsManage() {
  const supabase = useContext(SupabaseContext);
  const params = useParams();

  const [event, setEvent] = useState();

  useEffect(() => {
    (async () => {
      const res = await supabase.from("events").select("*").eq('id', params['id']).single();
      if (!res.error) setEvent(res.data);
    })();
  }, [supabase, params]);


  if (!event) return (<>Loading...</>)
  return (<>
    Manage works
    Editing {event['id']}
  </>);
}

export default EventsManage;