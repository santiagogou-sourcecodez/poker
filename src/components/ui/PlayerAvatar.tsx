const COLORS = [
  'bg-emerald-500',
  'bg-sky-500',
  'bg-amber-500',
  'bg-red-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-orange-500',
]

interface PlayerAvatarProps {
  name: string
  emoji?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
}

export function PlayerAvatar({ name, emoji, size = 'md' }: PlayerAvatarProps) {
  const colorIndex = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % COLORS.length
  const bgColor = COLORS[colorIndex]

  return (
    <div
      className={`
        ${sizeClasses[size]} ${bgColor}
        rounded-full flex items-center justify-center font-bold text-white shrink-0
      `}
    >
      {emoji || name.charAt(0).toUpperCase()}
    </div>
  )
}
