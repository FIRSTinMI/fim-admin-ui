import { FimSupabaseClient } from "../../supabaseContext";
import { useSupaQuery } from "src/hooks/useSupaQuery";
import { parseISO } from "date-fns";

export type TournamentLevel = 
  "Test" |
  "Practice" |
  "Qualification" |
  "Playoff";

export function tournamentLevelPlayOrder(level: TournamentLevel): number {
  switch (level) {
    case "Test": return 1;
    case "Practice": return 2;
    case "Qualification": return 3;
    case "Playoff": return 4;
  }
  
  return -1;
}

export type Match = {
  id: number,
  tournament_level: TournamentLevel,
  match_number: number,
  play_number: number | null,
  red_alliance_teams: number[],
  blue_alliance_teams: number[],
  red_alliance_id?: number,
  blue_alliance_id?: number,
  scheduled_start_time: Date | null,
  actual_start_time: Date | null,
  post_result_time: Date | null,
  is_discarded: boolean
};

export const getMatchesForEvent = async (client: FimSupabaseClient, eventId: string): Promise<Match[]> => {
  const { data, error } = await client
    .from("matches")
    .select<string, Match>("id,tournament_level,match_number,play_number,red_alliance_teams,blue_alliance_teams,red_alliance_id,blue_alliance_id,scheduled_start_time,actual_start_time,post_result_time,is_discarded")
    .eq('event_id', eventId);

  if (error) throw new Error(error.message);

  if (data === null) return [];

  return data.map(e => mapDbToMatch(e));
}

export const useGetMatchesForEvent = (eventId: string | null) => useSupaQuery({
  queryKey: ["getMatchesForEvent", eventId],
  queryFn: async (client) => {
    if (!eventId) throw new Error("No event ID provided");
    return await getMatchesForEvent(client, eventId);
  }
});

const mapDbToMatch = (db: Match): Match => {
  function parseNullableISO(dateString: unknown): Date | null {
    if (dateString === null || dateString === undefined) return null;
    return parseISO(dateString as string);
  }
  
  return {
    id: db.id,
    tournament_level: db.tournament_level,
    match_number: db.match_number,
    play_number: db.play_number,
    red_alliance_teams: db.red_alliance_teams,
    blue_alliance_teams: db.blue_alliance_teams,
    red_alliance_id: db.red_alliance_id,
    blue_alliance_id: db.blue_alliance_id,
    scheduled_start_time: parseNullableISO(db.scheduled_start_time),
    actual_start_time: parseNullableISO(db.actual_start_time),
    post_result_time: parseNullableISO(db.post_result_time),
    is_discarded: db.is_discarded
  };
}

// export const getEventQueryKey = (eventId: string) => ['event', eventId] as [string, ...unknown[]];
// export const useGetEventQuery = (eventId: string, refetch: boolean = true) => useSupaQuery({
//   queryKey: getEventQueryKey(eventId),
//   queryFn: (client) => getEvent(client, eventId),
//   refetchOnWindowFocus: refetch
// });