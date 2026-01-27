// react-toastify type reference for ToastOptions and TypeOptions
// https://github.com/fkhadra/react-toastify/blob/master/src/types/index.ts

export type TypeOptions = 'info' | 'success' | 'warning' | 'error' | "Default";

export interface ToastOptions {
  type?: TypeOptions;
  autoClose?: number | false;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  // ...other options omitted
}
