// Given a role, return the dashboard path it belongs to.
// Kept in its own small file so both LoginPage and App can share it
// without tripping React Fast Refresh (which wants component files to
// export only components).
export function dashboardPathForRole(role: string | null) {
  if (role === 'ADMIN') return '/admin'
  if (role === 'TRAINER') return '/trainer'
  if (role === 'TRAINEE') return '/trainee'
  return '/login'
}
