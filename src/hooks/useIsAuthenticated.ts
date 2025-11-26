import { useContext, useEffect, useState } from "react";
import { SupabaseContext } from "../supabaseContext";

export default function useIsAuthenticated() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const supabase = useContext(SupabaseContext);
  useEffect(() => {
    const subscription = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => { subscription.data.subscription.unsubscribe(); }
  }, [supabase.auth]);

  return isAuthenticated;
}