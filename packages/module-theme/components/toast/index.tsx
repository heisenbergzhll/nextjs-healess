import { Toaster } from 'react-hot-toast';
import ErrorBoundary from '../ErrorBoundary';

const Toast = () => {
  return (
    <ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            '!bg-white/20 !rounded-[16px] !text-md !mt-4 !shadow-[0_4px_30px_rgba(0,0,0,0.1)] !backdrop-blur-[9.1px] !border !border-white/10',
        }}
      />
    </ErrorBoundary>
  );
};

export default Toast;
