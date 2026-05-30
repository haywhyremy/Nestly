export function DestructiveButton({
  children,
  onClick,
  disabled,
  className = '',
  type = 'button'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-[52px] rounded-xl font-semibold text-base text-white bg-accent-coral active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {children}
    </button>
  )
}

export default DestructiveButton;
