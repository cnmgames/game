import { generateGameMetadata } from '../../lib/seo'
import type { ReactNode } from 'react'

export const metadata = generateGameMetadata('gay')

export default function GameLayout({ children }: { children: ReactNode }) {
  return children
}
