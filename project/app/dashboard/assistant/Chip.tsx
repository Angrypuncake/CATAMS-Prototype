import React from "react";

interface ChipProps {
  label: string;
  variant?: "filled" | "outlined";
  color?: "success" | "warning" | "default";
  size?: "small" | "medium";
  className?: string;
}

const Chip: React.FC<ChipProps> = ({
  label,
  variant = "filled",
  color = "default",
  size = "medium",
  className = "",
}) => {
  const sizeClasses =
    size === "small" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  const colorClasses: Record<string, string> = {
    success:
      variant === "outlined"
        ? "border border-green-500 text-green-700 bg-white"
        : "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    default: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${colorClasses[color]} ${className}`}
    >
      {label}
    </span>
  );
};

export default Chip;
