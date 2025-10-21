"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

// Import Components
import { Drawer } from "./components/AllocationDrawer";
import { AllocationsTable } from "./components/AllocationsTable";
import { FilterControls } from "./components/FilterControls";

// Import types
import { AllocationRow, PaycodeOption } from "./types";
import { SaveAllocationPayload } from "@/app/_types/allocations";
import { Tutor } from "@/app/_types/tutor";
import { Button, ButtonGroup } from "@mui/material";

// Import services
import {
  getAdminAllocations,
  patchAdminAllocation,
} from "@/app/services/allocationService";
import { getTutors } from "@/app/services/userService";
import { getPaycodes } from "@/app/services/paycodeService";
import {
  TimelineView,
  buildWeeksRange,
  type WeekDef,
  type ActivityRow,
  type CellAllocation as TLCellAllocation,
} from "./components/TimelineView";
import {
  activityKey,
  activityName,
  labelName,
  parseDateSafe,
  rowsToTimelineActivities,
  startOfWeekMonday,
  weekKeyFor,
} from "./util";

/** ------------------------------ Main Page ------------------------------ */
export default function AdminAllAllocationsPage() {
  // Filters
  const [q, setQ] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [activityType, setActivityType] = useState("");
  const [status, setStatus] = useState("");
  const [limit, setLimit] = useState(25);
  const [page, setPage] = useState(1);

  // scheduled toggle
  const [tab, setTab] = useState<"scheduled" | "unscheduled">("scheduled");
  const [viewMode, setViewMode] = useState<"table" | "timeline">("table");

  // data
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<AllocationRow[]>([]);
  const [total, setTotal] = useState(0);

  // options
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [paycodes, setPaycodes] = useState<PaycodeOption[]>([]);

  // drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<AllocationRow | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const j = await getAdminAllocations({
        page,
        limit,
        tab,
        q,
        unitCode,
        activityType,
        status,
      });
      setRows(j.data || []);
      setTotal(j.total || 0);
    } catch (e) {
      console.error(e);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, tab, q, unitCode, activityType, status]);
  // Trigger reload when tab changes
  useEffect(() => {
    setPage(1);
    fetchData();
  }, [tab, fetchData]);

  useEffect(() => {
    (async () => {
      try {
        const [t, p] = await Promise.all([getTutors(), getPaycodes()]);
        setTutors(t || []);
        setPaycodes(p || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Prefer 'mode' to split rows; fall back to session_date
  const { scheduledRows, unscheduledRows } = useMemo(() => {
    const sched: AllocationRow[] = [];
    const unsched: AllocationRow[] = [];
    for (const r of rows) {
      const isScheduled =
        r.mode === "scheduled" || (r.mode == null && !!r.session_date);
      if (isScheduled) sched.push(r);
      else unsched.push(r);
    }
    return { scheduledRows: sched, unscheduledRows: unsched };
  }, [rows]);

  const visible = tab === "scheduled" ? scheduledRows : unscheduledRows;

  /* ------- Timeline derivations (only meaningful for scheduled tab) ------- */
  const termStart = useMemo(() => {
    const dts = visible
      .map((r) => parseDateSafe(r.session_date))
      .filter((d): d is Date => !!d);
    const min = dts.length
      ? new Date(Math.min(...dts.map((d) => d.getTime())))
      : new Date();
    return startOfWeekMonday(min);
  }, [visible]);

  const weeks: WeekDef[] = useMemo(() => buildWeeksRange(-6, 13, "S1"), []);
  const timelineActivities: ActivityRow[] = useMemo(
    () => rowsToTimelineActivities(visible, { termStart, termLabel: "S1" }),
    [visible, termStart],
  );

  /** ========= NEW: map tooltip “Edit this allocation” -> open Drawer ========= */
  function handleTimelineCellEdit(args: {
    activity: ActivityRow;
    week: WeekDef;
    cell: TLCellAllocation[];
  }) {
    // pick the first tutor in the cell stack
    const first = args.cell[0];
    const tutorName = (first?.tutor || "").trim();

    // Find a matching scheduled row by (activityKey, weekKey, tutor display name)
    // activity.name is built via activityName(); activityKey() uses unit+type+name joined by " • "
    const match = scheduledRows.find((r) => {
      const actKey = activityKey(r);
      const wk = r.session_date
        ? weekKeyFor(new Date(r.session_date.slice(0, 10)), termStart)
        : "";
      return (
        wk === args.week.key &&
        (labelName(r) === tutorName || tutorName === "") &&
        // Loose match: activity label prefix (unit – activity_name) equals activity.name
        activityName(r) === args.activity.name
      );
    });

    if (match) {
      onEdit(match);
    } else {
      // Fallback: open the first row of that activity in that week (if any)
      const fallback = scheduledRows.find((r) => {
        const wk = r.session_date
          ? weekKeyFor(new Date(r.session_date.slice(0, 10)), termStart)
          : "";
        return wk === args.week.key && activityName(r) === args.activity.name;
      });
      if (fallback) onEdit(fallback);
      else console.warn("No matching row found for timeline cell edit:", args);
    }
  }

  function onEdit(row: AllocationRow) {
    setActiveRow(row);
    setDrawerOpen(true);
  }

  async function onSave(updated: SaveAllocationPayload) {
    if (!activeRow) return;
    try {
      await patchAdminAllocation(activeRow.id, updated);
      await fetchData();
    } catch (err) {
      console.error("Error saving allocation", err);
    }
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-semibold mb-4">All Allocations</h1>

      {/* Top controls */}
      <FilterControls
        q={q}
        unitCode={unitCode}
        activityType={activityType}
        status={status}
        limit={limit}
        onQChange={setQ}
        onUnitCodeChange={setUnitCode}
        onActivityTypeChange={setActivityType}
        onStatusChange={setStatus}
        onLimitChange={setLimit}
        onApply={() => {
          setPage(1);
          fetchData();
        }}
      />

      {/* Scheduled / Unscheduled toggle */}
      {/* Tab tells the backend which types of allocations to fetch */}
      <div className="mb-3">
        <ButtonGroup
          variant="outlined"
          sx={{ borderRadius: "1px", overflow: "hidden" }}
        >
          <Button
            variant={tab === "scheduled" ? "contained" : "outlined"}
            color="primary"
            size="small"
            onClick={() => setTab("scheduled")}
          >
            Scheduled
          </Button>
          <Button
            variant={tab === "unscheduled" ? "contained" : "outlined"}
            color="primary"
            size="small"
            onClick={() => setTab("unscheduled")}
          >
            Unscheduled
          </Button>
        </ButtonGroup>
      </div>

      <ButtonGroup variant="outlined" sx={{ borderRadius: 1 }}>
        <Button
          variant={viewMode === "table" ? "contained" : "outlined"}
          onClick={() => setViewMode("table")}
        >
          Table
        </Button>
        <Button
          variant={viewMode === "timeline" ? "contained" : "outlined"}
          onClick={() => setViewMode("timeline")}
        >
          Timeline
        </Button>
      </ButtonGroup>

      {/* Table */}
      {viewMode === "table" || tab === "unscheduled" ? (
        <AllocationsTable
          tab={tab}
          loading={loading}
          visible={visible}
          page={page}
          limit={limit}
          total={total}
          onEdit={onEdit}
          onPageChange={(newPage) => setPage(newPage)}
        />
      ) : (
        /* Timeline (scheduled only) */
        <div className="rounded border">
          <div className="p-3">
            <TimelineView
              title="All Allocations — Timeline"
              weeks={weeks}
              activities={timelineActivities}
              extraColumns={[
                {
                  key: "staffCount",
                  header: "Staff",
                  render: (a) => {
                    const set = new Set(
                      Object.values(a.allocations)
                        .flatMap((v) => (Array.isArray(v) ? v : v ? [v] : []))
                        .map((x) => x.tutor),
                    );
                    return <span className="text-xs">{set.size}</span>;
                  },
                },
                {
                  key: "hoursTotal",
                  header: "Hours",
                  render: (a) => {
                    const sum = Object.values(a.allocations)
                      .flatMap((v) => (Array.isArray(v) ? v : v ? [v] : []))
                      .reduce((acc, x) => acc + (x.hours || 0), 0);
                    return <span className="text-xs">{sum}</span>;
                  },
                },
              ]}
              onCellClick={() => {
                /* optional click behaviour */
              }}
              onCellEdit={handleTimelineCellEdit}
            />
          </div>
        </div>
      )}

      {/* Right-side Edit Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        row={activeRow}
        tutors={tutors}
        paycodes={paycodes}
        onSave={onSave}
      />
    </div>
  );
}
