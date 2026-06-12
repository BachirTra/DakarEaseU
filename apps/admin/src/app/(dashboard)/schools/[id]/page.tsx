'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSchool } from '@/features/schools/hooks/use-schools';
import { SchoolForm } from '@/features/schools/components/school-form';

export default function SchoolDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: school, isLoading } = useSchool(params.id);

  if (isLoading || !school) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{school.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <SchoolForm school={school} />
        </CardContent>
      </Card>
    </div>
  );
}
