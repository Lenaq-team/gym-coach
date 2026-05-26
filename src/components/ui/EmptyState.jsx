export const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-400 mb-4 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  )
}
