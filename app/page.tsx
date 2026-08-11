import { Hero } from "@/components/Hero";
import { getPublicCoverageBoundary } from "@/lib/config";

export default function Home() {
  const initialBoundary = getPublicCoverageBoundary();

  return (
    <main className="h-screen bg-mustard text-ink">
      <Hero initialBoundary={initialBoundary} />
    </main>
  );
}
