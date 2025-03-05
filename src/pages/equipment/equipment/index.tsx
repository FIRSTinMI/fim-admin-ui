import { LinearProgress, Stack, Tab, Tabs, Typography } from "@mui/material";
import React, { createElement, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetEquipmentById } from "src/data/supabase/equipment";
import Timestamp from "src/shared/Timestamp";
import AVTabs from "./av/AVTabs";
import EquipmentLogViewer from "src/shared/EquipmentLogViewer";
import { useTitle } from "src/hooks/useTitle";

const Equipment: React.FC = () => {
  const { id: equipment_id, tab: sub_tab } = useParams<{
    id: string;
    tab: string;
  }>();
  const navigate = useNavigate();  
  const hardware = useGetEquipmentById(equipment_id!);
  useTitle(`${hardware.data?.name ?? "Loading..."} | Equipment`);

  const [tab, setTab] = useState<string>(sub_tab ?? "");

  // Set the tab based on the URL, or when the URL changes
  useEffect(() => {
    if (sub_tab) {
      setTab(sub_tab);
    } else {
      setTab("logs");
      navigate(`/equipment/${equipment_id}/logs`, { replace: true });
    }
  }, [sub_tab]);

  // Update the URL when the tab changes
  useEffect(() => {
    if (tab) {
      navigate(`/equipment/${equipment_id}/${tab}`, { replace: true });
    }
  }, [tab]);

  if (hardware.isLoading) return <LinearProgress />;

  if (
    hardware.isError ||
    !hardware.data ||
    (Array.isArray(hardware.data) && hardware.data.length === 0)
  ) {
    return <Typography>Equipment not found</Typography>;
  }

  return (
    <Stack direction={"column"} spacing={2}>
      <Typography variant="body1">
        Last Online:{" "}
        <Timestamp timestamp={hardware.data.configuration.LastSeen} relative />
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, newValue) => setTab(newValue)}
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        {/* Generic Tabs */}
        <Tab value="logs" label="Logs" />

        {/* AV Tabs */}
        {hardware.data.equipmentType?.id === 1 &&
          Object.keys(AVTabs).map((key) => (
            <Tab
              value={`av_${key}`}
              label={AVTabs[key].label}
              key={`av_${key}`}
            />
          ))}
      </Tabs>

      {/* Logs Tab */}
      {tab === "logs" && (
        <EquipmentLogViewer equipment_id={hardware.data.id!} />
      )}

      {/* AV Tabs */}
      {hardware.data.equipmentType?.id === 1 &&
        tab.startsWith("av_") &&
        createElement(AVTabs[tab.substring(3)].component, {
          hardware: hardware.data,
        })}
    </Stack>
  );
};

export default Equipment;
