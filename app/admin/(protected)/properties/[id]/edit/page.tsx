export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { EditPropertyForm } from './EditPropertyForm'

type PageProps = { params: Promise<{ id: string }> }

export default async function EditPropertyPage({ params }: PageProps) {
  const { id } = await params

  const property = await db.property.findUnique({
    where: { id },
    select: {
      id:            true,
      title:         true,
      location:      true,
      description:   true,
      photos:        true,
      videos:        true,
      propertyPrice: true,
      legalFees:     true,
      otherCosts:    true,
      status:        true,
    },
  })

  if (!property) notFound()

  return (
    <EditPropertyForm
      property={{
        id:            property.id,
        title:         property.title,
        location:      property.location,
        description:   property.description,
        photos:        property.photos,
        videos:        property.videos,
        propertyPrice: Number(property.propertyPrice),
        legalFees:     Number(property.legalFees),
        otherCosts:    Number(property.otherCosts),
        status:        property.status,
      }}
    />
  )
}
