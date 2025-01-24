"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface ProductContextType {
  firstLink: string;
  setFirstLink: React.Dispatch<React.SetStateAction<string>>;
  secondLink: string;
  setSecondLink: React.Dispatch<React.SetStateAction<string>>;
  firstProduct: string | null;
  setFirstProduct: React.Dispatch<React.SetStateAction<string | null>>;
  secondProduct: string | null;
  setSecondProduct: React.Dispatch<React.SetStateAction<string | null>>;
  preferenceTags: string;
  setPreferenceTags: React.Dispatch<React.SetStateAction<string>>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [firstLink, setFirstLink] = useState<string>("");
  const [secondLink, setSecondLink] = useState<string>("");
  const [firstProduct, setFirstProduct] = useState<string | null>(null);
  const [secondProduct, setSecondProduct] = useState<string | null>(null);
  const [preferenceTags, setPreferenceTags] = useState<string>("");

  return (
    <ProductContext.Provider
      value={{
        firstLink,
        setFirstLink,
        secondLink,
        setSecondLink,
        firstProduct,
        setFirstProduct,
        secondProduct,
        setSecondProduct,
        preferenceTags,
        setPreferenceTags,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
}
