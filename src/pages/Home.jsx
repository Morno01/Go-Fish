import { Link } from 'react-router-dom'
import { Fish, Users, MapPin, BookOpen } from 'lucide-react'

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
        <Icon size={20} className="text-blue-600" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  )
}

function Step({ num, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
        {num}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Fish size={24} /> Go-Fish
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 font-medium px-3 py-1.5">
            Log ind
          </Link>
          <Link to="/register" className="text-sm bg-blue-600 text-white rounded-xl px-4 py-1.5 font-medium hover:bg-blue-700">
            Tilmeld
          </Link>
        </div>
      </header>

      <main className="px-6 py-12 max-w-lg mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Find din<br />
            <span className="text-blue-600">fiskekammerat</span>
          </h1>
          <p className="text-gray-500 text-lg">
            Match med andre lystfiskere, planlæg ture og del dine fangster.
          </p>
        </div>

        <div className="flex gap-3 mb-12">
          <Link to="/register" className="flex-1 bg-blue-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-blue-700">
            Kom i gang
          </Link>
          <Link to="/login" className="flex-1 border border-blue-600 text-blue-600 text-center py-3 rounded-xl font-semibold hover:bg-blue-50">
            Log ind
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-12">
          <FeatureCard icon={Users} title="Samkørsel" desc="Del turen med andre fiskere i dit område" />
          <FeatureCard icon={MapPin} title="Mødested" desc="Find et møde­sted og fisk sammen" />
          <FeatureCard icon={Fish} title="Match" desc="Swippe dig til den perfekte fiskekammerat" />
          <FeatureCard icon={BookOpen} title="Journal" desc="Log dine fangster og betingelser" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-6">Sådan virker det</h2>
        <div className="flex flex-col gap-5">
          <Step num={1} title="Opret profil" desc="Fortæl om dit foretrukne fiskeri og udstyr" />
          <Step num={2} title="Match med fiskere" desc="Swipe og match med fiskere nær dig" />
          <Step num={3} title="Planlæg en tur" desc="Opret eller tilmeld dig en fisketur" />
          <Step num={4} title="Del fangsten" desc="Log vejr, betingelser og hvad I fangede" />
        </div>
      </main>
    </div>
  )
}
