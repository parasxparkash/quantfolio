'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SignInPromptProps {
  onClose: () => void
  message?: string
}

export default function SignInPrompt({ onClose, message }: SignInPromptProps) {
  const router = useRouter()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
        <p className="text-gray-600 mb-6">
          {message || 'Please sign in to save your data. You can continue browsing without signing in.'}
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <Link
            href="/login"
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="flex-1 px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 text-center"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}

