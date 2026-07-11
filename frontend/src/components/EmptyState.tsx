import type { ReactNode } from 'react'

type EmptyStateProps = {
    children: ReactNode
}

// Soft neutral box shown when a list is empty. Renders the same
// DOM/class the dashboards used before, so the look is unchanged.
function EmptyState({ children }: EmptyStateProps) {
    return <p className="empty-state">{children}</p>
}

export default EmptyState
