"use client";
import React from "react";

/**
 * CATAMS Navigation Bar (USYD-style, minimal)
 * - Blue bar: logo (left) + uppercase white title (right) — e.g., CATAMS / SYSTEM ADMIN
 * - Gold bar: NO menus — right side shows actions (e.g., HELP, Logout)
 * - Tailwind-only, accessible, responsive
 *
 * NOTE: If you don't pass logoSrc, it defaults to "/usyd_logo.png" (from /public).
 */

export type NavAction = {
    label: string;
    href?: string;
    onClick?: () => void;
    ariaLabel?: string;
};

export interface CatamsNavProps {
    /** URL or path to the logo (optional). Defaults to "/usyd_logo.png". */
    logoSrc?: string;
    /** Right-aligned title on the blue bar (e.g., "CATAMS", "SYSTEM ADMIN") */
    rightTitle: string;
    /** Right-side buttons on the gold bar (e.g., [{label: "HELP"}, {label: "Logout"}]) */
    actions?: NavAction[];
    /** Container width class; defaults to max-w-6xl */
    maxWidthClass?: string;
    className?: string;
    /** Optional alt text for the logo */
    logoAlt?: string;
}

function cx(...xs: Array<string | false | null | undefined>) {
    return xs.filter(Boolean).join(" ");
}

function Action({ a }: { a: NavAction }) {
    const base =
        "inline-flex items-center rounded-md bg-white px-3 py-1.5 text-sm " +
        "font-medium text-[#0b3a74] shadow-sm hover:bg-gray-50 " +
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b3a74]";
    if (a.href) {
        return (
            <a href={a.href} aria-label={a.ariaLabel || a.label} className={base} onClick={a.onClick}>
                {a.label}
            </a>
        );
    }
    return (
        <button type="button" aria-label={a.ariaLabel || a.label} className={base} onClick={a.onClick}>
            {a.label}
        </button>
    );
}

export default function CatamsNav({
    logoSrc,
    rightTitle,
    actions = [],
    maxWidthClass = "max-w-6xl",
    className,
    logoAlt = "CATAMS",
}: CatamsNavProps) {
    // If no logoSrc provided, default to /usyd_logo.png under /public
    // If you use a basePath and want to serve static assets under it,
    // you can prefix via NEXT_PUBLIC_BASE_PATH if you like.
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const computedLogoSrc = `${basePath}${logoSrc ?? "/usyd_logo.png"}`;

    return (
        <header className={cx("w-full shadow-sm", className)}>
            {/* Blue top bar */}
            <div className="bg-[#003366]">
                <div className={cx(maxWidthClass, "mx-auto flex items-center justify-between px-4 py-3 gap-4")}>
                    <img src={computedLogoSrc} alt={logoAlt} className="h-10 w-auto select-none" />
                    <div className="text-white text-sm sm:text-base md:text-lg font-semibold tracking-wide uppercase">
                        {rightTitle}
                    </div>
                </div>
            </div>

            {/* Gold action bar (no menus) */}
            <div className="bg-[#f0b429]">
                <div className={cx(maxWidthClass, "mx-auto px-4 py-2 flex items-center justify-end gap-2")}>
                    {actions.map((a) => (
                        <Action key={a.label} a={a} />
                    ))}
                </div>
            </div>
        </header>
    );
}
