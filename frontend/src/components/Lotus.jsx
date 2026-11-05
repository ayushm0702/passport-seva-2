const P = 'M0 20C-14 6 -13 -22 0 -50C13 -22 14 6 0 20Z';
export default function Lotus({ size = 36, className, style }) {
  return (
    <svg viewBox="-60 -60 120 100" width={size} height={size * 0.83} className={className} style={style} aria-hidden="true">
      <path d="M-52 22C-30 30 0 26 0 22C0 26 30 30 52 22C34 36 -34 36 -52 22Z" fill="#138808" opacity=".85" />
      <path d={P} transform="rotate(-62)" fill="#f29c2b" />
      <path d={P} transform="rotate(62)" fill="#f29c2b" />
      <path d={P} transform="rotate(-34)" fill="#ef7aa1" />
      <path d={P} transform="rotate(34)" fill="#ef7aa1" />
      <path d={P} fill="#d9467a" />
    </svg>
  );
}
