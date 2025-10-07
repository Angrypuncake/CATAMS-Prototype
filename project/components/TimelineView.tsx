"use client";
import React, { useMemo } from "react";
import Tooltip from "@mui/material/Tooltip";

/* ===================== Types ===================== */
export type WeekKey = string;

export interface WeekDef {
    key: WeekKey;
    label: string;
}

export interface CellAllocation {
    tutor: string;
    hours: number;
    role?: string;
    notes?: string;
}

/** A cell can hold 0..n allocations */
type CellValue = CellAllocation | CellAllocation[] | undefined;

export interface ActivityRow {
    id: string;
    name: string;
    activityType?: string;
    paycode?: string;
    flexTotal?: number;
    allocations: Record<WeekKey, CellValue>;
}

export interface ExtraColumn<A extends ActivityRow = ActivityRow> {
    key: string;
    header: string;
    width?: number | string;
    render: (activity: A) => React.ReactNode;
}

export interface TimelineViewProps<A extends ActivityRow = ActivityRow> {
    title?: string;
    weeks: WeekDef[];
    activities: A[];
    extraColumns?: ExtraColumn<A>[];
    /** keeps header stuck at the top of the scroll area */
    stickyHeader?: boolean;
    /** row/header height matches your table so the layout doesn’t “bounce” */
    density?: "regular" | "compact";
    /** called when a cell is clicked (optional) */
    onCellClick?: (args: { activity: A; week: WeekDef; cell?: CellValue }) => void;
    /** optional className for the outer container */
    className?: string;
}

/* ===================== Helpers ===================== */
const cx = (...cls: Array<string | false | undefined>) =>
    cls.filter(Boolean).join(" ");

export function buildWeeksRange(start: number, end: number, termLabel = "S1"): WeekDef[] {
    const out: WeekDef[] = [];
    for (let i = start; i <= end; i++) out.push({ key: `W${i}`, label: `${termLabel} Week ${i}` });
    return out;
}

/* ===================== Component ===================== */
export function TimelineView<A extends ActivityRow = ActivityRow>({
    title = "Timeline",
    weeks,
    activities,
    extraColumns = [],
    stickyHeader = true,
    density = "regular",
    onCellClick,
    className,
}: TimelineViewProps<A>) {
    // match your table’s scale so toggling doesn’t jump around
    const headerH = density === "compact" ? 40 : 44; // px
    const rowH = density === "compact" ? 40 : 48; // px

    // column widths (keep these consistent so width stays stable)
    const COL_ACTIVITY = 360; // px, frozen column
    const COL_EXTRA = 140; // px each extra column
    const COL_WEEK = 120; // px each week column

    const gridTemplate = useMemo(() => {
        const extra = extraColumns.map(() => `minmax(${COL_EXTRA}px, ${COL_EXTRA}px)`).join(" ");
        const weekCols = weeks.map(() => `minmax(${COL_WEEK}px, ${COL_WEEK}px)`).join(" ");
        return `minmax(${COL_ACTIVITY}px, ${COL_ACTIVITY}px) ${extra} ${weekCols}`;
    }, [weeks, extraColumns]);

    const headerWeekCells = useMemo(
        () =>
            weeks.map((w) => (
                <div
                    key={w.key}
                    className="border-l border-gray-200 flex items-center justify-center text-xs font-semibold bg-gray-50"
                    style={{ height: headerH }}
                    title={w.label}
                >
                    {w.label}
                </div>
            )),
        [weeks, headerH]
    );

    return (
        <div className={cx("w-full", className)}>
            {/* Top bar to mirror your table spacing */}
            <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{title}</h2>
                <div className="text-xs text-gray-500">Rows: activities • Columns: weeks</div>
            </div>

            {/* Scroll container: matches table wrapper (no bouncing) */}
            <div className="overflow-x-auto overflow-y-hidden border rounded">
                {/* give the grid a minimum width to match your table */}
                <div className="min-w-[1100px]">
                    {/* Header row */}
                    <div
                        className={cx(
                            "grid bg-gray-50",
                            stickyHeader && "sticky top-0 z-30"
                        )}
                        style={{ gridTemplateColumns: gridTemplate }}
                    >
                        {/* Frozen header cell (Activity) */}
                        <div
                            className="border-b border-gray-200 px-4 flex items-center text-xs font-semibold bg-gray-50 sticky left-0 z-40"
                            style={{ height: headerH }}
                        >
                            Activity
                        </div>

                        {/* Extra columns headers */}
                        {extraColumns.map((col) => (
                            <div
                                key={col.key}
                                className="border-b border-gray-200 px-3 flex items-center text-xs font-semibold bg-gray-50"
                                style={{ height: headerH, width: col.width }}
                            >
                                {col.header}
                            </div>
                        ))}

                        {/* Week headers */}
                        {headerWeekCells}
                    </div>

                    {/* Body */}
                    <div>
                        {activities.map((act) => (
                            <div
                                key={act.id}
                                className="grid even:bg-gray-50/40"
                                style={{ gridTemplateColumns: gridTemplate }}
                            >
                                {/* Frozen activity stub */}
                                <div
                                    className="border-t border-gray-200 px-4 flex items-center gap-3 text-sm bg-white sticky left-0 z-20"
                                    style={{ height: rowH }}
                                >
                                    <div className="shrink-0 rounded-xl bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[10px] font-semibold">
                                        {act.activityType ?? "Activity"}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="truncate font-medium" title={act.name}>
                                            {act.name}
                                        </div>
                                        {act.paycode || act.flexTotal !== undefined ? (
                                            <div className="truncate text-xs text-gray-500">
                                                {act.paycode ? `Pay ${act.paycode}` : ""}
                                                {act.paycode && act.flexTotal !== undefined ? " • " : ""}
                                                {act.flexTotal !== undefined ? `Flex ${act.flexTotal}` : ""}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Extra columns */}
                                {extraColumns.map((col) => (
                                    <div
                                        key={col.key}
                                        className="border-t border-gray-200 px-3 flex items-center text-xs text-gray-700 bg-white"
                                        style={{ height: rowH }}
                                    >
                                        {col.render(act as any)}
                                    </div>
                                ))}

                                {/* Week cells */}
                                {weeks.map((w) => {
                                    const raw = act.allocations[w.key];
                                    const items: CellAllocation[] = Array.isArray(raw) ? raw : raw ? [raw] : [];

                                    const tooltip =
                                        items.length === 0 ? (
                                            "No allocation"
                                        ) : (
                                            <div>
                                                {items.map((c, i) => (
                                                    <div key={i} className="mb-1">
                                                        <div className="font-medium text-[12px] leading-4">
                                                            {c.tutor} • {c.hours}h {c.role ? `• ${c.role}` : ""}
                                                        </div>
                                                        {c.notes && (
                                                            <div className="text-[11px] text-gray-600">{c.notes}</div>
                                                        )}
                                                    </div>
                                                ))}
                                                <div className="text-[11px] text-gray-500 mt-1">
                                                    {act.name} — {w.label}
                                                </div>
                                            </div>
                                        );

                                    return (
                                        <Tooltip
                                            key={`${act.id}_${w.key}`}
                                            title={tooltip}
                                            arrow
                                            placement="top"
                                            disableInteractive
                                            enterDelay={150}
                                            componentsProps={{
                                                tooltip: {
                                                    sx: {
                                                        bgcolor: "background.paper",
                                                        color: "text.primary",
                                                        border: 1,
                                                        borderColor: "divider",
                                                        boxShadow: 4,
                                                        fontSize: 12,
                                                        p: 1,
                                                        maxWidth: 280,
                                                    },
                                                },
                                                arrow: { sx: { color: "background.paper" } },
                                            }}
                                        >
                                            <button
                                                data-grid-cell="1"
                                                className={cx(
                                                    "w-full border-t border-l border-gray-200 px-2 text-xs text-left outline-none bg-white",
                                                    items.length ? "font-medium text-gray-900" : "text-gray-400",
                                                    "focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                )}
                                                style={{ height: rowH }}
                                                onClick={() => onCellClick?.({ activity: act as A, week: w, cell: raw })}
                                            >
                                                {items.length ? (
                                                    <span className="inline-flex flex-wrap items-center gap-1">
                                                        {items.slice(0, 2).map((c, i) => (
                                                            <span
                                                                key={i}
                                                                className="inline-block rounded-md bg-indigo-600/10 px-1.5 py-0.5 text-[10px]"
                                                            >
                                                                {c.tutor} {c.hours}h
                                                            </span>
                                                        ))}
                                                        {items.length > 2 && (
                                                            <span className="text-[10px]">+{items.length - 2} more</span>
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span>—</span>
                                                )}
                                            </button>
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend (small, unobtrusive) */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                <span className="inline-flex items-center gap-2">
                    <span className="rounded-md bg-indigo-600/10 px-1.5 py-0.5 text-[10px] text-indigo-700">
                        Tutor
                    </span>
                    Allocated staff
                </span>
                <span>•</span>
                <span>Hover for details • Click to open your edit flow</span>
            </div>
        </div>
    );
}
