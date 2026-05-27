export const Avatar = ({ src, alt, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }
  
  // Generate avatar URL from DiceBear if no src provided
  const avatarSrc = src || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(alt || 'user')}`
  
  return (
    <div className={`${sizes[size]} rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center ${className}`}>
      <img 
        src={avatarSrc} 
        alt={alt || 'Avatar'} 
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to initials if image fails to load
          e.target.style.display = 'none'
          e.target.parentElement.innerHTML = `<span class="text-zinc-400 font-medium">${alt?.charAt(0)?.toUpperCase() || '?'}</span>`
        }}
      />
    </div>
  )
}
