'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SchoolForm } from '@/features/schools/components/school-form';

export default function NewSchoolPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nouvelle école</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <SchoolForm onSaved={(id) => router.push(`/schools/${id}`)} />
        </CardContent>
      </Card>
    </div>
  );
}
