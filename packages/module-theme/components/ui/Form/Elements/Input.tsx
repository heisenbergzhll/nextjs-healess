import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import {
  FilledInputProps,
  FormHelperTextProps,
  InputBaseComponentProps,
  InputProps,
  OutlinedInputProps,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Style from '@styles/Checkout.module.css';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { MouseEvent, ReactNode, forwardRef, useState } from 'react';
export interface IInputField {
  label?: string;
  type: 'password' | 'email' | string;
  placeHolder?: string;
  error?: boolean;
  helperText?: any;
  name?: string;
  onChange?: any;
  onBlur?: any;
  value?: string;
  multiline?: boolean;
  maxRows?: number | string;
  minRows?: number | string;
  defaultValue?: string;
  refs?: any;
  sx?: any;
  endAdornment?: ReactNode;
  className?: string;
  inputProps?: InputBaseComponentProps;
  InputProps?:
    | Partial<FilledInputProps>
    | Partial<OutlinedInputProps>
    | Partial<InputProps>;
  FormHelperTextProps?: Partial<FormHelperTextProps> | undefined;
  autoFocus?: boolean;
}

const InputField = forwardRef(
  (
    {
      label,
      type,
      endAdornment,
      placeHolder,
      error,
      helperText,
      name,
      onChange,
      onBlur,
      value,
      multiline,
      minRows,
      maxRows,
      defaultValue,
      sx,
      className,
      inputProps,
      InputProps,
      FormHelperTextProps,
      autoFocus,
    }: IInputField,
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    };
    return (
      <ErrorBoundary>
        {' '}
        <div className="relative">
          {label && (
            <label className="mt-0.5" htmlFor={name}>
              {label}
            </label>
          )}
          <TextField
            autoSave={type}
            className={`mt-0 re [&>div.MuiOutlinedInput-root]:min-h-[40px] mb-0 ${Style.CheckoutInputError} [&>div.MuiOutlinedInput-root]:!max-h-fit min-h-[4rem] md:min-h-[3.5rem] w-full [&>div.MuiOutlinedInput-root]:min-w-full border-commonBorder ${className} `}
            sx={{
              ...sx,
            }}
            type={
              type === 'password' ? (showPassword ? 'text' : 'password') : type
            }
            name={name}
            placeholder={placeHolder}
            ref={ref as any}
            onBlur={onBlur}
            onChange={onChange}
            value={value}
            defaultValue={defaultValue}
            fullWidth
            margin="normal"
            autoFocus={autoFocus ?? true}
            FormHelperTextProps={{
              className: '!text-xs !absolute !text-red-600 -bottom-1',
              ...FormHelperTextProps,
            }}
            autoComplete={type}
            helperText={helperText}
            error={error}
            size="small"
            inputProps={inputProps}
            InputProps={{
              endAdornment:
                type === 'password' ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon />
                      ) : (
                        <RemoveRedEyeOutlinedIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ) : (
                  endAdornment
                ),
              style: { border: '1px solid transparent' },
              ...InputProps,
            }}
            multiline={multiline}
            maxRows={maxRows}
            minRows={minRows}
          />
        </div>
      </ErrorBoundary>
    );
  }
);

InputField.displayName = 'Input';
export default InputField;
