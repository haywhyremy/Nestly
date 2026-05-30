export function GhostButton({
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
      className={`w-full py-3 text-sm font-medium text-accent-sage bg-transparent active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-sage/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {children}
    </button>
  )
}

export default GhostButton;
