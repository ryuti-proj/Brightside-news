export function getAdminToken() {
  if (typeof window === "undefined") return null

  return (
    localStorage.getItem("admin_token") ||
    sessionStorage.getItem("admin_token")
  )
}