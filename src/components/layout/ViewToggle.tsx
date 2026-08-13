import { useConfigStore } from '@/store/configStore'
import { resolveViewport } from '@/utils/viewport'

export default function ViewToggle() {
  const preference = useConfigStore((state) => state.viewportPreference)
  const toggleViewport = useConfigStore((state) => state.toggleViewport)
  const mode = resolveViewport(preference)
  const toMobile = mode === 'pc'

  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={toMobile ? '切换为手机视图' : '切换为电脑视图'}
      title={toMobile ? '切换为手机视图' : '切换为电脑视图'}
      onClick={() => toggleViewport(mode)}
    >
      {toMobile ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="8" y="3.5" width="8" height="17" rx="1.8" stroke="currentColor" strokeWidth="1.35" />
          <path d="M11 18.2h2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="11" rx="1.6" stroke="currentColor" strokeWidth="1.35" />
          <path d="M8 19.2h8M12 16v3.2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
        </svg>
      )}
    </button>
  )
}
