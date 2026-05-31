export default function NestlyLogo({ size = 32, className = '' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      className={className}
    >
      {/* Left parent circle */}
      <circle cx="16" cy="20" r="12" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" />
      {/* Right parent circle */}
      <circle cx="24" cy="20" r="12" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" />
      {/* Baby dot in the center (overlap) */}
      <circle cx="20" cy="20" r="3.5" fill="currentColor" />
    </svg>
  );
}
