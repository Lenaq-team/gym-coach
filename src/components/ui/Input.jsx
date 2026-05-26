import { forwardRef } from 'react'

export const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
