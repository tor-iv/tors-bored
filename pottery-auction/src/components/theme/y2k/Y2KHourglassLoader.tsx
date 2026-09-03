export default function Y2KHourglassLoader({ message = 'Please wait...' }: { message?: string }) {
  return (
    <div className="y2k-desktop" style={{ justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
      <div className="win98-window" style={{ maxWidth: 240, textAlign: 'center' }}>
        <div className="win98-title-bar">
          <span className="win98-title-bar-text">⏳ Loading</span>
        </div>
        <div className="win98-window-body" style={{ padding: 24 }}>
          <span className="win98-hourglass">⏳</span>
          <p style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11, marginTop: 8, color: 'var(--ink)' }}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
