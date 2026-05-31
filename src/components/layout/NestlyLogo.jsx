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
      {/* Baby footprint — bold, solid, immediately recognizable */}
      {/* Foot sole — rounded teardrop shape */}
      <path
        d="M20 36c-5.5 0-10-3.5-10-9.5C10 20 15 15 20 15s10 5 10 11.5C30 32.5 25.5 36 20 36z"
        fill="currentColor"
      />
      {/* Toes — five solid circles, arranged in an arc */}
      <circle cx="11" cy="12.5" r="3" fill="currentColor" />
      <circle cx="16" cy="8.5" r="3.2" fill="currentColor" />
      <circle cx="21.5" cy="7" r="3.3" fill="currentColor" />
      <circle cx="27" cy="8.5" r="3" fill="currentColor" />
      <circle cx="31" cy="13" r="2.7" fill="currentColor" />
    </svg>
  );
}
