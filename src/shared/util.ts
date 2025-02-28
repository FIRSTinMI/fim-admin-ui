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
