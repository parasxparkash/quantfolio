/**
 * LocalStorage utilities for temporary data storage
 * Used to store data for unauthenticated users until they sign in
 */

const STORAGE_KEYS = {
  TEMP_PORTFOLIOS: 'quantfolio_temp_portfolios',
  TEMP_HOLDINGS: 'quantfolio_temp_holdings',
  TEMP_TRANSACTIONS: 'quantfolio_temp_transactions',
  TEMP_WATCHLISTS: 'quantfolio_temp_watchlists',
}

export const localStorageUtils = {
  // Portfolios
  getTempPortfolios: (): any[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.TEMP_PORTFOLIOS)
    return data ? JSON.parse(data) : []
  },

  saveTempPortfolio: (portfolio: any) => {
    if (typeof window === 'undefined') return
    const portfolios = localStorageUtils.getTempPortfolios()
    portfolios.push({ ...portfolio, id: `temp_${Date.now()}`, isTemp: true })
    localStorage.setItem(STORAGE_KEYS.TEMP_PORTFOLIOS, JSON.stringify(portfolios))
  },

  clearTempPortfolios: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.TEMP_PORTFOLIOS)
  },

  // Holdings
  getTempHoldings: (portfolioId: string): any[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(`${STORAGE_KEYS.TEMP_HOLDINGS}_${portfolioId}`)
    return data ? JSON.parse(data) : []
  },

  saveTempHolding: (portfolioId: string, holding: any) => {
    if (typeof window === 'undefined') return
    const holdings = localStorageUtils.getTempHoldings(portfolioId)
    holdings.push({ ...holding, id: `temp_${Date.now()}`, isTemp: true })
    localStorage.setItem(`${STORAGE_KEYS.TEMP_HOLDINGS}_${portfolioId}`, JSON.stringify(holdings))
  },

  clearTempHoldings: (portfolioId: string) => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(`${STORAGE_KEYS.TEMP_HOLDINGS}_${portfolioId}`)
  },

  // Transactions
  getTempTransactions: (portfolioId: string): any[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(`${STORAGE_KEYS.TEMP_TRANSACTIONS}_${portfolioId}`)
    return data ? JSON.parse(data) : []
  },

  saveTempTransaction: (portfolioId: string, transaction: any) => {
    if (typeof window === 'undefined') return
    const transactions = localStorageUtils.getTempTransactions(portfolioId)
    transactions.push({ ...transaction, id: `temp_${Date.now()}`, isTemp: true })
    localStorage.setItem(`${STORAGE_KEYS.TEMP_TRANSACTIONS}_${portfolioId}`, JSON.stringify(transactions))
  },

  clearTempTransactions: (portfolioId: string) => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(`${STORAGE_KEYS.TEMP_TRANSACTIONS}_${portfolioId}`)
  },

  // Watchlists
  getTempWatchlists: (): any[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.TEMP_WATCHLISTS)
    return data ? JSON.parse(data) : []
  },

  saveTempWatchlist: (watchlist: any) => {
    if (typeof window === 'undefined') return
    const watchlists = localStorageUtils.getTempWatchlists()
    watchlists.push({ ...watchlist, id: `temp_${Date.now()}`, isTemp: true })
    localStorage.setItem(STORAGE_KEYS.TEMP_WATCHLISTS, JSON.stringify(watchlists))
  },

  clearTempWatchlists: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.TEMP_WATCHLISTS)
  },

  // Clear all temp data
  clearAll: () => {
    if (typeof window === 'undefined') return
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    // Also clear holdings and transactions for all portfolios
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_KEYS.TEMP_HOLDINGS) || key?.startsWith(STORAGE_KEYS.TEMP_TRANSACTIONS)) {
        localStorage.removeItem(key)
      }
    }
  },
}

