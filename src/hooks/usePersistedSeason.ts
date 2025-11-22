import { useEffect, useState } from "react";

export default function usePersistedSeason(): [number | null, (seasonId: number | null) => void] {
  const [selectedSeason, setSelectedSeason] = useState<number | null>();

  useEffect(() => {
    const selected = localStorage.getItem('fim-admin-selected-season');
    if (selected) {
      setSelectedSeason(Number(selected));
    }
  }, []);

  useEffect(() => {
    if (!selectedSeason) return;
    localStorage.setItem('fim-admin-selected-season', selectedSeason.toString());
  }, [selectedSeason]);
  
  return [selectedSeason ?? null, setSelectedSeason];
}