"use client";
import React, { useMemo } from "react";
import Tooltip from "@mui/material/Tooltip";

/* ===================== Types ===================== */
export type WeekKey = string;
export interface WeekDef { key: WeekKey; label: string; }
export interface CellAllocation { tutor: string; hours: number; role?: string; notes?: string; }
type CellValue = CellAllocation | CellAllocation[] | undefined;

export interface ActivityRow {
    id: string;
    name: string;             // e.g. "COMP2022 – .../Tutorial-01"
    activityType?: string;    // e.g. "Tutorial"
    paycode?: string;         // e.g. "LAB2"
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
    density?: "regular" | "compact";
    onCellClick?: (args: { activity: A; week: WeekDef; cell?: CellValue }) => void;
    className?: string;
}

/* ===================== Helpers ===================== */
const cx = (...cls: Array<string | false | undefined>) => cls.filter(Boolean).join(" ");
export function buildWeeksRange(start: number, end: number, termLabel = "S1"): WeekDef[] {
    const out: WeekDef[] = [];
    for (let i = start; i <= end; i++) out.push({ key: `W${i}`, label: `${termLabel} Week ${i}` });
    return out;
}

/* ===================== Component ===================== */
/**
 * Grid: [ LEFT rail (fixed width) | RIGHT weeks (fills, horizontal scroll) ]
 * LEFT has its own header + rows (so no empty block). RIGHT is the only area that scrolls.
 * Header/row heights match the table to avoid layout “bounce” when toggling views.
 */
export function TimelineView<A extends ActivityRow = ActivityRow>({
    title = "All Allocations — Timeline",
    weeks,
    activities,
    extraColumns = [],
    density = "regular",
    onCellClick,
    className,
}: TimelineViewProps<A>) {
    // match your table rhythm so toggling doesn't jump
    const headerH = density === "compact" ? 40 : 44; // px
    const rowH = density === "compact" ? 40 : 48;    // px

    // widths
    const COL_ACTIVITY = 360;  // left "Activity" column width
    const COL_EXTRA = 140;     // each extra column width
    const COL_WEEK = 120;      // each week column width

    const leftWidthPx = COL_ACTIVITY + extraColumns.length * COL_EXTRA;

    const leftGridTemplate = useMemo(() => {
        const extras = extraColumns.map(() => `${COL_EXTRA}px`).join(" ");
        return `${COL_ACTIVITY}px ${extras}`.trim();
    }, [extraColumns]);

    const weeksTemplate = useMemo(
        () => weeks.map(() => `${COL_WEEK}px`).join(" "),
        [weeks]
    );

    const WeekHeaderCells = useMemo(
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

    const tooltipContent = (act: ActivityRow, w: WeekDef, cellList: CellAllocation[]) => (
        <div className="text-[12px] leading-5">
            {cellList.map((c, i) => (
                <div key={i} className="mb-1">
                    <div className="font-semibold">
                        {c.tutor} • {c.hours}h {c.role ? `• ${c.role}` : ""}
                    </div>
                    {c.notes && <div className="text-gray-700">{c.notes}</div>}
                </div>
            ))}
            <div className="mt-1 border-t pt-1 text-[11px] text-gray-600">
                <div>
                    {act.activityType ? `${act.activityType}` : "Activity"}
                    {act.paycode ? ` • Pay ${act.paycode}` : ""}
                </div>
                <div className="truncate max-w-[260px]">{act.name}</div>
                <div className="text-gray-500">— {w.label}</div>
            </div>
        </div>
    );

    return (
        <div className={cx("w-full", className)}>
            <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{title}</h2>
                <div className="text-xs text-gray-500">Rows: activities • Columns: weeks</div>
            </div>

            {/* Outer container fixed to page width — only weeks scroll horizontally */}
            <div className="border rounded overflow-hidden">
                <div className="grid" style={{ gridTemplateColumns: `${leftWidthPx}px 1fr` }}>
                    {/* LEFT rail: header + rows */}
                    <div>
                        {/* Left header */}
                        <div className="bg-gray-50 sticky top-0 z-30">
                            <div className="grid" style={{ gridTemplateColumns: leftGridTemplate }}>
                                <div
                                    className="border-b border-gray-200 px-4 flex items-center text-xs font-semibold"
                                    style={{ height: headerH }}
                                >
                                    Activity
                                </div>
                                {extraColumns.map((col) => (
                                    <div
                                        key={col.key}
                                        className="border-b border-gray-200 px-3 flex items-center text-xs font-semibold"
                                        style={{ height: headerH }}
                                    >
                                        {col.header}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Left rows */}
                        <div>
                            {activities.map((act, idx) => (
                                <div
                                    key={act.id}
                                    className={cx(idx % 2 === 1 && "bg-gray-50/40")}
                                >
                                    <div className="grid" style={{ gridTemplateColumns: leftGridTemplate }}>
                                        {/* Activity cell */}
                                        <div
                                            className="border-t border-gray-200 px-4 flex items-center gap-3 text-sm"
                                            style={{ height: rowH }}
                                        >
                                            <span className="shrink-0 rounded-xl bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[10px] font-semibold">
                                                {act.activityType ?? "Activity"}
                                            </span>
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
                                                className="border-t border-gray-200 px-3 flex items-center text-xs text-gray-700"
                                                style={{ height: rowH }}
                                            >
                                                {col.render(act as any)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT weeks: single horizontal scroller with header + rows */}
                    <div className="overflow-x-auto">
                        {/* Weeks header (inside the scroller) */}
                        <div
                            className="grid bg-gray-50 sticky top-0 z-20"
                            style={{ gridTemplateColumns: weeksTemplate, height: headerH }}
                        >
                            {WeekHeaderCells}
                        </div>

                        {/* Weeks rows */}
                        <div>
                            {activities.map((act, idx) => (
                                <div key={act.id} className={cx(idx % 2 === 1 && "bg-gray-50/40")}>
                                    <div className="grid" style={{ gridTemplateColumns: weeksTemplate }}>
                                        {weeks.map((w) => {
                                            const raw = act.allocations[w.key];
                                            const items: CellAllocation[] = Array.isArray(raw) ? raw : raw ? [raw] : [];

                                            return (
                                                <Tooltip
                                                    key={`${act.id}_${w.key}`}
                                                    title={
                                                        items.length
                                                            ? tooltipContent(act, w, items)
                                                            : "No allocation"
                                                    }
                                                    arrow
                                                    placement="top"
                                                    disableInteractive
                                                    enterDelay={120}
                                                    componentsProps={{
                                                        tooltip: {
                                                            sx: {
                                                                bgcolor: "background.paper",
                                                                color: "text.primary",
                                                                border: 1,
                                                                borderColor: "divider",
                                                                boxShadow: 4,
                                                                fontSize: 12,
                                                                p: 1.25,
                                                                maxWidth: 320,
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
                                                            // STACKED, single-line badges (no wrapping). Two shown max; then "+N more".
                                                            <div className="flex flex-col gap-1">
                                                                {items.slice(0, 2).map((c, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="inline-block rounded-md bg-indigo-600/10 px-1.5 text-[10px] h-5 leading-5 whitespace-nowrap overflow-hidden text-ellipsis"
                                                                        title={`${c.tutor} • ${c.hours}h${c.role ? ` • ${c.role}` : ""}`}
                                                                    >
                                                                        {c.tutor} {c.hours}h
                                                                    </span>
                                                                ))}
                                                                {items.length > 2 && (
                                                                    <span className="text-[10px] text-gray-500">+{items.length - 2} more</span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span>—</span>
                                                        )}
                                                    </button>
                                                </Tooltip>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                <span className="inline-flex items-center gap-2">
                    <span className="rounded-md bg-indigo-600/10 px-1.5 py-0.5 text-[10px] text-indigo-700">Tutor</span>
                    Allocated staff
                </span>
                <span>•</span>
                <span>Hover for details • Click to open your edit flow</span>
            </div>
        </div>
    );
}
