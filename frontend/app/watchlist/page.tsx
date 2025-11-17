'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface WatchlistSymbol {
  symbol: string
  price?: number
  change?: number
  change_percent?: number
  name?: string
  market_cap?: number
  pe_ratio?: number
  error?: string
}

interface Watchlist {
  id: string
  name: string
  symbols: string[]
  symbols_data?: WatchlistSymbol[]
}

export default function WatchlistPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [watchlists, setWatchlists] = useState<Watchlist[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedWatchlist, setSelectedWatchlist] = useState<string | null>(null)
  const [showAddSymbol, setShowAddSymbol] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchWatchlists()
  }, [isAuthenticated])

  const fetchWatchlists = async () => {
    try {
      const data = await api.get<Watchlist[]>('/api/watchlist')
      
      // Fetch prices for all symbols in all watchlists
      const watchlistsWithPrices = await Promise.all(
        data.map(async (watchlist) => {
          if (watchlist.symbols.length === 0) {
            return { ...watchlist, symbols_data: [] }
          }
          
          const symbolsData = await Promise.all(
            watchlist.symbols.map(async (symbol) => {
              try {
                const quote = await api.get(`/api/market/quote/${symbol}`)
                return {
                  symbol,
                  price: quote.price,
                  change: quote.change,
                  change_percent: quote.change_percent,
                  name: quote.name,
                  market_cap: quote.market_cap,
                  pe_ratio: quote.pe_ratio,
                }
              } catch (error) {
                return {
                  symbol,
                  error: 'Failed to fetch price',
                }
              }
            })
          )
          
          return { ...watchlist, symbols_data: symbolsData }
        })
      )
      
      setWatchlists(watchlistsWithPrices)
    } catch (error) {
      console.error('Error fetching watchlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSymbol = async (watchlistId: string, symbol: string) => {
    try {
      // The API expects symbol as a query parameter
      await api.post(`/api/watchlist/${watchlistId}/symbols?symbol=${encodeURIComponent(symbol.toUpperCase())}`)
      setShowAddSymbol(null)
      fetchWatchlists()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to add symbol')
    }
  }

  const handleRemoveSymbol = async (watchlistId: string, symbol: string) => {
    if (!confirm(`Remove ${symbol} from watchlist?`)) return
    
    try {
      await api.delete(`/api/watchlist/${watchlistId}/symbols/${symbol}`)
      fetchWatchlists()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to remove symbol')
    }
  }

  const handleDeleteWatchlist = async (watchlistId: string) => {
    if (!confirm('Delete this watchlist?')) return
    
    try {
      await api.delete(`/api/watchlist/${watchlistId}`)
      fetchWatchlists()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to delete watchlist')
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
            <h1 className="text-3xl font-bold mb-2">My Watchlists</h1>
            <p className="text-gray-600">Track stocks you're interested in</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Create Watchlist
          </button>
        </div>

        {watchlists.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-600 mb-4">No watchlists yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Your First Watchlist
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {watchlists.map((watchlist) => (
              <div key={watchlist.id} className="bg-white rounded-lg border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{watchlist.name}</h2>
                    <p className="text-sm text-gray-500">
                      {watchlist.symbols.length} {watchlist.symbols.length === 1 ? 'symbol' : 'symbols'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddSymbol(watchlist.id)}
                      className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                    >
                      Add Symbol
                    </button>
                    <button
                      onClick={() => handleDeleteWatchlist(watchlist.id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {watchlist.symbols.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">No symbols in this watchlist</p>
                    <button
                      onClick={() => setShowAddSymbol(watchlist.id)}
                      className="text-primary-600 hover:underline text-sm"
                    >
                      Add your first symbol
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Market Cap</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">P/E</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {watchlist.symbols_data?.map((symbolData) => (
                          <tr key={symbolData.symbol} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-semibold">{symbolData.symbol}</div>
                              {symbolData.name && (
                                <div className="text-sm text-gray-500">{symbolData.name}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {symbolData.price !== undefined ? (
                                <span className="font-semibold">${symbolData.price.toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {symbolData.change !== undefined ? (
                                <div className={symbolData.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  <div className="font-semibold">
                                    {symbolData.change >= 0 ? '+' : ''}{symbolData.change.toFixed(2)}
                                  </div>
                                  {symbolData.change_percent !== undefined && (
                                    <div className="text-sm">
                                      {symbolData.change_percent >= 0 ? '+' : ''}{symbolData.change_percent.toFixed(2)}%
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {symbolData.market_cap ? (
                                <span className="text-sm">
                                  ${(symbolData.market_cap / 1e9).toFixed(2)}B
                                </span>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {symbolData.pe_ratio ? (
                                <span>{symbolData.pe_ratio.toFixed(2)}</span>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleRemoveSymbol(watchlist.id, symbolData.symbol)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add Symbol Modal */}
                {showAddSymbol === watchlist.id && (
                  <AddSymbolModal
                    watchlistId={watchlist.id}
                    onClose={() => setShowAddSymbol(null)}
                    onSuccess={() => {
                      setShowAddSymbol(null)
                      fetchWatchlists()
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create Watchlist Modal */}
        {showCreateModal && (
          <CreateWatchlistModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false)
              fetchWatchlists()
            }}
          />
        )}
      </div>
    </div>
  )
}

// Create Watchlist Modal
function CreateWatchlistModal({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/api/watchlist', { name })
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create watchlist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Create Watchlist</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Watchlist Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Watchlist"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              />
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
                {loading ? 'Creating...' : 'Create Watchlist'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// Add Symbol Modal
function AddSymbolModal({ 
  watchlistId, 
  onClose, 
  onSuccess 
}: { 
  watchlistId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [symbol, setSymbol] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post(`/api/watchlist/${watchlistId}/symbols?symbol=${encodeURIComponent(symbol.toUpperCase())}`)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add symbol')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Add Symbol</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Symbol *
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="AAPL"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              />
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
                {loading ? 'Adding...' : 'Add Symbol'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

