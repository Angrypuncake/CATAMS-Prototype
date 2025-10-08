"use client";
import React from "react";

export type NavAction = {
    label: string;
    href?: string;
    onClick?: () => void;
};

export interface CatamsNavProps {
    logoSrc: string;
    rightTitle: string;                // CATAMS / SYSTEM ADMIN etc.
    actions?: NavAction[];             // e.g., [{label:"HELP"}, {label:"Logout"}]
    maxWidthClass?: string;            // e.g., "max-w-screen-2xl"
    className?: string;
}

function cx(...xs: Array<string | false | null | undefined>) {
    return xs.filter(Boolean).join(" ");
}

function Action({ a }: { a: NavAction }) {
    const cls =
        "inline-flex items-center rounded-md bg-white px-3 py-1.5 text-sm font-medium " +
        "text-[#0b3a74] shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 " +
        "focus:ring-offset-2 focus:ring-[#0b3a74]";
    return a.href ? (
        <a className={cls} href={a.href} onClick={a.onClick}>
            {a.label}
        </a>
    ) : (
        <button className={cls} onClick={a.onClick}>
            {a.label}
        </button>
    );
}

export default function CatamsNav({
    logoSrc,
    rightTitle,
    actions = [],
    maxWidthClass = "max-w-screen-2xl",
    className,
}: CatamsNavProps) {
    // One place to control the bar height for both rows and the logo
    const BAR_H = "h-12"; // ~48px. Change to h-10 / h-14 if you ever want thinner/thicker.

    return (
        <header className={cx("w-full shadow-sm", className)}>
            {/* Top blue bar (logo bleeds to the far left) */}
            <div className={cx("relative bg-[#003366]", BAR_H)}>
                {/* Absolutely positioned logo: same height as the bars, flush to viewport left */}
                <img
                    src={logoSrc}
                    alt="University of Sydney"
                    className={cx(
                        "absolute left-0 top-0 w-auto select-none pointer-events-none",
                        BAR_H
                    )}
                />

                {/* Right title sits inside your max-width container with side margins */}
                <div
                    className={cx(
                        maxWidthClass,
                        "mx-auto flex items-center justify-end px-4",
                        BAR_H
                    )}
                >
                    <div className="text-white text-sm sm:text-base md:text-lg font-semibold tracking-wide uppercase">
                        {rightTitle}
                    </div>
                </div>
            </div>

            {/* Gold bar (same height) */}
            <div className={cx("bg-[#f0b429]", BAR_H)}>
                <div
                    className={cx(
                        maxWidthClass,
                        "mx-auto flex items-center justify-end gap-2 px-4",
                        BAR_H
                    )}
                >
                    {actions.map((a) => (
                        <Action key={a.label} a={a} />
                    ))}
                </div>
            </div>
        </header>
    );
}
