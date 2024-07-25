export enum EventStatus
{
    NotStarted = "NotStarted",
    AwaitingQuals = "AwaitingQuals",
    QualsInProgress = "QualsInProgress",
    AwaitingAlliances = "AwaitingAlliances",
    AwaitingPlayoffs = "AwaitingPlayoffs",
    PlayoffsInProgress = "PlayoffsInProgress",
    WinnerDetermined = "WinnerDetermined",
    Completed = "Completed"
}

export const eventStatusToShortDescription = (status: EventStatus | null | undefined) => {
  if (status === null || status === undefined) return "";

  switch (status) {
    case EventStatus.NotStarted:
      return "Not Started";
      break;
    case EventStatus.AwaitingQuals:
      return "Awaiting Quals";
      break;
    case EventStatus.QualsInProgress:
      return "Quals In Progress";
      break;
    case EventStatus.AwaitingAlliances:
      return "Awaiting Alliances";
      break;
    case EventStatus.AwaitingPlayoffs:
      return "Awaiting Playoffs";
      break;
    case EventStatus.PlayoffsInProgress:
      return "Playoffs In Progress";
      break;
    case EventStatus.WinnerDetermined:
      return "Winner Determined";
      break;
    case EventStatus.Completed:
      return "Completed";
      break;
  }
}