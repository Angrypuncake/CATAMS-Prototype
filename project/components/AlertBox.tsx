import React from "react";

interface AlertBoxProps {
  children: React.ReactNode;
}

const AlertBox: React.FC<AlertBoxProps> = ({ children }) => {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800">
      {children}
    </div>
  );
};

export default AlertBox;
