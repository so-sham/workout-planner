/**
 * @module components/generator/SkeletonPreview
 * @description Shimmer loading skeleton displayed while a workout is being generated.
 * Provides visual feedback that content is loading without layout shift.
 *
 * @returns {JSX.Element} Animated skeleton placeholder card
 */
export default function SkeletonPreview() {
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <div className="h-32 shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-1/3 shimmer rounded" />
        <div className="h-4 w-2/3 shimmer rounded" />
        <div className="h-4 w-1/2 shimmer rounded" />
      </div>
    </div>
  );
}
