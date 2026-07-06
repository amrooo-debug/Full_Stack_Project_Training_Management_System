import type { UserRole } from '../types'

type DashboardHeaderProps = {
    title: string
    fullName: string | null
    role: UserRole
    onLogout: () => void
}

function DashboardHeader({
                             title,
                             fullName,
                             role,
                             onLogout,
                         }: DashboardHeaderProps) {
    return (
        <div className="dashboard-header">
            <div>
                <h1 className="dashboard-title">{title}</h1>
                <p className="dashboard-welcome">Welcome, {fullName}!</p>
                <span className={`user-role role-${role}`}>{role}</span>
            </div>

            <button className="login-button" onClick={onLogout}>
                Logout
            </button>
        </div>
    )
}

export default DashboardHeader