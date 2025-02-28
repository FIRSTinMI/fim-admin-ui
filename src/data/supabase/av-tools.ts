import { FimSupabaseClient } from "src/supabaseContext.tsx";
import { useSupaQuery } from "src/hooks/useSupaQuery.ts";
import parseISO from "date-fns/parseISO";

type EventMatchVideoStat = {
  id: string,
  name: string,
  start_time: Date,
  end_time: Date,
  num_qual: number,
  num_qual_videos: number,
  num_late_qual_videos: number,
  num_playoff: number,
  num_playoff_videos: number,
  num_late_playoff_videos: number,
};

export const getEventMatchVideoStats = async (client: FimSupabaseClient): Promise<EventMatchVideoStat[]> => {
  const { data, error } = await client
    .from("event_match_video_stats")
    .select<string, EventMatchVideoStat>("*")
    .order("start_time", {ascending: true})
    .order("name", {ascending: true});

  if (error) throw new Error(error.message);

  if (data === null) return [];

  return data.map(mapDbToEventMatchVideoStat);
}

export const getEventMatchVideoStatsQueryKey = () => ["getEventMatchVideoStats"];

export const useGetEventMatchVideoStats = () => useSupaQuery({
  queryKey: getEventMatchVideoStatsQueryKey(),
  queryFn: async (client) => {
    return await getEventMatchVideoStats(client)
  }
});

const mapDbToEventMatchVideoStat = (db: EventMatchVideoStat): EventMatchVideoStat => {
  return {
    id: db.id,
    name: db.name,
    start_time: parseISO(db.start_time as unknown as string),
    end_time: parseISO(db.end_time as unknown as string),
    num_qual: db.num_qual,
    num_qual_videos: db.num_qual_videos,
    num_late_qual_videos: db.num_late_qual_videos,
    num_playoff: db.num_playoff,
    num_playoff_videos: db.num_playoff_videos,
    num_late_playoff_videos: db.num_late_playoff_videos
  } as EventMatchVideoStat;
}