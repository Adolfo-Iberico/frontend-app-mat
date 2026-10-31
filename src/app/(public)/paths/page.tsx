import { LearningPathCard } from "@/components/learning-path-card";
import { getUnitPaths } from "@/app/actions";
import type { LearningPath } from "@/lib/types";

export default async function LearningPathsPage() {
  const unitPaths = await getUnitPaths();

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl">Unidades Temáticas</h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
          Las lecciones agrupadas por unidad: empieza por lo básico y avanza hacia los temas avanzados.
        </p>
      </div>
      {unitPaths.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {unitPaths.map((path) => (
            <LearningPathCard key={path.id} path={path as unknown as LearningPath} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-card/50">
          <h2 className="text-2xl font-semibold mb-2">Inicia sesión para ver las unidades</h2>
          <p className="text-muted-foreground">Las lecciones están disponibles para tu grado escolar.</p>
        </div>
      )}
    </div>
  );
}
