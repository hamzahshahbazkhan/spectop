"use client";
import Warning from "@/components/ui/Warning";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useProductContext } from "@/context/ProductContext";
import Wrapper from "@/components/ui/Wrapper";
import ToggleCard from "@/components/ToggleCard";
import Loader from "@/components/ui/Loader";

interface Laptop {
  img?: string;
  title?: string;
  price?: string;
  rating?: string;
  [key: string]: string | object | undefined;
}

const LaptopCard = ({
  laptops,
  firstLaptop,
  secondLaptop,
}: {
  laptops: Laptop[];
  firstLaptop: Laptop;
  secondLaptop: Laptop;
}) => (
  <Wrapper>
    <div className="overflow-x-auto w-full max-w-full">
      <table className="w-full border-collapse table-auto">
        <thead>
          <tr>
            <th className="border-2 border-primary p-2 text-left">
              Specification
            </th>
            <th className="border-2 border-primary p-2 text-left">
              First Laptop
            </th>
            <th className="border-2 border-primary p-2 text-left">
              Second Laptop
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-2 border-primary p-2 font-semibold">Image</td>
            <td className="border-2 border-primary p-2">
              {firstLaptop.img ? (
                <img
                  src={firstLaptop.img}
                  alt="First laptop"
                  className="w-36 h-auto mx-auto"
                />
              ) : (
                "N/A"
              )}
            </td>
            <td className="border-2 border-primary p-2">
              {secondLaptop.img ? (
                <img
                  src={secondLaptop.img}
                  alt="Second laptop"
                  className="w-36 h-auto mx-auto"
                />
              ) : (
                "N/A"
              )}
            </td>
          </tr>
          <tr>
            <td className="border-2 border-primary p-2 font-semibold">
              Product
            </td>
            <td className="border-2 border-primary p-2">
              {firstLaptop.title || "N/A"}
            </td>
            <td className="border-2 border-primary p-2">
              {secondLaptop.title || "N/A"}
            </td>
          </tr>
          <tr>
            <td className="border-2 border-primary p-2 font-semibold">Price</td>
            <td className="border-2 border-primary p-2">
              {firstLaptop.price || "N/A"}
            </td>
            <td className="border-2 border-primary p-2">
              {secondLaptop.price || "N/A"}
            </td>
          </tr>
          <tr>
            <td className="border-2 border-primary p-2 font-semibold">
              Rating
            </td>
            <td className="border-2 border-primary p-2">
              {firstLaptop.rating || "N/A"}
            </td>
            <td className="border-2 border-primary p-2">
              {secondLaptop.rating || "N/A"}
            </td>
          </tr>
          {Object.keys(laptops[0] || {}).map((key) => (
            <tr key={key}>
              <td className="border-2 border-primary p-2 font-semibold">
                {key}
              </td>
              <td className="border-2 border-primary p-2">
                {typeof laptops[0][key] === "object"
                  ? JSON.stringify(laptops[0][key])
                  : laptops[0][key] || "N/A"}
              </td>
              <td className="border-2 border-primary p-2">
                {typeof laptops[1]?.[key] === "object"
                  ? JSON.stringify(laptops[1]?.[key])
                  : laptops[1]?.[key] || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Wrapper>
);

function Compare() {
  const { firstProduct, secondProduct, preferenceTags } = useProductContext();
  const [error, setError] = useState(false);
  const [verdict, setVerdict] = useState<{
    Laptops: Laptop[];
    Comparison: Record<string, string | object>;
    Verdict: string;
  }>({
    Laptops: [],
    Comparison: {},
    Verdict: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        if (!firstProduct || !secondProduct) {
          setError(true);
          setIsLoading(false);
          return;
        }

        console.log(firstProduct);
        console.log(secondProduct);
        const response = await axios.post("/api/compare-laptops", {
          firstProduct,
          secondProduct,
          preferenceTags,
        });
        console.log(response);
        const cleanedString = response.data.result
          .replace(/```json\s*/g, "")
          .replace(/```/g, "")
          .replace(/\\"/g, '"')
          .trim();
        console.log(cleanedString);
        setVerdict(await JSON.parse(cleanedString));
        setIsLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError(true);
        setIsLoading(false);
      }
    }
    fetchData();
  }, [firstProduct, secondProduct]);

  return (
    <div className="container mx-auto p-4">
      {isLoading ? (
        <div className="container mx-auto p-4 flex justify-center items-center mt-56">
          <Loader />
        </div>
      ) : error ? (
        <div className="container mx-auto p-4 flex justify-center items-center mt-56">
          <Warning warningText="Error comparing the Laptop" />
        </div>
      ) : (
        <div>
          <div className="my-4">
            <h2 className="text-2xl md:text-4xl text-text">Verdict:</h2>
            <p className="text-base md:text-lg text-text mt-2 ">
              {verdict.Verdict}
            </p>
          </div>

          <div className="my-8">
            <h2 className="text-2xl md:text-4xl text-text">Specifications:</h2>
            <LaptopCard
              laptops={verdict.Laptops}
              firstLaptop={{
                img: firstProduct?.img || "",
                title: firstProduct?.title || "",
                price: firstProduct?.price || "",
                rating: firstProduct?.rating || "",
              }}
              secondLaptop={{
                img: secondProduct?.img || "",
                title: secondProduct?.title || "",
                price: secondProduct?.price || "",
                rating: secondProduct?.rating || "",
              }}
            />
          </div>

          <div className="my-8">
            <h2 className="text-2xl md:text-4xl text-text">Comparison:</h2>
            <ToggleCard
              comparison={Object.fromEntries(
                Object.entries(verdict.Comparison).map(([key, value]) => [
                  key,
                  typeof value === "object" ? JSON.stringify(value) : value,
                ])
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Compare;
