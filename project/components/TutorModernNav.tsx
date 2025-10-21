"use client";
import React from "react";
import UsydLogo from "./UsydLogo";

type Action = {
    label: string;
    href?: string;
    onClick?: () => void;
};

interface Props {
    titleRight?: string;          // e.g. "CATAMS" or "TUTOR"
    actions?: Action[];           // e.g. [{label:"HELP", href:"/help"}, {label:"Logout", onClick: ...}]
    edgeGapCm?: number;           // optional left/right gap in cm for this page only (default 0)
}

/** Color tokens (only for this page) */
const NAVY = "#0B3A74";  // deep USYD navy
const GOLD = "#EFB224";  // USYD gold

function cx(...xs: Array<string | false | null | undefined>) {
    return xs.filter(Boolean).join(" ");
}

/** A modern, two-row USYD bar:
 *  Row 1 (navy): white logo (left) | thin vertical divider | right title + actions on the same row
 *  Row 2 (gold): very thin strip, then a 1px black rule underneath
 */
const TutorModernNav: React.FC<Props> = ({
    titleRight = "CATAMS",
    actions = [],
    edgeGapCm = 0,
}) => {
    const inlineGap =
        edgeGapCm > 0
            ? { width: `calc(100% - ${edgeGapCm * 2}cm)`, marginInline: `${edgeGapCm}cm` }
            : undefined;

    return (
        <header>
            {/* Navy bar */}
            <div style={{ backgroundColor: NAVY }}>
                <div
                    style={inlineGap}
                    className={cx(
                        "mx-auto flex items-center justify-between px-4",
                        "py-2 sm:py-3"
                    )}
                >
                    {/* Left: white logo */}
                    <div className="flex items-center gap-3">
                        {/* Prefer white logo; fallback to white-filtered color logo */}
                        <UsydLogo white className="h-9 w-auto" />
                        <div className="hidden sm:block h-7 w-px bg-white/40" />
                    </div>

                    {/* Right: title and actions */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <span className="text-white font-semibold tracking-wide uppercase text-sm sm:text-base">
                            {titleRight}
                        </span>

                        {actions.map((a) =>
                            a.href ? (
                                <a
                                    key={a.label}
                                    href={a.href}
                                    onClick={a.onClick}
                                    className="rounded-md bg-white text-[#0B3A74] px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-gray-50"
                                >
                                    {a.label}
                                </a>
                            ) : (
                                <button
                                    key={a.label}
                                    onClick={a.onClick}
                                    className="rounded-md bg-white text-[#0B3A74] px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-gray-50"
                                >
                                    {a.label}
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Gold strip */}
            <div style={{ backgroundColor: GOLD }}>
                <div style={inlineGap} className="mx-auto h-2" />
            </div>

            {/* Thin black rule underneath */}
            <div className="h-px w-full bg-black" />
        </header>
    );
};

export default TutorModernNav;
