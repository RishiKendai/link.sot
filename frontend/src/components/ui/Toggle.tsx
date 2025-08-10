interface ToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function Toggle({ 
  enabled, 
  onToggle, 
  label, 
  disabled = false,
  className = '' 
}: ToggleProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}
      <button
        type="button"
        onClick={() => !disabled && onToggle(!enabled)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ease-in-out outline-none
          ${enabled ? 'bg-[var(--clr-secondary)] shadow-sm' : 'bg-gray-300'}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-md'}
        `}
      >
        <span
          className={`
            inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-all duration-200 ease-in-out
            ${enabled ? 'translate-x-5.5' : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  );
} 