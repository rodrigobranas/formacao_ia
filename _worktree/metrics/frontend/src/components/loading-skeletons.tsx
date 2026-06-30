function SkeletonBlock({ height }: { height: number }) {
  return <div className="wx-shimmer" style={{ height }} aria-hidden="true" />
}

export function LoadingSkeletons() {
  return (
    <div aria-busy="true" aria-label="Carregando clima" role="status">
      <div className="wx-hero" data-testid="hero-skeleton" style={{ minHeight: 200, gap: 16 }}>
        <SkeletonBlock height={28} />
        <SkeletonBlock height={96} />
      </div>
      <div className="wx-card wx-grid" data-testid="hourly-skeleton" style={{ marginTop: 16 }}>
        <SkeletonBlock height={84} />
      </div>
      <div className="wx-card" data-testid="daily-skeleton" style={{ marginTop: 16 }}>
        <SkeletonBlock height={34} />
        <SkeletonBlock height={34} />
      </div>
    </div>
  )
}
