import { useRef } from 'react'

interface ChipInputProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
  placeholder?: string
}

export function ChipInput({ value, onChange, placeholder = '0' }: ChipInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <input
      ref={inputRef}
      type="number"
      inputMode="numeric"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => {
        const raw = e.target.value
        if (raw === '') {
          onChange(undefined)
        } else {
          const num = parseInt(raw, 10)
          if (!isNaN(num) && num >= 0) {
            onChange(num)
          }
        }
      }}
      className="
        w-24 bg-slate-800 border border-slate-700 rounded-xl
        px-3 py-2 text-right text-lg font-mono text-slate-200
        focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
        placeholder:text-slate-600
      "
    />
  )
}
