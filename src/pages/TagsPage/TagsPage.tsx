import AppHeader from '@/components/layout/AppHeader'
import TagModal from '@/components/common/TagModal'

export default function TagsPage() {
  return (
    <div className="app-shell">
      <AppHeader title="标签管理" />
      <TagModal asPage />
    </div>
  )
}
