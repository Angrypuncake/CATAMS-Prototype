"use client";
import React, { useMemo } from "react";
import Tooltip from "@mui/material/Tooltip";

/** ===== Types ===== */
export type WeekKey = string;
export interface WeekDef { key: WeekKey; label: string; }
export interface CellAllocation { tutor: string; hours: number; role?: string; notes?: string; }
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
    key: string; header: string; width?: number | string; render: (activity: A) => React.ReactNode;
}
export interface TimelineViewProps<A extends ActivityRow = ActivityRow> {
    title?: string;
    weeks: WeekDef[];
    activities: A[];
    extraColumns?: ExtraColumn<A>[];
    stickyHeader?: boolean;
    compact?: boolean;
    onCellClick?: (args: { activity: A; week: WeekDef; cell?: CellValue }) => void;
}

/** ===== Utils ===== */
const cx = (...cls: Array<string | false | undefined>) => cls.filter(Boolean).join(" ");
export function buildWeeksRange(start: number, end: number, termLabel = "S1"): WeekDef[] {
    const out: WeekDef[] = [];
    for (let i = start; i <= end; i++) out.push({ key: `W${i}`, label: `${termLabel} Week ${i}` });
    return out;
}

/** ===== Component ===== */
export function TimelineView<A extends ActivityRow = ActivityRow>({
    title = "Timeline",
    weeks,
    activities,
    extraColumns = [],
    stickyHeader = true,
    compact,
    onCellClick,
}: TimelineViewProps<A>) {
    const headerHeight = compact ? "h-10" : "h-12";
    const rowHeight = compact ? "h-10" : "h-12";

    const weekCols = useMemo(
        () =>
            weeks.map((w) => (
                <div
                    key={w.key}
                    className={cx(
                        "min-w-[6rem] border-l border-gray-200 flex items-center justify-center text-xs font-medium",
                        headerHeight
                    )}
                    title={w.label}
                >
                    {w.label}
                </div>
            )),
        [weeks, headerHeight]
    );

    return (
        <div className="w-full">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{title}</h2>
                <div className="text-xs text-gray-500">Rows: activities • Columns: weeks • Hover for details</div>
            </div>

            <div
                className="relative overflow-auto rounded-2xl border border-gray-200 shadow-sm"
                role="grid"
                aria-label={`${title} grid`}
            >
                {/* Header */}
                <div
                    className={cx("grid bg-gray-50/95", stickyHeader && "sticky top-0 z-10")}
                    style={{
                        gridTemplateColumns: `minmax(16rem,1.2fr) ${extraColumns
                            .map(() => "minmax(8rem,0.6fr)")
                            .join(" ")} ${weeks.map(() => "minmax(6rem,0.6fr)").join(" ")}`,
                    }}
                >
                    <div className={cx("border-b border-gray-200 px-4 flex items-center text-xs font-semibold", headerHeight)}>
                        Activity
                    </div>
                    {extraColumns.map((col) => (
                        <div
                            key={col.key}
                            className={cx("border-b border-gray-200 px-3 flex items-center text-xs font-semibold", headerHeight)}
                            style={{ width: col.width }}
                        >
                            {col.header}
                        </div>
                    ))}
                    {weekCols}
                </div>

                {/* Body */}
                <div>
                    {activities.map((act) => (
                        <div
                            key={act.id}
                            data-row
                            className="grid even:bg-gray-50/40 hover:bg-indigo-50/40 transition-colors"
                            style={{
                                gridTemplateColumns: `minmax(16rem,1.2fr) ${extraColumns
                                    .map(() => "minmax(8rem,0.6fr)")
                                    .join(" ")} ${weeks.map(() => "minmax(6rem,0.6fr)").join(" ")}`,
                            }}
                        >
                            {/* Activity stub */}
                            <div className={cx("border-t border-gray-200 px-4 flex items-center gap-3 text-sm", rowHeight)}>
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
                                <div key={col.key} className={cx("border-t border-gray-200 px-3 flex items-center text-xs", rowHeight)}>
                                    {col.render(act as A)}
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
                                        <div className="text-xs">
                                            {items.map((c, i) => (
                                                <div key={i} className="mb-0.5">
                                                    <strong>{c.tutor}</strong> — {c.hours}h {c.role ? `• ${c.role}` : ""}
                                                    {c.notes ? <div className="text-[10px] text-gray-500">{c.notes}</div> : null}
                                                </div>
                                            ))}
                                            <div className="mt-1 text-[10px] text-gray-500">
                                                {act.name} — {w.label}
                                            </div>
                                        </div>
                                    );

                                return (
                                    <Tooltip key={`${act.id}_${w.key}`} title={tooltip} arrow placement="top" disableInteractive>
                                        <button
                                            data-grid-cell="1"
                                            className={cx(
                                                "w-full h-full border-t border-l border-gray-200 px-2 text-xs text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                                                rowHeight,
                                                items.length ? "font-medium text-gray-900" : "text-gray-400"
                                            )}
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
                                                    {items.length > 2 && <span className="text-[10px]">+{items.length - 2} more</span>}
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
    );
}
