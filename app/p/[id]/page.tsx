import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { isUUID } from '@/lib/is-uuid'

export default async function ShareLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const { id } = await params
  if (!isUUID(id)) notFound()

  const { ref } = await searchParams

  if (ref) {
    const cookieStore = await cookies()
    cookieStore.set('orenzaa_ref', ref, {
      maxAge: 60 * 60 * 24,
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
    })
  }

  redirect(`/property/${id}`)
}
