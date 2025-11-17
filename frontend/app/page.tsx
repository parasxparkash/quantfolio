import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Quantfolio</h1>
        <p className="text-xl mb-8">Track your investment portfolio with real-time market data</p>
        
        <div className="flex gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  )
}

