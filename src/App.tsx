import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from '@/pages/HomePage/HomePage'
import SettingsPage from '@/pages/SettingsPage/SettingsPage'
import CalendarPage from '@/pages/CalendarPage/CalendarPage'
import ArchivePage from '@/pages/ArchivePage/ArchivePage'
import Toast from '@/components/common/Toast'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import UploadModal from '@/components/common/UploadModal'
import EditModal from '@/components/common/EditModal'
import TagModal from '@/components/common/TagModal'
import Lightbox from '@/components/common/Lightbox'
import Celebrate from '@/components/common/Celebrate'
import Loading from '@/components/common/Loading'
import KeyHint from '@/components/common/KeyHint'
import NavDrawer from '@/components/layout/NavDrawer'
import { useCardStore } from '@/store/cardStore'
import { useConfigStore } from '@/store/configStore'
import { useUiStore } from '@/store/uiStore'

export default function App() {
  const theme = useConfigStore((state) => state.theme)
  const drawerOpen = useUiStore((state) => state.drawerOpen)

  useEffect(() => {
    const config = useConfigStore.getState()
    useCardStore.getState().setStatusFilter(config.defaultFilter)
    useCardStore.getState().setViewMode(config.viewMode)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.classList.add('theme-flip')
    const timer = window.setTimeout(() => document.documentElement.classList.remove('theme-flip'), 320)
    return () => window.clearTimeout(timer)
  }, [theme])

  useEffect(() => {
    document.documentElement.classList.toggle('drawer-open', drawerOpen)
  }, [drawerOpen])

  useEffect(() => {
    const onScroll = () => {
      document.documentElement.style.setProperty('--par', `${window.scrollY * 0.04}px`)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    let idle = 0
    const bump = () => {
      document.documentElement.classList.remove('is-idle')
      window.clearTimeout(idle)
      idle = window.setTimeout(() => document.documentElement.classList.add('is-idle'), 14000)
    }
    bump()
    window.addEventListener('pointermove', bump)
    window.addEventListener('keydown', bump)
    return () => {
      window.clearTimeout(idle)
      window.removeEventListener('pointermove', bump)
      window.removeEventListener('keydown', bump)
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const ui = useUiStore.getState()
      if (event.key === 'Escape') {
        if (ui.drawerOpen) ui.closeDrawer()
        else if (ui.lightboxOpen) ui.closeLightbox()
        else if (ui.confirmOpen) ui.closeConfirm()
        else if (ui.tagsOpen) ui.closeTags()
        else if (ui.uploadOpen) ui.closeUpload()
        else if (ui.editOpen) ui.closeEdit()
        ui.showKeyHint('Esc 关闭')
      }
      if (event.key === 'Enter' && ui.tagsOpen) {
        ui.showKeyHint('Enter 新增标签')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <NavDrawer />
      <UploadModal />
      <EditModal />
      <TagModal />
      <ConfirmDialog />
      <Lightbox />
      <Celebrate />
      <Loading />
      <Toast />
      <KeyHint />
    </>
  )
}
