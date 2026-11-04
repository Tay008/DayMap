import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import './Field.css'

interface FieldShellProps {
  id: string
  label: string
  error?: string
  children: ReactNode
}

function FieldShell({ id, label, error, children }: FieldShellProps) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? <p className="field__error">{error}</p> : null}
    </div>
  )
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
}

export function TextField({ id, label, error, className, ...rest }: TextFieldProps) {
  const classes = ['field__control', className].filter(Boolean).join(' ')
  return (
    <FieldShell id={id} label={label} error={error}>
      <input id={id} dir="auto" className={classes} {...rest} />
    </FieldShell>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string
  label: string
  error?: string
}

export function SelectField({
  id,
  label,
  error,
  className,
  children,
  ...rest
}: SelectFieldProps) {
  const classes = ['field__control', className].filter(Boolean).join(' ')
  return (
    <FieldShell id={id} label={label} error={error}>
      <select id={id} dir="auto" className={classes} {...rest}>
        {children}
      </select>
    </FieldShell>
  )
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string
  label: string
  error?: string
}

export function TextareaField({
  id,
  label,
  error,
  className,
  ...rest
}: TextareaFieldProps) {
  const classes = ['field__control', className].filter(Boolean).join(' ')
  return (
    <FieldShell id={id} label={label} error={error}>
      <textarea id={id} dir="auto" className={classes} {...rest} />
    </FieldShell>
  )
}
