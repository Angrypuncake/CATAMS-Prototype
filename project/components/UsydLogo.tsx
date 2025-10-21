"use client";
import React from "react";

/**
 * UsydLogo: prefers a white logo SVG if present,
 * otherwise falls back to /usyd_logo.png and turns it white using CSS filters.
 *
 * Put a real white wordmark at: /public/usyd_logo_white.svg  (recommended)
 * Otherwise we reuse your existing /public/usyd_logo.png with a white filter.
 */
interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
    white?: boolean;
}

const UsydLogo: React.FC<Props> = ({ white = false, className, ...imgProps }) => {
    const [src, setSrc] = React.useState<string>(
        white ? "/usyd_logo_white.svg" : "/usyd_logo.png"
    );

    const onError = React.useCallback(() => {
        // If white asset is missing, fallback to colored PNG
        if (src !== "/usyd_logo.png") {
            setSrc("/usyd_logo.png");
        }
    }, [src]);

    return (
        <img
            src={src}
            onError={onError}
            alt="University of Sydney"
            className={
                white
                    ? // make sure fallback colored logo becomes white on the navy background
                    `object-contain ${className ?? ""} [filter:brightness(0)_invert(1)]`
                    : `object-contain ${className ?? ""}`
            }
            {...imgProps}
        />
    );
};

export default UsydLogo;
