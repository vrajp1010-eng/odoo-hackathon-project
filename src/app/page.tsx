import Link from 'next/link'
import { Map, Wallet, Users, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { getPopularCities } from '@/actions/catalog-actions'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LandingPage() {
  let popularCities = []
  try {
    popularCities = await getPopularCities()
  } catch (error) {
    // Fallback if action fails or not implemented yet
    popularCities = [
      { id: '1', name: 'Paris', country: 'France', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e90761ea006?w=800&q=80' },
      { id: '2', name: 'Tokyo', country: 'Japan', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80' },
      { id: '3', name: 'New York', country: 'USA', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80' }
    ]
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Plan Your Dream Journey
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Design perfect multi-city adventures, manage your budget, and collaborate with friends in one seamless experience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className={buttonVariants({ size: "lg", className: "bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto font-semibold" })}>
              Start Planning
            </Link>
            <Link href="/dashboard" className={buttonVariants({ size: "lg", variant: "outline", className: "border-white text-white hover:bg-white/20 w-full sm:w-auto bg-transparent" })}>
              Explore <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything You Need</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Globe Trotter provides powerful tools to make your travel planning effortless.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-md bg-white">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Map className="h-6 w-6" />
                </div>
                <CardTitle>Multi-City Planning</CardTitle>
                <CardDescription>Seamlessly organize complex itineraries across different destinations.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-none shadow-md bg-white">
              <CardHeader>
                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6" />
                </div>
                <CardTitle>Smart Budgeting</CardTitle>
                <CardDescription>Keep track of expenses and split costs evenly among travel buddies.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-none shadow-md bg-white">
              <CardHeader>
                <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle>Share with Friends</CardTitle>
                <CardDescription>Collaborate in real-time and make decisions together as a group.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Popular Destinations</h2>
            <p className="text-lg text-gray-600">Discover where our users are traveling next.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {popularCities.map((city: any) => (
              <div key={city.id} className="group relative rounded-xl overflow-hidden h-64 shadow-md cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-1">{city.name}</h3>
                  <p className="text-gray-200">{city.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <Map className="h-6 w-6" />
            <span className="text-xl font-bold">Globe Trotter</span>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
          <p>© {new Date().getFullYear()} Globe Trotter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
