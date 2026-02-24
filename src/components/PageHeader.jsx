import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PageHeader({ title, showBack = false, right }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
      {showBack && (
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
      )}
      <h1 className="flex-1 text-lg font-bold text-gray-900">{title}</h1>
      {right && <div>{right}</div>}
    </header>
  )
}
