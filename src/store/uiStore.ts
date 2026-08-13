import { create } from 'zustand'
import type { IExploreCard } from '@/types'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  danger?: boolean
  requireText?: string
  onConfirm: () => void
}

interface UiState {
  uploadOpen: boolean
  editOpen: boolean
  tagsOpen: boolean
  confirmOpen: boolean
  lightboxOpen: boolean
  editingCardId: string | null
  lightboxSrc: string | null
  confirm: ConfirmOptions | null
  toast: { message: string; type: 'success' | 'error' | 'info' } | null
  openUpload: () => void
  closeUpload: () => void
  openEdit: (cardId: string) => void
  closeEdit: () => void
  openTags: () => void
  closeTags: () => void
  openLightbox: (src: string) => void
  closeLightbox: () => void
  openConfirm: (options: ConfirmOptions) => void
  closeConfirm: () => void
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  clearToast: () => void
  getEditingCard: (cards: IExploreCard[]) => IExploreCard | undefined
}

export const useUiStore = create<UiState>((set, get) => ({
  uploadOpen: false,
  editOpen: false,
  tagsOpen: false,
  confirmOpen: false,
  lightboxOpen: false,
  editingCardId: null,
  lightboxSrc: null,
  confirm: null,
  toast: null,

  openUpload: () => set({ uploadOpen: true }),
  closeUpload: () => set({ uploadOpen: false }),
  openEdit: (cardId) => set({ editOpen: true, editingCardId: cardId }),
  closeEdit: () => set({ editOpen: false, editingCardId: null }),
  openTags: () => set({ tagsOpen: true }),
  closeTags: () => set({ tagsOpen: false }),
  openLightbox: (src) => set({ lightboxOpen: true, lightboxSrc: src }),
  closeLightbox: () => set({ lightboxOpen: false, lightboxSrc: null }),
  openConfirm: (options) => set({ confirmOpen: true, confirm: options }),
  closeConfirm: () => set({ confirmOpen: false, confirm: null }),
  showToast: (message, type = 'info') => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
  getEditingCard: (cards) => cards.find((card) => card.id === get().editingCardId),
}))
