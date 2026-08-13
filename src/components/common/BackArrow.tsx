interface BackArrowProps {
  onClick: () => void
  label?: string
  small?: boolean
}

export default function BackArrow({ onClick, label = '返回', small }: BackArrowProps) {
  return (
    <button type="button" className={`back-arrow ${small ? 'back-arrow-sm' : ''}`} aria-label={label} onClick={onClick}>
      <svg width={small ? 20 : 22} height={small ? 20 : 22} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 5 8 12l7 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
