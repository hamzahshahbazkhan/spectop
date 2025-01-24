import React from "react";
import Toggle from "./ui/Toggle";

interface ToggleProps {
  comparison: Record<string, any>;
}

function ToggleCard({ comparison }: ToggleProps) {
  return (
    <div className="mt-2 w-full">
      {comparison &&
        Object.entries(comparison).map(([key, value]) => (
          <Toggle key={key} label={key} value={value} />
        ))}
    </div>
  );
}

export default ToggleCard;
