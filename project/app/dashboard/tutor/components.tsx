import React, { ReactNode } from "react";
import clsx from "clsx";

type StyledBoxProps = {
  children: ReactNode;
  accentColor?: string;
};

const StyledBox: React.FC<StyledBoxProps> = ({ children, accentColor }) => {
  return (
    <div
      className={clsx(
        "w-full shadow-md bg-white rounded-lg p-6 my-5 mx-0 border",
        accentColor ? `border-l-4 ${accentColor}` : "border-black"
      )}
    >
      {children}
    </div>
  );
};

export default StyledBox;
