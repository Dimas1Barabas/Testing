export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="MAX">
      <defs>
        <linearGradient id="max-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3d7bff" />
          <stop offset="1" stopColor="#7a5cff" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#max-gradient)" />
      <text
        x="24"
        y="34"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="30"
        fontWeight="700"
        fill="#fff"
      >
        m
      </text>
    </svg>
  )
}
