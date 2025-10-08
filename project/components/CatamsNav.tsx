"use client";

import React from "react";

export type NavAction = {
    label: string;
    href?: string;
    onClick?: () => void;
};

export interface CatamsNavProps {
    logoSrc: string;
    rightTitle: string;
    actions?: NavAction[];
    /** Keeps content neat inside the blue/gold bars */
    maxWidthClass?: string; // e.g. "max-w-screen-2xl"
    /** Exact side gap in cm for the whole navbar block (default 1cm) */
    edgeGapCm?: number;
    /** Visual scale for the logo (does not affect bar height). 1 = normal */
    logoScale?: number;
    className?: string;
}

function cx(...xs: Array<string | false | null | undefined>) {
    return xs.filter(Boolean).join(" ");
}

function Action({ a }: { a: NavAction }) {
    const cls =
        "inline-flex items-center rounded-md bg-white px-3 py-1.5 text-sm font-medium text-[#0b3a74] shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b3a74]";
    if (a.href) {
        return (
            <a className={cls} href={a.href} onClick={a.onClick}>
                {a.label}
            </a>
        );
    }
    return (
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
    edgeGapCm = 1,
    logoScale = 1.25, // bump this up or down to taste
    className,
}: CatamsNavProps) {
    // Exact rectangle with e.g. 1cm gap on both sides
    const outerStyle: React.CSSProperties = {
        width: `min(100%, calc(100vw - ${edgeGapCm * 2}cm))`,
        marginLeft: "auto",
        marginRight: "auto",
    };

    return (
        <header className={cx("shadow-sm", className)} style={outerStyle}>
            {/* Blue bar */}
            <div className="bg-[#003366]">
                <div
                    className={cx(
                        maxWidthClass,
                        // keep bar compact; let the logo scale visually without affecting height
                        "mx-auto flex items-center justify-between px-4 py-3 gap-4 overflow-visible"
                    )}
                >
                    {/* Fixed-height wrapper; scaled image inside doesn’t change layout height */}
                    <div className="h-10 flex items-center overflow-visible">
                        <img
                            src={logoSrc}
                            alt="University of Sydney"
                            className="h-10 w-auto origin-left select-none"
                            style={{
                                transform: `scale(${logoScale})`,
                                transformOrigin: "left center",
                            }}
                        />
                    </div>

                    <div className="text-white text-sm sm:text-base md:text-lg font-semibold tracking-wide uppercase">
                        {rightTitle}
                    </div>
                </div>
            </div>

            {/* Gold bar (right-aligned actions only) */}
            <div className="bg-[#f0b429]">
                <div
                    className={cx(
                        maxWidthClass,
                        "mx-auto px-4 py-2 flex items-center justify-end gap-2"
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
