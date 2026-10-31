/** Keep listing contact numbers out of buyer-facing Server Component payloads. */
export function hideOwnerContact<T extends { owner_contact?: string | null }>(property: T): T {
  return { ...property, owner_contact: null }
}
