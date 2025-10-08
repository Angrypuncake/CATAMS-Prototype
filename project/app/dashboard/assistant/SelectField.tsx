import React from "react";

interface SelectFieldProps {
  value: string;
  label: string;
  options: string[];
  onChange: (value: string) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({
  value,
  label,
  options,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-700">{label}:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
