import type { AppProps } from 'next/app'
import { ClerkProvider } from '@clerk/nextjs'

// This file ensures compatibility between app and pages router for Clerk
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <Component {...pageProps} />
    </ClerkProvider>
  )
}