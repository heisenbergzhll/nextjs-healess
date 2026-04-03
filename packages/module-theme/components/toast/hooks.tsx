import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ClearIcon from '@mui/icons-material/Clear';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export type Toast = {
  message: string;
  type?: 'success' | 'info' | 'error' | 'warning';
};

export const useToast = () => {
  const showToast = (toastData: Toast) => {
    const type = toastData?.type || 'success';

    toast.custom((t) => (
      <AnimatePresence>
        {t.visible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="max-w-xs w-full overflow-hidden bg-[#ebe9e9a2] backdrop-blur-[9px] backdrop-saturate-[180%]  rounded-xl border border-[rgba(255,255,255,0.125)]  pointer-events-auto flex "
          >
            <div className="flex border-l ">
              <button className="flex items-center justify-center w-full p-0 pl-3 text-sm font-medium bg-transparent border-none cursor-pointer">
                {type === 'warning' ? (
                  <WarningIcon className="text-yellow-400" />
                ) : type === 'error' ? (
                  <InfoIcon className="text-red-500" />
                ) : type === 'success' ? (
                  <CheckCircleIcon className="text-green-500" />
                ) : type === 'info' ? (
                  <InfoIcon className="text-blue-500" />
                ) : (
                  <CheckCircleIcon className="text-green-500" />
                )}
              </button>
            </div>
            <div className="flex-1 w-0 p-2 py-4">
              <div className="flex items-start">
                <div className="flex-1 ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {toastData.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="flex items-center justify-center w-full text-sm font-medium text-gray-500 bg-transparent border-none rounded-none cursor-pointer"
              >
                <ClearIcon />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    ));
  };

  return { showToast };
};
