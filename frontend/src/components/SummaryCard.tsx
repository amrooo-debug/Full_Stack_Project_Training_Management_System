type SummaryCardProps = {
    label: string
    value: string | number
}

// Small presentational card used in the dashboard summary grids.
// Renders the same DOM/classes the dashboards used before, so the
// look is unchanged; it just removes the repeated markup.
function SummaryCard({ label, value }: SummaryCardProps) {
    return (
        <div className="summary-card">
            <span className="summary-label">{label}</span>
            <strong className="summary-value">{value}</strong>
        </div>
    )
}

export default SummaryCard
