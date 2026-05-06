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
    <td className="cursor-pointer p-4 select-none" onClick={onToggle}>
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-md border-2 ${
          isSelected
            ? "border-blue-600 bg-blue-600"
            : "border-slate-300 bg-white"
        }`}
      >
        {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </div>
    </td>
  )
}
