"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useProductContext } from "@/context/ProductContext";
import { Input } from "./ui/Input";
import Button from "./ui/Button";
import Warning from "./ui/Warning";

function Form() {
  const router = useRouter();
  const {
    firstLink,
    secondLink,
    preferenceTags,
    setFirstLink,
    setSecondLink,
    setFirstProduct,
    setSecondProduct,
    setPreferenceTags,
  } = useProductContext();
  const [firstUrl, setFirstUrl] = useState(firstLink || "");
  const [secondUrl, setSecondUrl] = useState(secondLink || "");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFirstUrl(firstLink);
    setSecondUrl(secondLink);
    setTags(preferenceTags);
  }, []);

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post("/api/fetch-laptop-data", {
        firstUrl,
        secondUrl,
      });
      console.log("HELLO", response);
      if (response.data.error) {
        setError(response.data.error);
        return;
      }

      const { firstProduct, secondProduct } = response.data;
      setFirstProduct(firstProduct);
      setFirstLink(firstUrl);
      setSecondLink(secondUrl);
      setSecondProduct(secondProduct);
      setPreferenceTags(tags);
      router.push("/compare");
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.error || "Failed to fetch product details"
        );
      } else {
        setError("An unexpected error occurred");
      }
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={submitForm} className="w-full p-6 mx-auto">
      <div className="space-y-4">
        <div>
          <label className="text-text font-medium block mb-2">
            First Laptop:
          </label>
          <Input
            type="url"
            value={firstUrl}
            onInput={(e: React.FormEvent<HTMLInputElement>) =>
              setFirstUrl((e.target as HTMLInputElement).value)
            }
            placeholder="Enter the Amazon or Flipkart URL"
            className="w-full"
            // disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-text font-medium block mb-2">
            Second Laptop:
          </label>
          <Input
            type="url"
            value={secondUrl}
            onInput={(e: React.FormEvent<HTMLInputElement>) =>
              setSecondUrl((e.target as HTMLInputElement).value)
            }
            placeholder="Enter the Amazon or Flipkart URL"
            className="w-full"
            // disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-text font-medium block mb-2">
            Enter your priorities/use cases:
          </label>
          <Input
            type="text"
            value={tags}
            onInput={(e: React.FormEvent<HTMLInputElement>) =>
              setTags((e.target as HTMLInputElement).value)
            }
            placeholder="eg: video editing, lightweight, value for money, portable, gaming"
            className="w-full"
            // disabled={isLoading}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          type="submit"
          label={isLoading ? "Loading..." : "Compare"}
          className="w-64"
          // disabled={isLoading}
        />
      </div>

      {error && <Warning warningText={error} />}
    </form>
  );
}

export default Form;
