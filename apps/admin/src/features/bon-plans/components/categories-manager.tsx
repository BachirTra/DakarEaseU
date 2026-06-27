'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCategories, useCreateCategory, useDeleteCategory } from '../hooks/use-categories';

export function CategoriesManager() {
  const { data: categories = [], isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();
  const [name, setName] = useState('');

  function handleCreate() {
    if (!name.trim()) return;
    createMutation.mutate(name.trim());
    setName('');
  }

  if (isLoading) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-1">
            <Badge variant="secondary">{cat.name}</Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (confirm(`Supprimer la catégorie "${cat.name}" ?`))
                  deleteMutation.mutate(cat.id);
              }}
            >
              ×
            </Button>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune catégorie.</p>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Nom de la catégorie"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <Button
          type="button"
          disabled={createMutation.isPending || !name.trim()}
          onClick={handleCreate}
        >
          Ajouter
        </Button>
      </div>
    </div>
  );
}
