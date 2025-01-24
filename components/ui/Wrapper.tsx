import React from "react";

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-text border-primary border-2 border-b-4 p-2 m-2 w-full">
      {children}
    </div>
  );
}

export default Wrapper;
