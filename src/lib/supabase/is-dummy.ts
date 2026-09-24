export function isDummySupabase(): boolean {
  if (process.env.NODE_ENV === 'test') {
    return false
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return !url || url.includes('dummy-pdam-project')
}
