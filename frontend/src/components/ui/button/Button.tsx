import React from 'react'
import Loader from '../Loader'

import './button.css'

interface ButtonProps {
  isPending?: boolean
  prefixIcon?: React.ReactNode
  postfixIcon?: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  autoFocus?: boolean
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger-primary' | 'danger-secondary' | 'danger-tertiary'
  className?: string
  disabled?: boolean
  label: string
}

const Button = ({
  isPending = false,
  prefixIcon = null,
  postfixIcon = null,
  onClick = () => { },
  type = 'button',
  className = 'leading-tight w-full h-10 text-lg',
  disabled = false,
  variant = 'primary',
  autoFocus = false,
  label }: ButtonProps) => {
  return (
    <button 
      autoFocus={autoFocus}
      type={type} 
      disabled={isPending || disabled} 
      className={`rounded-xs text-sm w-fit btn cursor-pointer relative ${className} ${variant}`} 
      onClick={onClick}
      style={{ minWidth: 'fit-content' }}
    >
      {/* Label content - hidden when pending */}
      <div className={`flex items-center justify-center gap-2 ${isPending ? 'opacity-0' : 'opacity-100'}`}>
        {prefixIcon && prefixIcon}
        <span className="font-bold text-md">{label}</span>
        {postfixIcon && postfixIcon}
      </div>
      
      {/* Loader - shown when pending */}
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader className="h-[calc(100%-8px)] w-[calc(100%-8px)] max-h-6 max-w-6" />
        </div>
      )}
    </button>
  )
}

export default Button