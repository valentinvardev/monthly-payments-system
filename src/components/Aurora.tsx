// Animated aurora field. Five diffused light orbs drifting across the
// viewport with different periods so the brightness redistributes without
// ever concentrating. Sits fixed at z-index 0 behind all content.
export function Aurora() {
  return (
    <div className="aurora-field" aria-hidden>
      <div className="aurora-orb orb-a" />
      <div className="aurora-orb orb-b" />
      <div className="aurora-orb orb-c" />
      <div className="aurora-orb orb-d" />
      <div className="aurora-orb orb-e" />
    </div>
  );
}
