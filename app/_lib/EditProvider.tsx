'use client';
import React, { createContext, useContext, useState } from 'react';

import { Photo, VariantForm } from '@/app/_lib/definitions';
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

// Define your EditProductState type
type EditProductState = ProductState;

// Create your context
export const EditStateContext = createContext<
  | {
      state: EditProductState;
      updateState: (newState: Partial<EditProductState>) => void;
    }
  | undefined
>(undefined);

// Create your EditProvider component
export function EditProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: ProductState;
}) {
  const [state, setState] = useState<EditProductState>(initialData);

  // Function to update the state
  const updateState = (newState: Partial<EditProductState>) => {
    setState((prevState) => ({ ...prevState, ...newState }));
  };

  return (
    <EditStateContext.Provider value={{ state, updateState }}>
      {children}
    </EditStateContext.Provider>
  );
}

// Custom hook to use the context
export function useEditState() {
  const context = useContext(EditStateContext);
  if (!context) {
    throw new Error('useEditState must be used within the EditProvider');
  }
  return context;
}
