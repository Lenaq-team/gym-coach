export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-accent text-black hover:bg-accent/90',
    secondary: 'bg-zinc-800 text-white hover:bg-zinc-700',
    ghost: 'bg-transparent text-zinc-400 hover:bg-zinc-800',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg min-h-[48px]',
  }
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
