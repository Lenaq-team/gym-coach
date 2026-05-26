export const Skeleton = ({ className = '', variant = 'default' }) => {
  const variants = {
    default: 'h-4 w-full',
    circle: 'h-12 w-12 rounded-full',
    card: 'h-32 w-full rounded-xl',
  }
  
  return (
    <div className={`animate-pulse bg-zinc-800 ${variants[variant]} ${className}`} />
  )
}

export const SkeletonCard = () => {
  return (
    <div className="bg-[#1A1A1A] rounded-xl p-4 border border-zinc-800 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
    </div>
  )
}
