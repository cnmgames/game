import { generateGameMetadata } from '../../lib/seo'
import type { ReactNode } from 'react'

export const metadata = generateGameMetadata('telepathy')

export default function GameLayout({ children }: { children: ReactNode }) {
  return children
}
