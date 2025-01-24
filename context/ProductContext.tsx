"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface Laptop {
  img?: string;
  title?: string;
  price?: string;
  rating?: string;
}

interface ProductContextType {
  firstLink: string;
  setFirstLink: React.Dispatch<React.SetStateAction<string>>;
  secondLink: string;
  setSecondLink: React.Dispatch<React.SetStateAction<string>>;
  firstProduct: Laptop | null;
  setFirstProduct: React.Dispatch<React.SetStateAction<Laptop | null>>;
  secondProduct: Laptop | null;
  setSecondProduct: React.Dispatch<React.SetStateAction<Laptop | null>>;
  preferenceTags: string;
  setPreferenceTags: React.Dispatch<React.SetStateAction<string>>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [firstLink, setFirstLink] = useState<string>("");
  const [secondLink, setSecondLink] = useState<string>("");
  const [firstProduct, setFirstProduct] = useState<Laptop | null>(null);
  const [secondProduct, setSecondProduct] = useState<Laptop | null>(null);
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
