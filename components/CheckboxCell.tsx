import { Check } from "lucide-react"

// components/shared/CheckboxCell.tsx
export function CheckboxCell({
  isSelected,
  onToggle,
}: {
  isSelected: boolean
  onToggle: (e: React.MouseEvent) => void
}) {
  return (
    <td
      className="cursor-pointer border-l border-slate-100 p-4 select-none dark:border-slate-800"
      onClick={onToggle}
    >
      <div className="flex items-center justify-center">
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200 ${
            isSelected
              ? "border-blue-600 bg-blue-600 dark:border-blue-400 dark:bg-blue-500"
              : "border-slate-300 bg-white hover:border-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-blue-400"
          }`}
        >
          {isSelected && (
            <Check
              className="h-3 w-3 text-white transition-transform"
              strokeWidth={3}
            />
          )}
        </div>
      </div>
    </td>
  )
}
