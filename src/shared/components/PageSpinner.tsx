export default function PageSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
    </div>
  )
}
