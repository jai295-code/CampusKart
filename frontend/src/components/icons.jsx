// Inline SVG icons. Every glyph draws with `currentColor` on a 24x24 grid and is
// `aria-hidden` by default, so an icon never announces itself next to the label
// it decorates. Pass `aria-hidden={false}` plus a title if one ever needs to.
//
// Kept as plain components on purpose: no icon library, no extra dependency.

const stroke = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
};

export function SearchIcon({ className = 'h-5 w-5', ...rest }) {
  return (
    <svg {...stroke} className={className} {...rest}>
      <circle cx="11" cy="11" r="6.75" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}

export function PhoneIcon({ className = 'h-5 w-5', ...rest }) {
  return (
    <svg {...stroke} className={className} {...rest}>
      <path d="M6.6 3.5h2.2l1.4 3.4-1.7 1.2a11 11 0 0 0 5.4 5.4l1.2-1.7 3.4 1.4v2.3a2 2 0 0 1-2.2 2A15.6 15.6 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />
    </svg>
  );
}

export function WhatsAppIcon({ className = 'h-5 w-5', ...rest }) {
  return (
    <svg {...stroke} className={className} {...rest}>
      <path d="M20 11.8a7.8 7.8 0 0 1-11.7 6.8L4.5 19.5l1.1-3.8A7.8 7.8 0 1 1 20 11.8Z" />
      <path d="M9.6 9.3c.2-.5.4-.5.7-.5h.4c.2 0 .4 0 .5.4l.6 1.4c.1.2 0 .3-.1.5l-.4.4c-.1.2-.2.3 0 .5.5.8 1.2 1.4 2 1.9.2.1.4 0 .5-.1l.4-.5c.2-.2.3-.2.5-.1l1.4.7c.2.1.3.2.3.4 0 .9-.7 1.6-1.6 1.6-2.7-.3-5.3-2.9-5.5-5.7 0-.4 0-.8.1-1.1Z" />
    </svg>
  );
}

export function PinIcon({ className = 'h-4 w-4', ...rest }) {
  return (
    <svg {...stroke} className={className} {...rest}>
      <path d="M12 21s6.4-5.6 6.4-10a6.4 6.4 0 1 0-12.8 0C5.6 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.9" r="2.3" />
    </svg>
  );
}

export function PlusIcon({ className = 'h-5 w-5', ...rest }) {
  return (
    <svg {...stroke} strokeWidth={2} className={className} {...rest}>
      <path d="M12 5.5v13M5.5 12h13" />
    </svg>
  );
}

export function TrashIcon({ className = 'h-4 w-4', ...rest }) {
  return (
    <svg {...stroke} className={className} {...rest}>
      <path d="M4.5 7h15M9.5 7V5.6A1.6 1.6 0 0 1 11 4h2a1.6 1.6 0 0 1 1.6 1.6V7M6.7 7l.8 12a2 2 0 0 0 2 1.9h5a2 2 0 0 0 2-1.9l.8-12" />
      <path d="M10.6 11v6M13.4 11v6" />
    </svg>
  );
}

export function ChevronLeftIcon({ className = 'h-4 w-4', ...rest }) {
  return (
    <svg {...stroke} strokeWidth={2} className={className} {...rest}>
      <path d="m14 6-6 6 6 6" />
    </svg>
  );
}

export function ImageIcon({ className = 'h-6 w-6', ...rest }) {
  return (
    <svg {...stroke} className={className} {...rest}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m4.5 17.4 4.2-4.2a2 2 0 0 1 2.8 0l2.9 2.9 1.6-1.5a2 2 0 0 1 2.8 0l1.7 1.6" />
    </svg>
  );
}

export function TagIcon({ className = 'h-4 w-4', ...rest }) {
  return (
    <svg {...stroke} className={className} {...rest}>
      <path d="M13.6 3.6H20V10l-8.4 8.4a2 2 0 0 1-2.9 0l-3.5-3.5a2 2 0 0 1 0-2.9L13.6 3.6Z" />
      <circle cx="16.6" cy="7.4" r="1.15" />
    </svg>
  );
}

export function UserIcon({ className = 'h-5 w-5', ...rest }) {
  return (
    <svg {...stroke} className={className} {...rest}>
      <circle cx="12" cy="8.4" r="3.6" />
      <path d="M4.8 20a7.4 7.4 0 0 1 14.4 0" />
    </svg>
  );
}

export function CheckBadgeIcon({ className = 'h-3.5 w-3.5', ...rest }) {
  return (
    <svg {...stroke} className={className} {...rest}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="m8.4 12.3 2.5 2.5 4.7-5" />
    </svg>
  );
}

export function MailIcon({ className = 'h-5 w-5', ...rest }) {
  return (
    <svg {...stroke} className={className} {...rest}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 7.5 6.4 4.6a2 2 0 0 0 2.2 0l6.4-4.6" />
    </svg>
  );
}

export function LockIcon({ className = 'h-5 w-5', ...rest }) {
  return (
    <svg {...stroke} className={className} {...rest}>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </svg>
  );
}

export function CartIcon({ className = 'h-5 w-5', ...rest }) {
  return (
    <svg {...stroke} className={className} {...rest}>
      <path d="M6.4 7.5h11.2l-1.1 9.1a2 2 0 0 1-2 1.8H9.5a2 2 0 0 1-2-1.8L6.4 7.5Z" />
      <path d="M9.4 7.5a2.6 2.6 0 0 1 5.2 0" />
    </svg>
  );
}

export function Spinner({ className = 'h-4 w-4', ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`animate-spin ${className}`}
      {...rest}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// The wordmark's companion tile. The skin lives on the wrapper so the glyph can
// stay a plain currentColor stroke. `plain` is for placing it on a coloured
// surface, where the brand gradient would disappear.
export function LogoMark({ className = 'h-9 w-9', iconClassName = 'h-5 w-5', variant = 'gradient' }) {
  const skin =
    variant === 'plain'
      ? 'bg-white/15 text-white ring-1 ring-inset ring-white/30'
      : 'bg-linear-to-br from-brand-500 to-violet-600 text-white shadow-sm';

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-xl ${skin} ${className}`}
    >
      <CartIcon className={iconClassName} />
    </span>
  );
}
