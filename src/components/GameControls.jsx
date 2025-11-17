export default function GameControls({ onHit, onStand, disabled = false }) {
  return (
    <div className="flex gap-4 justify-center">
      <button
        onClick={onHit}
        disabled={disabled}
        className="btn-primary"
      >
        Hit
      </button>
      <button
        onClick={onStand}
        disabled={disabled}
        className="btn-secondary"
      >
        Stand
      </button>
    </div>
  );
}
