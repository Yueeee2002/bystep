import { useConfigStore } from '@/store/configStore'

export default function ThemeToggle() {
  const theme = useConfigStore((state) => state.theme)
  const toggleTheme = useConfigStore((state) => state.toggleTheme)
  const night = theme === 'night'

  return (
    <button type="button" className="icon-btn" aria-label={night ? '切换浅色模式' : '切换深色模式'} onClick={toggleTheme}>
      {night ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15.2 4.6A7.4 7.4 0 1 0 19.4 14.2 5.6 5.6 0 0 1 15.2 4.6Z"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.35" />
          <path
            d="M12 3.6v1.7M12 18.7v1.7M4.9 4.9l1.2 1.2M17.9 17.9l1.2 1.2M3.6 12h1.7M18.7 12h1.7M4.9 19.1l1.2-1.2M17.9 6.1l1.2-1.2"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  )
}
