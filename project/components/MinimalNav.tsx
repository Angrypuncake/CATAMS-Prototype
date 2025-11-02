"use client";
import axios from "axios";
import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Button from "@mui/material/Button";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";

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
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = React.useCallback(async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [router]);

  const cleanedActions = React.useMemo(
    () => (actions ?? []).filter((a) => a.label.trim().toLowerCase() !== "logout"),
    [actions]
  );

  const inlineGap =
    edgeGapCm > 0
      ? {
          width: `calc(100% - ${edgeGapCm * 2}cm)`,
          marginInline: `${edgeGapCm}cm`,
        }
      : undefined;

  return (
    <header className="w-full">
      <div className="w-full h-[6px]" style={{ backgroundColor: BLACK }} />

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

          {/* right: actions + conditional Logout + title */}
          <div className="flex items-center">
            <nav className="flex items-center gap-2 sm:gap-3 mr-4 sm:mr-6">
              {cleanedActions.map((a) =>
                a.href ? (
                  <Button
                    key={a.label}
                    component={Link}
                    href={a.href}
                    onClick={a.onClick}
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 999, textTransform: "none" }}
                  >
                    {a.label}
                  </Button>
                ) : (
                  <Button
                    key={a.label}
                    onClick={a.onClick}
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 999, textTransform: "none" }}
                  >
                    {a.label}
                  </Button>
                )
              )}
              {!pathname?.startsWith("/portal/") && (
                <Button
                  component={Link}
                  href={"/portal"}
                  variant="outlined"
                  size="small"
                  endIcon={<HomeIcon />} // icon after text
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                  aria-label="Go back to portal"
                >
                  Portal
                </Button>
              )}
              {/* Always show Logout EXCEPT on /login; icon after text */}
              {!(pathname === "/login" || pathname?.startsWith("/login/")) && (
                <Button
                  onClick={handleLogout}
                  variant="outlined"
                  size="small"
                  endIcon={<LogoutIcon />} // icon after text
                  sx={{
                    borderRadius: 999,
                    fontWeight: 600,
                    textTransform: "none",
                  }}
                  aria-label="Log out"
                >
                  Sign-out
                </Button>
              )}
            </nav>

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
