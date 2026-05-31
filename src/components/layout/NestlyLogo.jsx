export default function NestlyLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Baby footprint - left foot */}
      {/* Sole of foot - oval shape */}
      <ellipse cx="17" cy="24" rx="7" ry="9" fill="currentColor" opacity="0.85" />
      {/* Five toes - small circles */}
      <circle cx="10.5" cy="14" r="2.2" fill="currentColor" opacity="0.85" />
      <circle cx="13.5" cy="12" r="2.4" fill="currentColor" opacity="0.85" />
      <circle cx="17" cy="11.2" r="2.5" fill="currentColor" opacity="0.85" />
      <circle cx="20.5" cy="12" r="2.3" fill="currentColor" opacity="0.85" />
      <circle cx="23.2" cy="14.2" r="2" fill="currentColor" opacity="0.85" />
      
      {/* Small checkmark / tick - representing "logged" */}
      <path
        d="M28 19l3 3 5-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}
