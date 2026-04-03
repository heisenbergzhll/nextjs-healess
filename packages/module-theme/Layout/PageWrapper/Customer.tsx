import { useCustomerCart } from '@voguish/module-quote/hooks';
import { ReactNode } from 'react';
const Customer = ({ children }: { children: ReactNode }) => {
  useCustomerCart();

  return (
    <div className="min-h-[calc(100vh-870px)] h-max block items-start">
      {children}
    </div>
  );
};

export default Customer;
