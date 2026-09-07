import { generateGameMetadata } from '../../lib/seo'
import type { ReactNode } from 'react'

export const metadata = generateGameMetadata('beast')

export default function GameLayout({ children }: { children: ReactNode }) {
  return children
}
