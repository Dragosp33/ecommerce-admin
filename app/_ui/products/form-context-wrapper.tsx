'use client';
import { FunctionComponent, ComponentType, ReactNode } from 'react';
import { CategoryField } from '@/app/_lib/definitions'; // Import your CategoryField type
import { EditStateContext } from '@/app/_lib/EditProvider';
import {
  AppStateContext,
  ProductState,
} from '@/app/dashboard/products/create/layout';
import { FirstStepForm } from './form/first-step-form';
import SecondStepForm from './form/second-step-form';

// Define the props for FirstStepForm component
export interface FirstStepFormProps {
  categories: CategoryField[];
  context: {
    state: ProductState;
    updateState: (newState: Partial<ProductState>) => void;
  };
  mode: 'create' | 'edit';
}

export interface SecondStepFormProps {
  context: {
    state: ProductState;
    updateState: (newState: Partial<ProductState>) => void;
  };
  mode: 'create' | 'edit';
}

// Define props for higher-order component
interface WithContextProps {
  mode: 'create' | 'edit';
  [key: string]: any;
}

// Higher-order component , create or edit provider
const withContext = (Component: ComponentType<FirstStepFormProps>) => {
  const WithContextComponent: FunctionComponent<WithContextProps> = ({
    mode,
    ...props
  }) => {
    return mode === 'create' ? (
      <AppStateContext.Consumer>
        {(context) => {
          if (!context) {
            throw new Error(
              'useAppState must be used within the Create Provider'
            );
          }
          return (
            <Component
              {...props}
              categories={props.categories}
              context={context}
              mode={mode}
            />
          );
        }}
      </AppStateContext.Consumer>
    ) : (
      <EditStateContext.Consumer>
        {(context) => {
          if (!context) {
            throw new Error(
              'editor state must be used within the Edit Provider'
            );
          }

          return (
            <Component
              {...props}
              context={context}
              categories={props.categories}
              mode={mode}
            />
          );
        }}
      </EditStateContext.Consumer>
    );
  };

  return WithContextComponent;
};

// Wrap FirstStepForm with the higher-order component
export const FirstStepFormWithContext = withContext(FirstStepForm);

export const SecondStepFormWithContext = withContext(SecondStepForm);
