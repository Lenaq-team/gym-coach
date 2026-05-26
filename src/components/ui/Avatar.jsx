export const Avatar = ({ src, alt, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }
  
  return (
    <div className={`${sizes[size]} rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="text-zinc-400 font-medium">
          {alt?.charAt(0)?.toUpperCase() || '?'}
        </span>
      )}
    </div>
  )
}
