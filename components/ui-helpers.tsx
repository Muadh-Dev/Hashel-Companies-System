"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

export const Label = ({
  text,
  small,
  required,
}: {
  text: string
  small?: boolean
  required?: boolean
}) => (
  <label
    className={`block font-bold text-foreground/80 ${small ? "text-[11px]" : "text-sm"}`}
  >
    {text} {required && <span className="text-destructive">*</span>}
  </label>
)

export const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  maxLength,
}: {
  type?: string
  placeholder?: string
  value: string | number
  onChange: (v: string) => void
  maxLength?: number
}) => (
  <input
    type={type}
    value={value}
    placeholder={placeholder}
    maxLength={maxLength}
    onChange={(e) => onChange(e.target.value)}
    className="h-12 w-full rounded-xl border border-input bg-background px-4 font-medium text-foreground transition-all outline-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20"
  />
)

export const Select = ({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  placeholder: string
}) => (
  <div className="group relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-input bg-background px-4 text-foreground transition-all outline-none focus:ring-2 focus:ring-primary/20"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
  </div>
)

export const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: { name: string; id: string }[]
  value: string
  onChange: (v: string) => void
  placeholder: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const filtered = options.filter(
    (o) => o.name.includes(search) || o.id.includes(search)
  )

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-full cursor-pointer items-center justify-between rounded-xl border border-input bg-background px-4"
      >
        <span
          className={value ? "text-foreground" : "text-muted-foreground/40"}
        >
          {value || placeholder}
        </span>
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full space-y-2 rounded-xl border border-border bg-card p-2 shadow-xl">
          <input
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none"
            placeholder="ابحث بالاسم أو الـ ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="max-h-40 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.name)
                    setIsOpen(false)
                  }}
                  className="cursor-pointer rounded-lg p-2 hover:bg-secondary"
                >
                  <div className="text-sm font-bold">{opt.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    ID: {opt.id}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-2 text-center text-xs text-muted-foreground">
                لا توجد نتائج
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export const SubHeader = ({
  title,
  icon: Icon,
}: {
  title: string
  icon: any
}) => (
  <div className="flex items-center gap-3 border-r-4 border-primary pr-3">
    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
      <Icon className="h-4 w-4" />
    </div>
    <h3 className="text-base font-black tracking-tight">{title}</h3>
  </div>
)
