"use client";

import { useState, useEffect, useCallback } from "react";
import type { Customer } from "@/types/customer";
import { loadCustomers, saveCustomers } from "@/lib/storage";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingSample, setIsUsingSample] = useState(true);

  useEffect(() => {
    const stored = loadCustomers();
    setCustomers(stored);
    setIsUsingSample(
      typeof window !== "undefined" &&
        !localStorage.getItem("cdp-customer-data")
    );
    setIsLoading(false);
  }, []);

  const updateCustomers = useCallback((newCustomers: Customer[]) => {
    setCustomers(newCustomers);
    saveCustomers(newCustomers);
    setIsUsingSample(false);
  }, []);

  const resetToSample = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cdp-customer-data");
    }
    const fresh = loadCustomers();
    setCustomers(fresh);
    setIsUsingSample(true);
  }, []);

  return {
    customers,
    isLoading,
    isUsingSample,
    updateCustomers,
    resetToSample,
    setCustomers: updateCustomers,
  };
}
