"use client";
import React, { useEffect, useState } from "react";
// use the same relative style as other admin pages
import {
    TimelineView,
    buildWeeksRange,
    type ActivityRow,
    type CellAllocation,
    type WeekDef,
} from "../../../../components/TimelineView"; // adjust if your components path differs
// If you actually placed TimelineView at project/components, use: "../../../../components/TimelineView"

const weeks: WeekDef[] = buildWeeksRange(-6, 13, "S1");

// Demo data — NOTE: week keys are QUOTED strings.
const demoActivities: ActivityRow[] = [
    {
        id: "a1",
        name: "COMP2022 – Tutorial 01",
        activityType: "Tutorial",
        paycode: "LAB2",
        allocations: {
            "W-1": { tutor: "Ali", hours: 2, role: "Tutor" },
            "W0": { tutor: "Ali", hours: 2, role: "Tutor", notes: "Room 403" },
            "W1": { tutor: "Ravi", hours: 2, role: "Tutor" },
            "W3": { tutor: "Ravi", hours: 2, role: "Tutor" },
            "W5": { tutor: "Mina", hours: 2, role: "Tutor" },
        },
    },
    {
        id: "a2",
        name: "ELEC5619 – Lecture A",
        activityType: "Lecture",
        paycode: "LAB1",
        allocations: {
            "W0": { tutor: "Nazanin", hours: 2, role: "Lecturer" },
            "W1": { tutor: "Nazanin", hours: 2, role: "Lecturer" },
            "W2": { tutor: "Nazanin", hours: 2, role: "Lecturer" },
            "W3": { tutor: "Nazanin", hours: 2, role: "Lecturer" },
        },
    },
    {
        id: "a3",
        name: "COMP3419 – Lab 02",
        activityType: "Lab",
        paycode: "LAB4",
        flexTotal: 6,
        allocations: {
            "W1": { tutor: "Kai", hours: 3, role: "Lab" },
            "W2": { tutor: "Kai", hours: 3, role: "Lab" },
        },
    },
];

export default function AllocationsTimelinePage() {
    const [activities, setActivities] = useState<ActivityRow[]>(demoActivities);
    const [lastClick, setLastClick] = useState<string | null>(null);

    useEffect(() => {
        // hydrate from API later if you want
    }, []);

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">All Allocations — Timeline View</h1>
                <a href="/admin/allocations" className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">
                    ← Back to table view
                </a>
            </div>

            <div className="rounded-2xl border bg-white p-4 shadow">
                <TimelineView
                    title="Unit of Study – Timeline"
                    weeks={weeks}
                    activities={activities}
                    extraColumns={[
                        {
                            key: "staffCount",
                            header: "Staff",
                            render: (a) => {
                                const unique = new Set(
                                    Object.values(a.allocations)
                                        .filter(Boolean)
                                        .map((v) => (v as CellAllocation).tutor),
                                );
                                return <span className="text-xs">{unique.size}</span>;
                            },
                        },
                        {
                            key: "hoursTotal",
                            header: "Hours",
                            render: (a) => {
                                const sum = Object.values(a.allocations)
                                    .filter(Boolean)
                                    .reduce((acc, v) => acc + ((v as CellAllocation).hours || 0), 0);
                                return <span className="text-xs">{sum}</span>;
                            },
                        },
                    ]}
                    onCellClick={({ activity, week, cell }) => {
                        setLastClick(
                            `${activity.name} · ${week.label} · ${cell ? `${cell.tutor} ${cell.hours}h` : "empty"}`,
                        );
                    }}
                />
            </div>

            <div className="text-sm text-gray-600">
                <strong>Last click:</strong> {lastClick ?? "—"}
            </div>
        </div>
    );
}
