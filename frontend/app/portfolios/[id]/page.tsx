'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import SignInPrompt from '@/components/SignInPrompt'

interface Holding {
  id: string
  symbol: string
  quantity: number
  average_cost: number
  current_price?: number
  current_value?: number
  total_cost?: number
  gain_loss?: number
  gain_loss_percent?: number
  price_change?: number
  price_change_percent?: number
  name?: string
  market_cap?: number
  pe_ratio?: number
}

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
  holdings?: Holding[]
}

interface Transaction {
  id: string
  symbol: string
  type: 'buy' | 'sell' | 'dividend' | 'split'
  quantity: number
  price: number
  date: string
  fees: number
  notes?: string
}

export default function PortfolioDetailPage() {
  const router = useRouter()
  const params = useParams()
  const portfolioId = params.id as string
  const { isAuthenticated } = useAuthStore()
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'holdings' | 'transactions'>('holdings')
  const [showAddHolding, setShowAddHolding] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showSignInPrompt, setShowSignInPrompt] = useState(false)

  useEffect(() => {
    // Allow unauthenticated users to view public portfolios
    fetchPortfolio()
  }, [isAuthenticated, portfolioId])

  const fetchPortfolio = async () => {
    try {
      const data = await api.get<Portfolio>(`/api/portfolios/${portfolioId}`)
      setPortfolio(data)
    } catch (error) {
      console.error('Error fetching portfolio:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const data = await api.get<Transaction[]>(`/api/transactions/portfolio/${portfolioId}`)
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  useEffect(() => {
    if (activeTab === 'transactions' && portfolioId) {
      fetchTransactions()
    }
  }, [activeTab, portfolioId])

  const handleDeleteHolding = async (holdingId: string) => {
    if (!isAuthenticated) {
      setShowSignInPrompt(true)
      return
    }

    if (!confirm('Are you sure you want to remove this holding?')) return
    
    try {
      await api.delete(`/api/holdings/${holdingId}`)
      fetchPortfolio() // Refresh portfolio data
    } catch (error) {
      console.error('Error deleting holding:', error)
      alert('Failed to delete holding')
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!isAuthenticated) {
      setShowSignInPrompt(true)
      return
    }

    if (!confirm('Are you sure you want to delete this transaction?')) return
    
    try {
      await api.delete(`/api/transactions/${transactionId}`)
      fetchTransactions() // Refresh transactions
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Failed to delete transaction')
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

  if (!portfolio) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Portfolio not found</p>
            <Link href="/dashboard" className="text-primary-600 hover:underline">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const holdings = portfolio.holdings || []
  const totalAllocation = holdings.reduce((sum, h) => sum + (h.current_value || 0), 0)

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-primary-600 hover:underline mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{portfolio.name}</h1>
              {portfolio.description && (
                <p className="text-gray-600">{portfolio.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              {isAuthenticated ? (
                <button
                  onClick={() => setShowAddHolding(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add Holding
                </button>
              ) : (
                <button
                  onClick={() => setShowSignInPrompt(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Sign In to Add Holding
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">Total Value</div>
            <div className="text-2xl font-bold">${portfolio.total_value.toFixed(2)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">Total Cost</div>
            <div className="text-2xl font-bold">${portfolio.total_cost.toFixed(2)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">Total Gain/Loss</div>
            <div className={`text-2xl font-bold ${
              portfolio.total_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {portfolio.total_gain_loss >= 0 ? '+' : ''}${portfolio.total_gain_loss.toFixed(2)}
            </div>
            <div className={`text-sm ${
              portfolio.total_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {portfolio.total_gain_loss_percent >= 0 ? '+' : ''}{portfolio.total_gain_loss_percent.toFixed(2)}%
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">Holdings</div>
            <div className="text-2xl font-bold">{portfolio.holdings_count}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('holdings')}
              className={`pb-2 px-1 border-b-2 ${
                activeTab === 'holdings'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Holdings
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`pb-2 px-1 border-b-2 ${
                activeTab === 'transactions'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Transactions
            </button>
          </div>
        </div>

        {/* Holdings Tab */}
        {activeTab === 'holdings' && (
          <div className="bg-white rounded-lg border overflow-hidden">
            {holdings.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600 mb-4">No holdings yet</p>
                <button
                  onClick={() => setShowAddHolding(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add Your First Holding
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gain/Loss</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {holdings.map((holding) => {
                      const allocation = totalAllocation > 0 
                        ? ((holding.current_value || 0) / totalAllocation * 100).toFixed(2)
                        : '0.00'
                      
                      return (
                        <tr key={holding.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold">{holding.symbol}</div>
                            {holding.name && (
                              <div className="text-sm text-gray-500">{holding.name}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{holding.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap">${holding.average_cost.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {holding.current_price !== undefined ? (
                              <div>
                                <div className="font-semibold">${holding.current_price.toFixed(2)}</div>
                                {holding.price_change !== undefined && (
                                  <div className={`text-sm ${
                                    holding.price_change >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {holding.price_change >= 0 ? '+' : ''}{holding.price_change.toFixed(2)} 
                                    ({holding.price_change_percent?.toFixed(2)}%)
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ${(holding.current_value || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {holding.gain_loss !== undefined ? (
                              <div className={holding.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}>
                                <div className="font-semibold">
                                  {holding.gain_loss >= 0 ? '+' : ''}${holding.gain_loss.toFixed(2)}
                                </div>
                                <div className="text-sm">
                                  {holding.gain_loss_percent !== undefined && (
                                    <>
                                      {holding.gain_loss_percent >= 0 ? '+' : ''}{holding.gain_loss_percent.toFixed(2)}%
                                    </>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{allocation}%</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isAuthenticated ? (
                              <button
                                onClick={() => handleDeleteHolding(holding.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">Sign in to remove</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Transaction History</h2>
              {isAuthenticated ? (
                <button
                  onClick={() => setShowAddTransaction(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                >
                  Add Transaction
                </button>
              ) : (
                <button
                  onClick={() => setShowSignInPrompt(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                >
                  Sign In to Add
                </button>
              )}
            </div>

            {transactions.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600 mb-4">No transactions yet</p>
                <button
                  onClick={() => setShowAddTransaction(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add Your First Transaction
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fees</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((transaction) => {
                      const total = transaction.quantity * transaction.price
                      const date = new Date(transaction.date)
                      
                      return (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {date.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold">
                            {transaction.symbol}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              transaction.type === 'buy' ? 'bg-green-100 text-green-800' :
                              transaction.type === 'sell' ? 'bg-red-100 text-red-800' :
                              transaction.type === 'dividend' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{transaction.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap">${transaction.price.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold">
                            ${total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {transaction.fees > 0 ? `$${transaction.fees.toFixed(2)}` : '-'}
                          </td>
                          <td className="px-6 py-4">
                            {transaction.notes ? (
                              <span className="text-sm text-gray-600" title={transaction.notes}>
                                {transaction.notes.length > 30 
                                  ? transaction.notes.substring(0, 30) + '...' 
                                  : transaction.notes}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isAuthenticated ? (
                              <button
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Delete
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">Sign in to delete</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Holding Modal */}
        {showAddHolding && (
          <AddHoldingModal
            portfolioId={portfolioId}
            onClose={() => setShowAddHolding(false)}
            onSuccess={() => {
              setShowAddHolding(false)
              fetchPortfolio()
            }}
          />
        )}

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <AddTransactionModal
            portfolioId={portfolioId}
            onClose={() => setShowAddTransaction(false)}
            onSuccess={() => {
              setShowAddTransaction(false)
              fetchTransactions()
            }}
          />
        )}

        {/* Sign In Prompt */}
        {showSignInPrompt && (
          <SignInPrompt
            onClose={() => setShowSignInPrompt(false)}
            message="Please sign in to save your data. Your changes will be saved to your account."
          />
        )}
      </div>
    </div>
  )
}

// Add Holding Modal Component
function AddHoldingModal({ 
  portfolioId, 
  onClose, 
  onSuccess 
}: { 
  portfolioId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [averageCost, setAverageCost] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { isAuthenticated } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      setError('Please sign in to save holdings')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Fetch current price if average cost not provided
      let cost = parseFloat(averageCost)
      if (!cost && symbol) {
        try {
          const quote = await api.get(`/api/market/quote/${symbol.toUpperCase()}`)
          cost = quote.price
          setAverageCost(cost.toString())
        } catch (err) {
          // If price fetch fails, use 0 or require user input
          setError('Could not fetch price. Please enter average cost manually.')
          setLoading(false)
          return
        }
      }

      await api.post('/api/holdings', {
        portfolio_id: portfolioId,
        symbol: symbol.toUpperCase(),
        quantity: parseFloat(quantity),
        average_cost: cost,
      })

      onSuccess()
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Please sign in to save holdings')
      } else {
        setError(err.response?.data?.detail || 'Failed to add holding')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Add Holding</h2>
        
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Cost *
              </label>
              <input
                type="number"
                step="0.01"
                value={averageCost}
                onChange={(e) => setAverageCost(e.target.value)}
                placeholder="Auto-filled from current price"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to auto-fill from current market price
              </p>
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
                {loading ? 'Adding...' : 'Add Holding'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// Add Transaction Modal Component
function AddTransactionModal({ 
  portfolioId, 
  onClose, 
  onSuccess 
}: { 
  portfolioId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [symbol, setSymbol] = useState('')
  const [type, setType] = useState<'buy' | 'sell' | 'dividend' | 'split'>('buy')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [fees, setFees] = useState('0')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { isAuthenticated } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      setError('Please sign in to save transactions')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Fetch current price if price not provided
      let transactionPrice = parseFloat(price)
      if (!transactionPrice && symbol) {
        try {
          const quote = await api.get(`/api/market/quote/${symbol.toUpperCase()}`)
          transactionPrice = quote.price
          setPrice(transactionPrice.toString())
        } catch (err) {
          setError('Could not fetch price. Please enter price manually.')
          setLoading(false)
          return
        }
      }

      await api.post('/api/transactions', {
        portfolio_id: portfolioId,
        symbol: symbol.toUpperCase(),
        type,
        quantity: parseFloat(quantity),
        price: transactionPrice,
        date: new Date(date).toISOString(),
        fees: parseFloat(fees) || 0,
        notes: notes || null,
      })

      onSuccess()
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Please sign in to save transactions')
      } else {
        setError(err.response?.data?.detail || 'Failed to add transaction')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Add Transaction</h2>
        
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
                <option value="dividend">Dividend</option>
                <option value="split">Split</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="10"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Auto-filled from current price"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to auto-fill
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fees
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
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
                {loading ? 'Adding...' : 'Add Transaction'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
