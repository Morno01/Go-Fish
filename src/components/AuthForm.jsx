import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function Input({ label, type = 'text', value, onChange, placeholder, required }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <div className="relative">
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  )
}

export function Button({ children, onClick, type = 'button', variant = 'primary', loading, className = '' }) {
  const base = 'w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all focus:outline-none'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? 'Indlæser...' : children}
    </button>
  )
}

export function ErrorMessage({ message }) {
  if (!message) return null
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
      {message}
    </div>
  )
}

export function SuccessMessage({ message }) {
  if (!message) return null
  return (
    <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
      {message}
    </div>
  )
}
