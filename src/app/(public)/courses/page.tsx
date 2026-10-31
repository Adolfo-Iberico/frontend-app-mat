
import { getPublicCourses, getDistinctCategories, getDistinctLevels } from "@/app/actions";
import type { Course } from '@/lib/types';
import { CoursesClient } from "./components/courses-client";

export default async function CoursesPage() {
    const [courses, categories, levels] = await Promise.all([
        getPublicCourses(),
        getDistinctCategories(),
        getDistinctLevels(),
    ]);

    return (
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl">Explora Nuestras Lecciones</h1>
                <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
                Lecciones de matemáticas publicadas para tu grado escolar: estudia y evalúate en línea.
                </p>
            </div>

            <CoursesClient
                allCourses={courses as Course[]}
                allCategories={categories}
                allLevels={levels}
            />
        </div>
    );
}
