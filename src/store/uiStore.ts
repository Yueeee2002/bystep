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
  lightboxImages: string[]
  lightboxIndex: number
  confirm: ConfirmOptions | null
  toast: { message: string; type: 'success' | 'error' | 'info' } | null
  busy: boolean
  celebrate: 'confetti' | 'clover' | null
  openUpload: () => void
  closeUpload: () => void
  openEdit: (cardId: string) => void
  closeEdit: () => void
  openTags: () => void
  closeTags: () => void
  openLightbox: (images: string[], index?: number) => void
  closeLightbox: () => void
  stepLightbox: (delta: number) => void
  openConfirm: (options: ConfirmOptions) => void
  closeConfirm: () => void
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  clearToast: () => void
  setBusy: (busy: boolean) => void
  triggerCelebrate: () => void
  clearCelebrate: () => void
  getEditingCard: (cards: IExploreCard[]) => IExploreCard | undefined
}

export const useUiStore = create<UiState>((set, get) => ({
  uploadOpen: false,
  editOpen: false,
  tagsOpen: false,
  confirmOpen: false,
  lightboxOpen: false,
  editingCardId: null,
  lightboxImages: [],
  lightboxIndex: 0,
  confirm: null,
  toast: null,
  busy: false,
  celebrate: null,

  openUpload: () => set({ uploadOpen: true }),
  closeUpload: () => set({ uploadOpen: false }),
  openEdit: (cardId) => set({ editOpen: true, editingCardId: cardId }),
  closeEdit: () => set({ editOpen: false, editingCardId: null }),
  openTags: () => set({ tagsOpen: true }),
  closeTags: () => set({ tagsOpen: false }),
  openLightbox: (images, index = 0) =>
    set({
      lightboxOpen: true,
      lightboxImages: images,
      lightboxIndex: Math.max(0, Math.min(index, images.length - 1)),
    }),
  closeLightbox: () => set({ lightboxOpen: false, lightboxImages: [], lightboxIndex: 0 }),
  stepLightbox: (delta) => {
    const { lightboxImages, lightboxIndex } = get()
    if (lightboxImages.length === 0) return
    const next = (lightboxIndex + delta + lightboxImages.length) % lightboxImages.length
    set({ lightboxIndex: next })
  },
  openConfirm: (options) => set({ confirmOpen: true, confirm: options }),
  closeConfirm: () => set({ confirmOpen: false, confirm: null }),
  showToast: (message, type = 'info') => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
  setBusy: (busy) => set({ busy }),
  triggerCelebrate: () => set({ celebrate: Math.random() > 0.5 ? 'confetti' : 'clover' }),
  clearCelebrate: () => set({ celebrate: null }),
  getEditingCard: (cards) => cards.find((card) => card.id === get().editingCardId),
}))
