
'use client';

import { useState, useMemo } from 'react';
import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ListFilter, X } from "lucide-react";
import type { Course } from '@/lib/types';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';


interface CoursesClientProps {
  allCourses: Course[];
  allCategories: string[];
  allLevels: string[];
}

export function CoursesClient({ allCourses, allCategories, allLevels }: CoursesClientProps) {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Filter State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
  }

  const activeFilterCount = selectedCategories.length + selectedLevels.length;

  const filteredCourses = useMemo(() => {
    return allCourses.filter(course => {
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(course.category!);
      const levelMatch = selectedLevels.length === 0 || selectedLevels.includes(course.level!);
      return categoryMatch && levelMatch;
    });
  }, [allCourses, selectedCategories, selectedLevels]);


  const FilterContent = () => (
    <div className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ListFilter className="w-5 h-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 overflow-y-auto">
        <fieldset className="space-y-4">
          <legend className="font-semibold text-lg mb-2">Unidad temática</legend>
          <div className="space-y-3">
            {allCategories.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryChange(category)}
                />
                <Label htmlFor={`cat-${category}`} className="font-normal cursor-pointer">{category}</Label>
              </div>
            ))}
          </div>
        </fieldset>
        <fieldset className="space-y-4">
          <legend className="font-semibold text-lg mb-2">Nivel</legend>
          <div className="space-y-3">
            {allLevels.map(level => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={`lvl-${level}`}
                  checked={selectedLevels.includes(level)}
                  onCheckedChange={() => handleLevelChange(level)}
                />
                <Label htmlFor={`lvl-${level}`} className="font-normal cursor-pointer">{level}</Label>
              </div>
            ))}
          </div>
        </fieldset>
      </CardContent>
      <SheetFooter className="p-4 bg-background border-t sticky bottom-0">
          <div className='w-full grid grid-cols-2 gap-3'>
              <Button variant="outline" onClick={clearFilters} disabled={activeFilterCount === 0}>Limpiar</Button>
              <Button className="w-full" onClick={() => setIsFilterSheetOpen(false)}>
                Aplicar filtros {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
          </div>
      </SheetFooter>
    </div>
  );

  if (!allCourses) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="grid lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-24">
          <Card>
            <FilterContent />
          </Card>
        </aside>

         {/* Mobile Filter Button */}
          <div className="lg:hidden flex items-center justify-between col-span-full">
             <h2 className="text-xl font-semibold">Lecciones</h2>
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        <ListFilter className="w-4 h-4" />
                        <span>Filtros {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0" aria-describedby={undefined} aria-description={undefined}>
                     <SheetHeader className="p-4 border-b">
                        <SheetTitle className="text-center">Filtros</SheetTitle>
                    </SheetHeader>
                   <FilterContent />
                </SheetContent>
            </Sheet>
        </div>


        <main className="lg:col-span-3">
          {/* Active Filters Chips */}
           {activeFilterCount > 0 && (
                <div className="mb-6 flex flex-wrap gap-2 items-center">
                    <h3 className="text-sm font-semibold">Filtros Activos:</h3>
                    {selectedCategories.map(c => (
                        <Badge key={c} variant="secondary" className="pl-2 pr-1">
                            {c}
                            <button onClick={() => handleCategoryChange(c)} className="ml-1 rounded-full hover:bg-background/50 p-0.5"><X className="w-3 h-3"/></button>
                        </Badge>
                    ))}
            {selectedLevels.map(l => (
                     <Badge key={l} variant="secondary" className="pl-2 pr-1">
                         {l}
                         <button onClick={() => handleLevelChange(l)} className="ml-1 rounded-full hover:bg-background/50 p-0.5"><X className="w-3 h-3"/></button>
                     </Badge>
                 ))}
                     <Button variant="ghost" size="sm" className="text-primary hover:text-primary h-auto p-1" onClick={clearFilters}>
                         Limpiar todo
                     </Button>
                 </div>
             )}

            {filteredCourses.length > 0 ? (
                 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                    {filteredCourses.map((course) => (
                        <div
                          key={course.id}
                          className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-sky-200/50 via-sky-100/10 to-indigo-200/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-sky-100/60"
                          style={{ perspective: 1000 }}
                        >
                          <div className="rounded-2xl ring-1 ring-border/60 bg-card transition-transform duration-300 group-hover:-rotate-[0.6deg]">
                            <CourseCard course={course as Course} />
                          </div>
                          {/* sheen */}
                          <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 [background:linear-gradient(120deg,transparent,rgba(255,255,255,.35),transparent)] transition-opacity duration-500" />
                        </div>
                    ))}
                </div>
             ) : (
                <div className="text-center py-16 border rounded-lg bg-card">
                    <h3 className="text-xl font-semibold">
                      {allCourses.length === 0 ? 'No hay lecciones disponibles' : 'No se encontraron lecciones'}
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      {allCourses.length === 0
                        ? 'Inicia sesión con tu cuenta para ver las lecciones de tu grado.'
                        : 'Intenta ajustar tus filtros para encontrar lo que buscas.'}
                    </p>
                    {allCourses.length > 0 && <Button variant="outline" className="mt-4" onClick={clearFilters}>Limpiar Filtros</Button>}
                </div>
            )}
        </main>
      </div>
  );
}
