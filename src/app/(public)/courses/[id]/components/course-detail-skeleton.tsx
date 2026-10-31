
import { Skeleton } from '@/components/ui/skeleton';

export function CourseDetailSkeleton() {
  return (
    <div className="bg-muted/30">
      <header className="bg-primary/80 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 grid lg:grid-cols-3 lg:gap-12">
        <main className="lg:col-span-2 space-y-8">
          <Skeleton className="h-8 w-1/3" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </div>
          <Skeleton className="h-8 w-1/2" />
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </main>
        <aside className="lg:col-span-1 space-y-6 mt-8 lg:mt-0">
          <Skeleton className="h-[500px] w-full" />
        </aside>
      </div>
    </div>
  );
}
