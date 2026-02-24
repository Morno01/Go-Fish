import Link from 'next/link'
import { Fish, MapPin, Search, Users, BookOpen, Heart, Car, Anchor } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-700 via-blue-600 to-blue-500 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-10 pb-4">
        <div className="flex items-center gap-2">
          <Fish size={28} className="text-white" strokeWidth={2} />
          <span className="text-white font-bold text-2xl tracking-tight">Go-Fish</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-white/90 hover:text-white text-sm font-medium px-3 py-1.5 rounded-full border border-white/30 hover:bg-white/10 transition"
          >
            Log ind
          </Link>
          <Link
            href="/register"
            className="bg-white text-blue-700 hover:bg-blue-50 text-sm font-semibold px-4 py-1.5 rounded-full transition shadow-sm"
          >
            Tilmeld
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-6 pb-8 text-center">
        <h1 className="text-white font-bold text-4xl leading-tight mb-3">
          Find din næste<br />
          <span className="text-teal-300">fisketur</span>
        </h1>
        <p className="text-blue-100 text-base mb-8 max-w-xs">
          Match med andre lystfiskere, find samkørsel og planlæg fisketure i hele Danmark.
        </p>

        {/* Search Box */}
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-4 space-y-3">
          <div className="relative">
            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Hvor befinder du dig? (by, postnr.)"
              className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          <div className="relative">
            <Fish size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Hvad eller hvor vil du fiske?"
              className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition shadow-sm"
          >
            <Search size={18} />
            Søg fisketure
          </Link>
        </div>
      </section>

      {/* Cards section */}
      <section className="bg-white rounded-t-3xl px-6 pt-8 pb-24">
        <h2 className="text-gray-900 font-bold text-xl mb-5 text-center">Hvad kan du?</h2>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-8">
          <FeatureCard
            icon={<Car size={24} className="text-blue-600" />}
            title="Samkørsel"
            desc="Del køreturen til din næste fisketur"
            color="bg-blue-50"
          />
          <FeatureCard
            icon={<Anchor size={24} className="text-teal-600" />}
            title="Mødested"
            desc="Mød andre fiskere på stedet"
            color="bg-teal-50"
          />
          <FeatureCard
            icon={<Heart size={24} className="text-rose-500" />}
            title="Match"
            desc="Swipe og find din fiskepartner"
            color="bg-rose-50"
          />
          <FeatureCard
            icon={<BookOpen size={24} className="text-amber-600" />}
            title="Journal"
            desc="Log dine fangster og vejrforhold"
            color="bg-amber-50"
          />
        </div>

        {/* How it works */}
        <div className="max-w-sm mx-auto">
          <h2 className="text-gray-900 font-bold text-xl mb-4 text-center">Sådan virker det</h2>
          <div className="space-y-4">
            <Step num="1" title="Opret profil" desc="Fortæl os hvad du fisker efter og hvilke vandtyper du foretrækker." />
            <Step num="2" title="Find en tur" desc="Se fisketure inddelt i samkørsel og mødesteder." />
            <Step num="3" title="Match & chat" desc="Swipe på fiskere og chat med dem du matcher med." />
            <Step num="4" title="Fisk!" desc="Mød op, fang noget og log det i din journal." />
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-sm mx-auto mt-8 text-center">
          <Link
            href="/register"
            className="block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-base transition shadow-md"
          >
            Kom i gang – det er gratis
          </Link>
          <p className="text-gray-400 text-xs mt-3">Ingen kreditkort krævet</p>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center text-gray-400 text-xs">
          <p>© 2024 Go-Fish · Danmark · <Link href="/privacy" className="hover:text-gray-600">Privatlivspolitik</Link></p>
        </footer>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, desc, color }) {
  return (
    <div className={`${color} rounded-2xl p-4`}>
      <div className="mb-2">{icon}</div>
      <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      <p className="text-gray-500 text-xs mt-0.5 leading-snug">{desc}</p>
    </div>
  )
}

function Step({ num, title, desc }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
        {num}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
        <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
      </div>
    </div>
  )
}
