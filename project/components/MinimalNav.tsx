"use client";
import React from "react";

type Action = { label: string; href?: string; onClick?: () => void };

interface Props {
    actions?: Action[];
    rightTitle?: string;
    edgeGapCm?: number;
    maxWidthClass?: string;
    logoSrc?: string;
    showOrangeAccent?: boolean;
}

const BLACK = "#000";
const GREY = "#E5E7EB";
const ORANGE = "#F97316";

function cx(...xs: Array<string | false | null | undefined>) {
    return xs.filter(Boolean).join(" ");
}

const MinimalNav: React.FC<Props> = ({
    actions = [{ label: "HELP", href: "/help" }],
    rightTitle = "CATAMS",
    edgeGapCm = 0,
    maxWidthClass = "max-w-screen-2xl",
    logoSrc = "/usyd_logo_white.png",
    showOrangeAccent = true,
}) => {
    const inlineGap =
        edgeGapCm > 0
            ? { width: `calc(100% - ${edgeGapCm * 2}cm)`, marginInline: `${edgeGapCm}cm` }
            : undefined;

    return (
        <header className="w-full">
            {/* thin black strip */}
            <div className="w-full h-[6px]" style={{ backgroundColor: BLACK }} />

            {/* white bar */}
            <div className="bg-white">
                <div
                    style={inlineGap}
                    className={cx(
                        "mx-auto w-full",
                        maxWidthClass,
                        "flex items-center justify-between px-4 py-2 sm:py-3"
                    )}
                >
                    {/* left: logo */}
                    <div className="flex items-center gap-3">
                        <img
                            src={logoSrc}
                            alt="University of Sydney"
                            className="block h-7 sm:h-9 w-auto max-w-[50vw] object-contain"
                            draggable={false}
                        />
                        <span className="hidden sm:block h-7 w-px bg-black/30 ml-1" />
                    </div>

                    {/* right: actions (left) then title (far right) */}
                    <div className="flex items-center">
                        {/* actions with extra right gap -> shifts them left */}
                        <nav className="flex items-center gap-2 sm:gap-3 mr-4 sm:mr-6">
                            {actions.map((a) =>
                                a.href ? (
                                    <a
                                        key={a.label}
                                        href={a.href}
                                        onClick={a.onClick}
                                        className="inline-flex items-center rounded-full border border-black/25 px-2.5 py-1 text-xs sm:text-sm font-medium leading-none text-black hover:bg-black/5"
                                    >
                                        {a.label}
                                    </a>
                                ) : (
                                    <button
                                        key={a.label}
                                        onClick={a.onClick}
                                        className="inline-flex items-center rounded-full border border-black/25 px-2.5 py-1 text-xs sm:text-sm font-medium leading-none text-black hover:bg-black/5"
                                    >
                                        {a.label}
                                    </button>
                                )
                            )}
                        </nav>

                        {/* heavier CATAMS */}
                        {rightTitle ? (
                            <div className="text-black uppercase tracking-wider font-extrabold text-sm sm:text-base">
                                {rightTitle}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="h-px w-full" style={{ backgroundColor: GREY }} />
            {showOrangeAccent && <div className="h-[2px] w-full" style={{ backgroundColor: ORANGE }} />}
        </header>
    );
};

export default MinimalNav;
