import React from "react";

interface ButtonProps {
  className?: string;
  type?: "button" | "submit" | "reset" | undefined;
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

function Button({ className, label, onClick, type }: ButtonProps) {
  return (
    <div>
      <button
        type={type}
        className={`${className} p-2 text-md border-2 border-b-4 border-primary bg-secondary text-text hover:bg-background  `}
        onClick={onClick}
      >
        {label}
      </button>
    </div>
  );
}

export default Button;
