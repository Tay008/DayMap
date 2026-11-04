import './ProgressBar.css'

interface ProgressBarProps {
  value: number
  label?: string
}

export default function ProgressBar({ value, label }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, value))
  const percent = Math.round(clamped * 100)
  return (
    <div
      className="pbar"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={label}
    >
      <div className="pbar__fill" style={{ width: `${percent}%` }} />
    </div>
  )
}
