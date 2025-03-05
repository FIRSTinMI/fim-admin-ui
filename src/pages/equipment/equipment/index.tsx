import { LinearProgress, Stack, Tab, Tabs, Typography } from "@mui/material";
import React, { createElement, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetEquipmentById } from "src/data/supabase/equipment";
import Timestamp from "src/shared/Timestamp";
import AVTabs from "./av/AVTabs";
import EquipmentLogViewer from "src/shared/EquipmentLogViewer";

const Equipment: React.FC = () => {
  const { id: equipment_id } = useParams<{ id: string }>();
  const hardware = useGetEquipmentById(equipment_id!);

  const [tab, setTab] = useState<string>("logs");

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
      <Typography variant="h3">{hardware.data.name}</Typography>
      <Typography variant="body1">
        Last Online:{" "}
        <Timestamp timestamp={hardware.data.configuration.LastSeen} relative />
      </Typography>

      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
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
