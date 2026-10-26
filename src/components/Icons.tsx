/**
 * Original line-icon set drawn for AstroSutra (24×24, 1.6 stroke).
 * No third-party icon library is used, so there are no attribution
 * requirements beyond AstroSutra's own MIT licence.
 */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

export const IconTag = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.5 12.2V4.8c0-.7.6-1.3 1.3-1.3h7.4c.4 0 .7.1 1 .3l7.3 7.3c.5.5.5 1.3 0 1.8l-6.6 6.6c-.5.5-1.3.5-1.8 0L3.8 13.2a1.4 1.4 0 0 1-.3-1Z" />
    <circle cx="8.2" cy="8.2" r="1.4" />
  </svg>
);

export const IconDashboard = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" />
  </svg>
);

export const IconCompass = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.4 8.6-2 4.8-4.8 2 2-4.8 4.8-2Z" />
  </svg>
);

export const IconMoonStars = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 14.4A8.2 8.2 0 0 1 9.6 4a8.4 8.4 0 1 0 10.4 10.4Z" />
    <path d="M18.4 3.2v2.4M17.2 4.4h2.4M21 8v1.8M20.1 8.9h1.8" />
  </svg>
);

export const IconHeart = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20.2s-7.4-4.4-7.4-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7.4 2.9c0 4.9-7.4 9.3-7.4 9.3Z" />
  </svg>
);

export const IconSparkles = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.6 13.7 9l5.4 1.7-5.4 1.7L12 17.8l-1.7-5.4L4.9 10.7 10.3 9 12 3.6Z" />
    <path d="M18.6 15.4 19.3 17.5l2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z" />
  </svg>
);

export const IconSun = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.6v2.1M12 19.3v2.1M4.4 4.4l1.5 1.5M18.1 18.1l1.5 1.5M2.6 12h2.1M19.3 12h2.1M4.4 19.6l1.5-1.5M18.1 5.9l1.5-1.5" />
  </svg>
);

export const IconCalendar = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.4" y="5" width="17.2" height="15.6" rx="2.2" />
    <path d="M3.4 9.6h17.2M8 3.4v3M16 3.4v3" />
  </svg>
);

export const IconDocument = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 3.4h7.5L19 8.9v11.7H6z" />
    <path d="M13.2 3.6v5.4h5.4M8.6 12.6h7M8.6 16h5.2" />
  </svg>
);

export const IconUsers = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8.4" r="3.3" />
    <path d="M2.8 20.2c0-3.4 2.8-5.6 6.2-5.6s6.2 2.2 6.2 5.6" />
    <path d="M16.4 5.6a3.1 3.1 0 0 1 0 6M17.6 14.9c2.2.4 3.6 2.2 3.6 4.6" />
  </svg>
);

export const IconBook = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 4.6A1.6 1.6 0 0 1 5.6 3H19v18H5.6A1.6 1.6 0 0 1 4 19.4z" />
    <path d="M4 17.4h15M8 7h7M8 10.4h5" />
  </svg>
);

export const IconSettings = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 14.2a1.6 1.6 0 0 0 .3 1.8l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a1.9 1.9 0 1 1-3.8 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3.4a1.9 1.9 0 1 1 0-3.8h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3.4a1.9 1.9 0 1 1 3.8 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a1.9 1.9 0 1 1 0 3.8h-.1a1.6 1.6 0 0 0-1.5 1Z" />
  </svg>
);

export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m4.8 12.6 4.6 4.6L19.2 7" />
  </svg>
);

export const IconArrowRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </svg>
);

export const IconChevronDown = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m6 9.5 6 6 6-6" />
  </svg>
);

export const IconDownload = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.6v11M7.4 10.2 12 14.8l4.6-4.6M4.4 20.4h15.2" />
  </svg>
);

export const IconTrash = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.6 6.6h14.8M9.4 6.6V4.4h5.2v2.2M6.6 6.6l.9 13.2h9l.9-13.2" />
    <path d="M10.4 10.4v5.6M13.6 10.4v5.6" />
  </svg>
);

export const IconLock = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4.6" y="10.4" width="14.8" height="10" rx="2.2" />
    <path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6" />
  </svg>
);

export const IconShield = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.2 19.6 6v6c0 4.4-3.2 7.6-7.6 8.8C7.6 19.6 4.4 16.4 4.4 12V6L12 3.2Z" />
    <path d="m8.8 12 2.2 2.2 4.2-4.2" />
  </svg>
);

export const IconClock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 7.4V12l3.2 2" />
  </svg>
);

export const IconLocation = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21s6.4-5.6 6.4-10.4A6.4 6.4 0 0 0 5.6 10.6C5.6 15.4 12 21 12 21Z" />
    <circle cx="12" cy="10.4" r="2.4" />
  </svg>
);

export const IconPrint = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 9V3.6h10V9M7 17.4H4.6V9.4h14.8v8h-2.4" />
    <rect x="7" y="14" width="10" height="6.4" rx="1.2" />
  </svg>
);

export const IconStars = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 4.2l1.8 4.6 4.6 1.8-4.6 1.8L12 17l-1.8-4.6L5.6 10.6l4.6-1.8L12 4.2Z" />
  </svg>
);

export const IconLeaf = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 4.4c-8.4.4-14.4 4.4-14.4 10.4 0 2 .8 3.8 2 5.2C13.6 19.4 19.6 13.6 20 4.4Z" />
    <path d="M4.8 20.4c3.2-4.4 7.2-7.6 11.6-9.6" />
  </svg>
);

export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.4" />
    <path d="m16 16 4.2 4.2" />
  </svg>
);

export const IconWallet = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.4" y="6.4" width="17.2" height="12.6" rx="2.4" />
    <path d="M3.4 9.8h17.2M16.4 14.6h1.8" />
  </svg>
);
