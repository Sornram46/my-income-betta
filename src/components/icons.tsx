import type { ReactNode } from 'react'

type IconProps = { className?: string }

function make(children: ReactNode) {
  return function Icon({ className = 'h-6 w-6' }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        {children}
      </svg>
    )
  }
}

export const HomeIcon = make(
  <>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
  </>
)

export const WalletIcon = make(
  <>
    <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" />
    <path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3" />
    <path d="M21 10h-4a2 2 0 0 0 0 4h4z" />
  </>
)

export const SproutIcon = make(
  <>
    <path d="M12 21v-9" />
    <path d="M12 12c0-3.5-2.5-6-7-6 0 3.5 2.5 6 7 6z" />
    <path d="M12 14c0-3 2-5 6-5 0 3-2 5-6 5z" />
  </>
)

export const FishIcon = make(
  <>
    <path d="M3 12c2.5-4.5 7-6 11-4 1.7.9 3 2.2 4 4-1 1.8-2.3 3.1-4 4-4 2-8.5.5-11-4z" />
    <path d="m18 12 4-4v8z" />
    <circle cx="8" cy="11" r=".6" fill="currentColor" />
  </>
)

export const LogoutIcon = make(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </>
)

export const PlusIcon = make(<path d="M12 5v14M5 12h14" />)

export const CalendarIcon = make(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 11h18" />
  </>
)

export const NoteIcon = make(
  <>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </>
)

export const CoinIcon = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6.5V8M12 16v1.5" />
  </>
)

export const ChevronLeftIcon = make(<path d="m15 18-6-6 6-6" />)
export const ChevronRightIcon = make(<path d="m9 18 6-6-6-6" />)

export const RefreshIcon = make(
  <>
    <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
    <path d="M3 21v-5h5" />
    <path d="M3 12A9 9 0 0 1 18.5 5.8L21 8" />
    <path d="M21 3v5h-5" />
  </>
)

export const TrendIcon = make(
  <>
    <path d="m3 17 6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </>
)

export const ChartIcon = make(
  <>
    <path d="M3 3v18h18" />
    <path d="M7 15v3M12 10v8M17 6v12" />
  </>
)

export const ListIcon = make(<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />)

export const BulbIcon = make(
  <>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
  </>
)

export const PowerIcon = make(
  <>
    <path d="M12 3v9" />
    <path d="M6.3 6.3a8 8 0 1 0 11.4 0" />
  </>
)

export const UserIcon = make(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </>
)

export const MailIcon = make(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </>
)

export const LockIcon = make(
  <>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </>
)

export const AlertIcon = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16.5v.01" />
  </>
)

export const CheckCircleIcon = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 3 3 5-6" />
  </>
)

export const CheckIcon = make(<path d="m5 12.5 4.5 4.5L19 7.5" />)

export const ArrowRightIcon = make(<path d="M5 12h14M13 6l6 6-6 6" />)

export function SpinnerIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
