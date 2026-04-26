import { Plus } from "lucide-react"

type Props = { onClick: () => void }

export default function MobileAddButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 z-40 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-blue-600 text-white shadow-2xl shadow-blue-400 hover:scale-105 active:scale-95 md:hidden dark:shadow-none"
    >
      <Plus className="h-8 w-8" />
    </button>
  )
}
