export function TelegramIcon({ size = 18, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21.73 3.73a2 2 0 0 0-2.82-.06L2.5 19a2 2 0 0 0-.07 2.82 2 2 0 0 0 2.82.07L21.66 6.6a2 2 0 0 0 .07-2.83Z" />
      <path d="M8.7 13.7 5 21l7.3-3.7" />
      <path d="m17 6-6 6" />
    </svg>
  )
}
