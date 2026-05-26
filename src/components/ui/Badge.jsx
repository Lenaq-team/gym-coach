export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-zinc-800 text-zinc-300',
    success: 'bg-accent/20 text-accent',
    warning: 'bg-yellow-500/20 text-yellow-500',
    danger: 'bg-red-500/20 text-red-500',
  }
  
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
