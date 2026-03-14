import { cn } from '@/lib/utils';

interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

const NeuInput = ({
  label,
  hint,
  error,
  wrapperClassName,
  className,
  id,
  ...props
}: NeuInputProps): JSX.Element => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-xs uppercase tracking-widest text-muted font-body">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn('neu-input w-full', error && 'ring-2 ring-red-400/40', className)}
        {...props}
      />
      {error && <p className="text-xs text-red-400 font-body">{error}</p>}
      {hint && !error && <p className="text-xs text-muted font-body opacity-70">{hint}</p>}
    </div>
  );
};

export default NeuInput;
