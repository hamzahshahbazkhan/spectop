"use client";
import React from "react";
import { FadeLoader } from "react-spinners";

const Loader = () => {
  return (
    <div>
      {/* <ClipLoader size={150} /> */}
      <FadeLoader color="#E9E3D7" />
    </div>
  );
};

export default Loader;
