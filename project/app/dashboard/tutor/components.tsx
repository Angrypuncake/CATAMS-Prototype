import React, { ReactNode } from "react";

type StyledBoxProps = {
  children: ReactNode;
};

const StyledBox: React.FC<StyledBoxProps> = ({ children }) => (
  <div className="w-full border shadow-md bg-white border-black rounded-lg p-6 my-5 mx-0">
    {children}
  </div>
);

export default StyledBox;
