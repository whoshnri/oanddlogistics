import { Hero } from "@/components/Hero";
import { getPublicCoverageBoundary } from "@/lib/config";

export default function Home() {
  const initialBoundary = getPublicCoverageBoundary();

  return (
    <main className="min-h-svh bg-mustard text-ink">
      <Hero initialBoundary={initialBoundary} />
    </main>
  );
}
