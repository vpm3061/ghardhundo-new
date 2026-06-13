import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ShareLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const { id } = await params
  const { ref } = await searchParams

  if (ref) {
    const cookieStore = await cookies()
    cookieStore.set('ghardhundo_ref', ref, {
      maxAge: 60 * 60 * 24,
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
    })
  }

  redirect(`/property/${id}`)
}
