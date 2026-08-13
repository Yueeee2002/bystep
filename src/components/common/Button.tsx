import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'text' | 'danger' | 'danger-ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

const classMap: Record<Variant, string> = {
  primary: 'btn btn-primary',
  ghost: 'btn btn-ghost',
  text: 'btn btn-text',
  danger: 'btn btn-danger',
  'danger-ghost': 'btn btn-danger-ghost',
}

export default function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button className={`${classMap[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
