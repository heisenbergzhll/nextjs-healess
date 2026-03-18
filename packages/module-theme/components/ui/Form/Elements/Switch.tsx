import {
  Switch as MuiSwitch,
  SwitchProps as MuiSwitchProps,
} from '@mui/material';

export interface ISwitch extends Omit<MuiSwitchProps, 'onChange'> {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Switch = ({ label, checked, onChange, ...props }: ISwitch) => {
  return (
    <div className="flex items-center gap-2">
      <MuiSwitch
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        {...props}
        sx={{
          width: 44,
          height: 24,
          padding: 0,
          margin: 0,
          '& .MuiSwitch-switchBase': {
            padding: 0,
            margin: '2px 0 0 2px',
            transition: 'transform 0.2s ease-in-out',
            '&.Mui-checked': {
              transform: 'translateX(20px)',
              color: '#fff',
              '& + .MuiSwitch-track': {
                backgroundColor: '#BB742F',
                opacity: 1,
              },
            },
          },
          '& .MuiSwitch-thumb': {
            width: 20,
            height: 20,
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          },
          '& .MuiSwitch-track': {
            width: 44,
            height: 24,
            borderRadius: 14,
            backgroundColor: '#9CA3AF',
            opacity: 1,
            border: 'none',
          },
          ...props.sx,
        }}
      />
      {label && (
        <span
          className="text-sm text-[#101828] cursor-pointer"
          onClick={() => onChange(!checked)}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default Switch;
