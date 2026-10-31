
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function HomePageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col animate-pulse">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden py-12 sm:py-16 md:py-20 lg:py-32 xl:py-40">
          <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center">
              <Skeleton className="h-16 w-3/4 max-w-4xl mb-6" />
              <Skeleton className="h-6 w-1/2 max-w-2xl mb-12" />
              <Skeleton className="h-[480px] w-full max-w-6xl mb-12" />
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Skeleton className="h-12 w-full sm:w-1/2" />
                <Skeleton className="h-12 w-full sm:w-1/2" />
              </div>
            </div>
          </div>
        </section>

        {/* Partners Marquee Skeleton */}
        <div className="w-full py-6 border-y">
            <div className="flex justify-around">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-32" />)}
            </div>
        </div>

        {/* Stats Band Skeleton */}
        <section className="py-16 md:py-24">
             <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                             <Skeleton className="h-9 w-9 rounded-full" />
                             <Skeleton className="h-6 w-20" />
                             <Skeleton className="h-4 w-24" />
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Featured Courses Skeleton */}
        <section className="bg-background py-12 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <Skeleton className="h-8 w-48 mb-3" />
              <Skeleton className="h-5 w-64" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="p-0">
                    <Skeleton className="h-48 w-full" />
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex justify-between items-center">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-10 w-32" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
