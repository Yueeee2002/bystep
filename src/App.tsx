import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from '@/pages/HomePage/HomePage'
import SettingsPage from '@/pages/SettingsPage/SettingsPage'
import Toast from '@/components/common/Toast'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import UploadModal from '@/components/common/UploadModal'
import EditModal from '@/components/common/EditModal'
import TagModal from '@/components/common/TagModal'
import Lightbox from '@/components/common/Lightbox'
import Celebrate from '@/components/common/Celebrate'
import Loading from '@/components/common/Loading'
import { useCardStore } from '@/store/cardStore'
import { useConfigStore } from '@/store/configStore'

export default function App() {
  const theme = useConfigStore((state) => state.theme)

  useEffect(() => {
    const config = useConfigStore.getState()
    useCardStore.getState().setStatusFilter(config.defaultFilter)
    useCardStore.getState().setViewMode(config.viewMode)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <UploadModal />
      <EditModal />
      <TagModal />
      <ConfirmDialog />
      <Lightbox />
      <Celebrate />
      <Loading />
      <Toast />
    </>
  )
}
