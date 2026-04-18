'use client'

import { useEffect } from 'react'

export default function FinanceError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold mb-2">Dashboard error</h2>
      <p className="text-sm text-gray-500 mb-6">
        The finance dashboard failed to load.
        {error.digest ? <span className="block text-xs mt-1">ID: {error.digest}</span> : null}
      </p>
      <button className="btn btn-teal" onClick={unstable_retry}>
        Retry
      </button>
    </div>
  )
}
