import type { ButtonHTMLAttributes } from 'react'
import './Chip.css'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
}

export default function Chip({
  selected = false,
  className,
  type = 'button',
  ...rest
}: ChipProps) {
  const classes = ['chip', selected ? 'chip--selected' : undefined, className]
    .filter(Boolean)
    .join(' ')
  return <button type={type} aria-pressed={selected} className={classes} {...rest} />
}
