"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  getCoordinatorUnits,
  getUnitOffering,
} from "@/app/services/unitService";
import { createUnscheduledAllocation } from "@/app/services/allocationService";
import { Tutor } from "@/app/_types/tutor";
import { getTutorsByUnit } from "@/app/services/userService";

interface UnitDisplay {
  offeringId: number;
  unitCode: string;
  unitName: string;
  year: number;
  session: string;
}

export default function UCManualAllocationPage() {
  const [units, setUnits] = useState<UnitDisplay[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<UnitDisplay | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<number | null>(null);
  const [activityType, setActivityType] = useState<string>("Marking");
  const [hours, setHours] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const activityPresets = [
    { label: "Marking", value: "Marking" },
    { label: "Consultation", value: "Consultation" },
    { label: "Help Desk", value: "HelpDesk" },
  ];

  /* ----------------------------- Load Units ----------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const coordinatorUnits = await getCoordinatorUnits();
        const enrichedUnits: UnitDisplay[] = [];
        for (const u of coordinatorUnits) {
          const data = await getUnitOffering(u.offering_id);
          enrichedUnits.push({
            offeringId: data.offeringId,
            unitCode: data.unitCode,
            unitName: data.unitName,
            year: data.year,
            session: data.session,
          });
        }
        setUnits(enrichedUnits);
      } catch (err) {
        console.error(err);
        setErr("Failed to load unit offerings");
      }
    })();
  }, []);

  /* ----------------------------- Load Tutors ---------------------------- */
  useEffect(() => {
    if (!selectedUnit) return;
    (async () => {
      try {
        const tutorsRes = await getTutorsByUnit(selectedUnit.unitCode);
        setTutors(tutorsRes);
      } catch (err) {
        console.error(err);
        setErr("Failed to load tutors for this unit");
      }
    })();
  }, [selectedUnit]);

  /* ----------------------------- Submit Form ---------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setSuccess(null);

    if (!selectedUnit || !selectedTutor || !hours) {
      setErr("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const res = await createUnscheduledAllocation({
        offeringId: selectedUnit.offeringId,
        tutorId: selectedTutor,
        hours,
        activityType,
      });

      setSuccess(
        `✅ Allocation created successfully (Type: ${res.activityType}, Tutor ID: ${selectedTutor})`,
      );

      // Optional: reset form fields
      setSelectedTutor(null);
      setHours(0);
      setActivityType("Marking");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg || "Failed to create allocation");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------- Render UI ------------------------------ */
  return (
    <Box className="p-6 max-w-2xl mx-auto">
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Assign Unscheduled Allocation
      </Typography>

      <Paper className="p-5 mt-3 shadow-md rounded-xl" elevation={3}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Unit Offering */}
          <FormControl fullWidth>
            <InputLabel id="unit-label">Unit Offering</InputLabel>
            <Select
              labelId="unit-label"
              value={selectedUnit?.offeringId ?? ""}
              onChange={(e) => {
                const id = Number(e.target.value);
                const u = units.find((x) => x.offeringId === id) || null;
                setSelectedUnit(u);
                setTutors([]);
                setSelectedTutor(null);
              }}
              required
            >
              {units.map((u) => (
                <MenuItem key={u.offeringId} value={u.offeringId}>
                  {`${u.unitCode} — ${u.unitName} (${u.session} ${u.year})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Tutor */}
          <FormControl fullWidth disabled={!selectedUnit}>
            <InputLabel id="tutor-label">Tutor</InputLabel>
            <Select
              labelId="tutor-label"
              value={selectedTutor ?? ""}
              onChange={(e) => setSelectedTutor(Number(e.target.value))}
              required
            >
              {tutors.map((t) => (
                <MenuItem key={t.user_id} value={t.user_id}>
                  {t.first_name} {t.last_name} ({t.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Activity Type */}
          <FormControl fullWidth>
            <InputLabel id="activity-type-label">Activity Type</InputLabel>
            <Select
              labelId="activity-type-label"
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              required
            >
              {activityPresets.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Hours */}
          <TextField
            label="Hours"
            type="number"
            fullWidth
            required
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />

          {/* Submit */}
          <Box className="flex justify-end items-center gap-3 mt-3">
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              color="primary"
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Create Allocation"
              )}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccess(null)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!err}
        autoHideDuration={4000}
        onClose={() => setErr(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErr(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {err}
        </Alert>
      </Snackbar>
    </Box>
  );
}
