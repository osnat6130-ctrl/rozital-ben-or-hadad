import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
  focusable: false,
};

export const HeartIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 20.5S3.5 15.2 3.5 9.4A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8.5 2.1c0 5.8-8.5 11.1-8.5 11.1Z" />
  </svg>
);

export const BadgeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="9.5" r="5.5" />
    <path d="m8.5 14.2-1.3 6 4.8-2.4 4.8 2.4-1.3-6" />
    <path d="m10 9.4 1.5 1.6L14.2 8" />
  </svg>
);

export const SparkIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 2.8 13.9 8l5.3 1.9-5.3 1.9L12 17.1l-1.9-5.3L4.8 9.9 10.1 8 12 2.8Z" />
    <path d="M18.5 16.5 19.3 18.6l2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.1Z" />
  </svg>
);

export const PhoneIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M15.6 21c-6 0-12.6-6.6-12.6-12.6 0-1 .3-1.7 1-2.4l1.3-1.3c.6-.6 1.4-.6 2 0l2.2 2.2c.6.6.6 1.4 0 2l-1 1c.9 1.9 2.4 3.4 4.3 4.3l1-1c.6-.6 1.4-.6 2 0l2.2 2.2c.6.6.6 1.4 0 2L17 20c-.7.7-1.4 1-2.4 1Z" />
  </svg>
);

export const WhatsappIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...p}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
  </svg>
);

export const MailIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="2.8" y="4.8" width="18.4" height="14.4" rx="2.5" />
    <path d="m3.5 7 7.3 5.2c.7.5 1.7.5 2.4 0L20.5 7" />
  </svg>
);

export const MenuIcon = (p: IconProps) => (
  <svg {...base} strokeWidth={2} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...base} strokeWidth={2} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

/** חץ שמצביע שמאלה - כיוון ההתקדמות ב-RTL */
export const ArrowIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base} strokeWidth={2.2} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const ZoomIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5M11 8.5v5M8.5 11h5" />
  </svg>
);

/** גרשיים פותחים - לציטוטים בהמלצות */
export const QuoteIcon = (p: IconProps) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}>
    <path d="M9.4 6.2c-3 1.3-5 4-5 7.3 0 2.6 1.6 4.3 3.8 4.3 2 0 3.5-1.5 3.5-3.4 0-1.9-1.3-3.3-3.1-3.3-.3 0-.7 0-1 .2.4-1.5 1.6-2.8 3.2-3.6l-1.4-1.5Zm9.1 0c-3 1.3-5 4-5 7.3 0 2.6 1.6 4.3 3.8 4.3 2 0 3.5-1.5 3.5-3.4 0-1.9-1.3-3.3-3.1-3.3-.3 0-.7 0-1 .2.4-1.5 1.6-2.8 3.2-3.6l-1.4-1.5Z" />
  </svg>
);

/** סמל נגישות - דמות בתוך עיגול */
export const AccessibilityIcon = (p: IconProps) => (
  <svg {...base} strokeWidth={2} {...p}>
    <circle cx="12" cy="5.6" r="2.3" />
    <path d="M12 8.4v3.1M6.2 10.1 12 8.8l5.8 1.3M8.6 20 12 11.5 15.4 20" />
  </svg>
);

export const iconMap = {
  heart: HeartIcon,
  badge: BadgeIcon,
  spark: SparkIcon,
};
