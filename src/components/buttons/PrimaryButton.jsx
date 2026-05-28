export function PrimaryButton({
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
      className={`w-full h-[52px] rounded-xl font-semibold text-base text-white bg-accent-sage active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {children}
    </button>
  )
}

export default PrimaryButton;
