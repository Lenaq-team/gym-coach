export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-[#1A1A1A] rounded-xl p-4 border border-zinc-800 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
