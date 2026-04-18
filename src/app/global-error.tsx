'use client'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          background: '#f9fafb',
          color: '#111827',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Something went wrong
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem', maxWidth: '400px' }}>
          An unexpected error occurred. Please try again.
          {error.digest ? (
            <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Error ID: {error.digest}
            </span>
          ) : null}
        </p>
        <button
          onClick={unstable_retry}
          style={{
            padding: '0.625rem 1.25rem',
            background: '#0a8f94',
            color: '#fff',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
