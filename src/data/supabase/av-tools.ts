import { FimSupabaseClient } from "src/supabaseContext.tsx";
import { useSupaQuery } from "src/hooks/useSupaQuery.ts";
import parseISO from "date-fns/parseISO";
import { addDays, formatISO } from "date-fns";
import { OmitFirstArg } from "src/shared/util.ts";

type EventMatchVideoStat = {
  id: string,
  name: string,
  code: string,
  start_time: Date,
  end_time: Date,
  numQual: number,
  numQualVideos: number,
  lateQualVideos: string[] | null,
  numPlayoff: number,
  numPlayoffVideos: number,
  latePlayoffVideos: string[] | null,
};

export const getEventMatchVideoStats = async (client: FimSupabaseClient, onlyCurrent: boolean = true, eventIds?: string[]): Promise<EventMatchVideoStat[]> => {
  let query = client
    .from("event_match_video_stats")
    .select<string, EventMatchVideoStat>("*")
    .order("start_time", {ascending: true})
    .order("name", {ascending: true});
  
  if (onlyCurrent) {
    const startsBefore = new Date();
    const endsAfter = addDays(startsBefore, -2);
    query = query.lte("start_time", formatISO(startsBefore)).gte("end_time", formatISO(endsAfter));
  }
  
  if (eventIds && eventIds.length > 0) query = query.in("id", eventIds);

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  if (data === null) return [];

  return data.map(mapDbToEventMatchVideoStat);
}

export const getEventMatchVideoStatsQueryKey = (...params: Parameters<OmitFirstArg<typeof getEventMatchVideoStats>>) => ["getEventMatchVideoStats", ...params];

export const useGetEventMatchVideoStats = (...params: Parameters<OmitFirstArg<typeof getEventMatchVideoStats>>) => useSupaQuery({
  queryKey: getEventMatchVideoStatsQueryKey(...params),
  queryFn: async (client) => {
    return await getEventMatchVideoStats(client, ...params)
  }
});

const mapDbToEventMatchVideoStat = (db: EventMatchVideoStat): EventMatchVideoStat => {
  return {
    id: db.id,
    name: db.name,
    code: db.code,
    start_time: parseISO(db.start_time as unknown as string),
    end_time: parseISO(db.end_time as unknown as string),
    numQual: db.numQual,
    numQualVideos: db.numQualVideos,
    lateQualVideos: db.lateQualVideos,
    numPlayoff: db.numPlayoff,
    numPlayoffVideos: db.numPlayoffVideos,
    latePlayoffVideos: db.latePlayoffVideos
  } as EventMatchVideoStat;
}