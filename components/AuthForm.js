'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function Input({ label, id, type = 'text', ...props }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 text-sm"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  )
}

export function Button({ children, loading, variant = 'primary', className = '', ...props }) {
  const base = 'w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
  }
  return (
    <button {...props} disabled={loading || props.disabled} className={`${base} ${variants[variant]} ${className}`}>
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Vent venligst...
        </span>
      ) : children}
    </button>
  )
}

export function ErrorMessage({ message }) {
  if (!message) return null
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
      {message}
    </div>
  )
}

export function SuccessMessage({ message }) {
  if (!message) return null
  return (
    <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
      {message}
    </div>
  )
}
