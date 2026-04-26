// "use client"

// import * as React from "react"
// import { Check, ChevronsUpDown } from "lucide-react"
// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"

// interface ComboboxProps {
//   options: string[]
//   placeholder: string
//   value: string
//   onChange: (value: string) => void
//   emptyMessage?: string // رسالة اختيارية عند عدم وجود نتائج
//   className?: string // لإضافة تنسيقات خارجية إذا لزم الأمر
// }

// export function CustomCombobox({
//   options,
//   placeholder,
//   value,
//   onChange,
//   emptyMessage = "لا توجد نتائج.",
//   className,
// }: ComboboxProps) {
//   const [open, setOpen] = React.useState(false)

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button
//           variant="outline"
//           role="combobox"
//           aria-expanded={open}
//           className={cn("h-11 w-full justify-between font-normal", className)}
//         >
//           {value || placeholder}
//           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-full min-w-(--radix-popover-trigger-width) p-0">
//         <Command>
//           <CommandInput
//             placeholder={`البحث عن ${placeholder}...`}
//             className="h-9"
//           />
//           <CommandList>
//             <CommandEmpty>{emptyMessage}</CommandEmpty>
//             <CommandGroup>
//               {options.map((option) => (
//                 <CommandItem
//                   key={option}
//                   value={option}
//                   onSelect={(currentValue) => {
//                     // إذا ضغط المستخدم على نفس الخيار المختار، يتم مسحه، وإلا يتم اختياره
//                     onChange(currentValue === value ? "" : currentValue)
//                     setOpen(false)
//                   }}
//                 >
//                   <Check
//                     className={cn(
//                       "ml-2 h-4 w-4",
//                       value === option ? "opacity-100" : "opacity-0"
//                     )}
//                   />
//                   {option}
//                 </CommandItem>
//               ))}
//             </CommandGroup>
//           </CommandList>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   )
// }
