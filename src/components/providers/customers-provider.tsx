"use client";

import { createContext, useContext } from "react";
import { useCustomers } from "@/hooks/use-customers";
import type { Customer } from "@/types/customer";

interface CustomersContextValue {
  customers: Customer[];
  isLoading: boolean;
  isUsingSample: boolean;
  updateCustomers: (customers: Customer[]) => void;
  resetToSample: () => void;
}

const CustomersContext = createContext<CustomersContextValue | null>(null);

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const value = useCustomers();
  return (
    <CustomersContext.Provider value={value}>
      {children}
    </CustomersContext.Provider>
  );
}

export function useCustomersContext() {
  const context = useContext(CustomersContext);
  if (!context) {
    throw new Error("useCustomersContext must be used within CustomersProvider");
  }
  return context;
}
