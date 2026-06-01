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
      className={`w-full py-3 text-sm font-medium text-[#7A9B7E] dark:text-[#8FB393] bg-transparent active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A9B7E]/60 dark:focus-visible:ring-[#8FB393]/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {children}
    </button>
  )
}

export default GhostButton;
