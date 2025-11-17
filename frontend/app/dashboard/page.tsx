'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Allow unauthenticated users to view (will show empty state)
    fetchPortfolios()
  }, [isAuthenticated])

  const fetchPortfolios = async () => {
    try {
      const data = await api.get('/api/portfolios')
      setPortfolios(data)
    } catch (error) {
      console.error('Error fetching portfolios:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            {!isAuthenticated && (
              <p className="text-sm text-gray-500 mt-1">
                Sign in to save your portfolios
              </p>
            )}
          </div>
          {isAuthenticated ? (
            <Link
              href="/portfolios"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              New Portfolio
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Sign In to Save
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((portfolio) => (
            <Link
              key={portfolio.id}
              href={`/portfolios/${portfolio.id}`}
              className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{portfolio.name}</h2>
              {portfolio.description && (
                <p className="text-gray-600 mb-4">{portfolio.description}</p>
              )}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Total Value:</span>
                  <span className="font-semibold">${portfolio.total_value?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Cost:</span>
                  <span>${portfolio.total_cost?.toFixed(2) || '0.00'}</span>
                </div>
                {portfolio.total_gain_loss !== undefined && (
                  <div className="flex justify-between mt-2 pt-2 border-t">
                    <span>Gain/Loss:</span>
                    <span className={`font-semibold ${
                      portfolio.total_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {portfolio.total_gain_loss >= 0 ? '+' : ''}${portfolio.total_gain_loss?.toFixed(2) || '0.00'} 
                      ({portfolio.total_gain_loss_percent?.toFixed(2) || '0.00'}%)
                    </span>
                  </div>
                )}
                {portfolio.holdings_count !== undefined && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Holdings:</span>
                    <span>{portfolio.holdings_count}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {portfolios.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No portfolios yet</p>
            <Link
              href="/portfolios/new"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Your First Portfolio
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

