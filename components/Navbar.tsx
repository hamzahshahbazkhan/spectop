"use client ";

import React from "react";
import GithubIcon from "@/components/ui/GithubIcon";

function Navbar() {
  return (
    <div className="text-6xl pl-4 bg-background text-text ">
      <div className="flex justify-between">
        <a href="/">spectop</a>
        <a href="https://github.com/hamzahshahbazkhan/spectop">
          <GithubIcon />
        </a>
      </div>
    </div>
  );
}

export default Navbar;
