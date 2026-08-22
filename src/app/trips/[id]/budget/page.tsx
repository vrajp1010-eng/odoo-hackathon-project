import { getTrip } from '@/actions/trip-actions';
import { getBudgetSummary } from '@/actions/budget-actions';
import { notFound } from 'next/navigation';
import { BudgetCharts } from '@/components/budget-charts';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function BudgetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await getTrip(id);

  if (!trip) {
    notFound();
  }

  const budget = await getBudgetSummary(id);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center">
        <Link href={`/trips/${id}`} className={buttonVariants({ variant: 'ghost' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trip
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Budget & Expenses</h1>
        <p className="text-muted-foreground mt-2">{trip.title}</p>
      </div>

      <BudgetCharts budget={budget} trip={trip} />
    </div>
  );
}
