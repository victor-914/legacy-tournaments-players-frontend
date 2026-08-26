// lucide-react dropped brand marks, so the TikTok glyph is inlined here with a
// lucide-compatible `size` prop.
export function TikTokIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M16.5 2h-3.02v13.19a2.79 2.79 0 1 1-2-2.67V9.4a5.92 5.92 0 1 0 5.02 5.85V8.86a6.9 6.9 0 0 0 4.02 1.29V7.09A3.94 3.94 0 0 1 16.5 2Z" />
    </svg>
  );
}
