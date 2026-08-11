import { CoverageChecker } from "@/components/CoverageChecker";
import { getPublicCoverageBoundary, getPublicDefaultMapZoom } from "@/lib/config";

export default function Home() {
  const initialBoundary = getPublicCoverageBoundary();
  const defaultMapZoom = getPublicDefaultMapZoom();

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-slate-50 to-slate-100">
      <CoverageChecker initialBoundary={initialBoundary} defaultMapZoom={defaultMapZoom} />
    </main>
  );
}
