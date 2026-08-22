import { getPopularCities } from '@/actions/catalog-actions'
import { NewTripForm } from '@/components/new-trip-form'

export default async function NewTripPage() {
  let cities: Awaited<ReturnType<typeof getPopularCities>> = []
  try {
    cities = await getPopularCities()
  } catch {
    cities = []
  }

  return <NewTripForm suggestions={cities} />
}
