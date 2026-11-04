import './ProgressRing.css'

interface ProgressRingProps {
  value: number
  done?: boolean
}

const SIZE = 28
const STROKE = 2
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const CENTER = SIZE / 2

export default function ProgressRing({ value, done = false }: ProgressRingProps) {
  const clamped = Math.min(1, Math.max(0, value))
  const offset = CIRCUMFERENCE * (1 - clamped)

  return (
    <svg
      className={done ? 'ring ring--done' : 'ring'}
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden="true"
    >
      <circle
        className="ring__track"
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        strokeWidth={STROKE}
        fill="none"
      />
      <circle
        className="ring__fill"
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        strokeWidth={STROKE}
        fill="none"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
      />
      {done ? (
        <path
          className="ring__check"
          d="M9 14.5 L12.5 18 L19 10.5"
          fill="none"
          strokeWidth={STROKE}
        />
      ) : null}
    </svg>
  )
}
