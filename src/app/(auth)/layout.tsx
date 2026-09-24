export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh bg-[#1B4F8A]">
      {children}
    </div>
  )
}
