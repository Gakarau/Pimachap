'use client'

import { useEffect } from 'react'

export default function Error({
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Something went wrong
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        Please try again or come back later.
        {error.digest ? (
          <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Error ID: {error.digest}
          </span>
        ) : null}
      </p>
      <button
        onClick={unstable_retry}
        className="btn btn-teal"
      >
        Try again
      </button>
    </div>
  )
}
