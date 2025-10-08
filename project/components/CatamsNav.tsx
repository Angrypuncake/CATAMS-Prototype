"use client";

import React from "react";

/** Minimal USYD-style CATAMS Nav (no menus on gold bar) */
export type NavAction = {
    label: string;
    href?: string;
    onClick?: () => void;
};

export interface CatamsNavProps {
    /** Logo image path (e.g. /usyd_logo.png in /public) */
    logoSrc: string;

    /** Right-side title in the blue bar (e.g. "CATAMS", "SYSTEM ADMIN") */
    rightTitle: string;

    /** Right-side buttons on the gold bar (e.g. Help, Logout) */
    actions?: NavAction[];

    /**
     * Class applied to the *colored bars container*.
     * Use this to control side margins/width.  Examples:
     *  - "mx-auto max-w-6xl" (default)
     *  - "mx-[1cm]" (exactly 1cm gutters L/R)
     */
    containerClass?: string;

    /** Tailwind height class for the logo image (e.g. "h-12"). Default: h-12 */
    logoClass?: string;

    className?: string;
}

function cx(...xs: Array<string | false | null | undefined>) {
    return xs.filter(Boolean).join(" ");
}

function Action({ a }: { a: NavAction }) {
    const cls =
        "inline-flex items-center rounded-md bg-white px-3 py-1.5 text-sm font-medium text-[#0b3a74] shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b3a74]";
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
    containerClass = "mx-auto max-w-6xl",
    logoClass = "h-12",
    className,
}: CatamsNavProps) {
    return (
        <header className={cx("w-full", className)}>
            {/* Blue top bar (width/margins controlled by containerClass) */}
            <div className={cx("bg-[#003366]", containerClass)}>
                <div className="flex items-center justify-between px-4 py-3 gap-4">
                    <img
                        src={logoSrc}
                        alt="University of Sydney"
                        className={cx("w-auto select-none", logoClass)}
                    />
                    <div className="text-white text-base md:text-lg font-semibold tracking-wide uppercase">
                        {rightTitle}
                    </div>
                </div>
            </div>

            {/* Gold action bar (no menus) */}
            <div className={cx("bg-[#f0b429]", containerClass)}>
                <div className="px-4 py-2 flex items-center justify-end gap-2">
                    {actions.map((a) => (
                        <Action key={a.label} a={a} />
                    ))}
                </div>
            </div>
        </header>
    );
}
