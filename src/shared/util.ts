import { formatDistanceToNow, format } from "date-fns";
import { matchPath, resolvePath, useLocation } from "react-router-dom";

export function useRouteMatch(patterns: readonly string[]) {
  const { pathname } = useLocation();

  for (let i = 0; i < patterns.length; i += 1) {
    const pattern = patterns[i];
    const resolvedPath = resolvePath(`..${pattern}`, pathname);
    const possibleMatch = matchPath(resolvedPath.pathname, pathname);
    if (possibleMatch !== null) {
      return pattern;
    }
  }

  return null;
}

export const formatEventDate = (date: Date) => format(date, "PP");

export const getRelativeTime = (value: string | null): string | null => {
  if (!value) {
    return null;
  }
  if (value === "infinity") {
    return "Now";
  }

  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

export const getPrettyDateTime = (value: string | null): string | null => {
  if (!value) {
    return null;
  }
  if (value === "infinity") {
    return "Now";
  }

  return new Date(value).toLocaleString();
}

export const stringToColor = (str: string) => {
  let hash = 0;
  str.split('').forEach(char => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash)
  })
  let colour = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    colour += value.toString(16).padStart(2, '0')
  }
  return colour
}

export type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;

