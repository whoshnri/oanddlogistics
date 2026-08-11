import { CoverageChecker } from "@/components/CoverageChecker";
import { getPublicCoverageBoundary, getPublicDefaultMapZoom } from "@/lib/config";

export default function Home() {
  const initialBoundary = getPublicCoverageBoundary();
  const defaultMapZoom = getPublicDefaultMapZoom();

  return (
    <main className="min-h-screen bg-slate-50">
      <CoverageChecker initialBoundary={initialBoundary} defaultMapZoom={defaultMapZoom} />
    </main>
  );
}
