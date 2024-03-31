'use client';
import React, { createContext, useContext, useState } from 'react';
import { Photo, VariantForm, productFormType } from '@/app/_lib/definitions';
// Define your ProductState type

type ProductState = {
  firstObject: {
    properties: { [key: string]: string[] };
    title: string;
    category: string;
  };
  photoDump: Photo[];
  secondObject: VariantForm | null;
};

// Create your context
export const AppStateContext = createContext<
  | {
      state: ProductState;
      updateState: (newState: Partial<ProductState>) => void;
    }
  | undefined
>(undefined);

// Create your AppProvider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProductState>({
    firstObject: { properties: {}, title: '', category: '' },
    secondObject: null,
    photoDump: [],
  });

  // Function to update the state
  const updateState = (newState: Partial<ProductState>) => {
    setState((prevState) => ({ ...prevState, ...newState }));
  };

  return (
    <AppStateContext.Provider value={{ state, updateState }}>
      {children}
    </AppStateContext.Provider>
  );
}

// Custom hook to use the context
export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within the AppProvider');
  }
  return context;
}

// Your layout component
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AppProvider>{children}</AppProvider>
    </>
  );
};

export default Layout;
