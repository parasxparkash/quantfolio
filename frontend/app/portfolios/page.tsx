'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface Portfolio {
  id: string
  name: string
  description?: string
  total_value: number
  total_cost: number
  total_gain_loss: number
  total_gain_loss_percent: number
  today_change?: number
  today_change_percent?: number
  holdings_count: number
}

export default function PortfoliosPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
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
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Portfolios</h1>
            <p className="text-gray-600">Manage your investment portfolios</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Create Portfolio
          </button>
        </div>

        {portfolios.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-600 mb-4">No portfolios yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Your First Portfolio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <Link
                key={portfolio.id}
                href={`/portfolios/${portfolio.id}`}
                className="bg-white p-6 rounded-lg border hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{portfolio.name}</h2>
                    {portfolio.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{portfolio.description}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Value</span>
                    <span className="font-semibold">${portfolio.total_value.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Cost</span>
                    <span>${portfolio.total_cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Gain/Loss</span>
                    <span className={`font-semibold ${
                      portfolio.total_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {portfolio.total_gain_loss >= 0 ? '+' : ''}${portfolio.total_gain_loss.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Return</span>
                    <span className={`font-semibold ${
                      portfolio.total_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {portfolio.total_gain_loss_percent >= 0 ? '+' : ''}{portfolio.total_gain_loss_percent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 pt-2 border-t">
                    <span>Holdings</span>
                    <span>{portfolio.holdings_count}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Create Portfolio Modal */}
        {showCreateModal && (
          <CreatePortfolioModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false)
              fetchPortfolios()
            }}
          />
        )}
      </div>
    </div>
  )
}

// Create Portfolio Modal Component
function CreatePortfolioModal({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/api/portfolios', {
        name,
        description: description || null,
        is_public: isPublic,
      })

      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create portfolio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Create Portfolio</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portfolio Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Investment Portfolio"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700">
                Make this portfolio public
              </label>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Portfolio'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

