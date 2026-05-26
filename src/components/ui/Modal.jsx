import { useEffect } from 'react'

export const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div className="relative bg-[#1A1A1A] rounded-t-2xl sm:rounded-2xl w-full max-w-mobile max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1A1A1A] border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
