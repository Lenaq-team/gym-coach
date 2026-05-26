import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

export const PageWrapper = ({ title, children, showNav = true }) => {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <TopBar title={title} />
      <main className="max-w-mobile mx-auto pt-14 pb-20 px-4">
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}
