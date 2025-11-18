import { GAME_PHASES } from '../../lib/types';

interface StatusOverlayProps {
  phase: string;
}

export default function StatusOverlay({ phase }: StatusOverlayProps) {
  if (phase !== GAME_PHASES.DEALING && phase !== GAME_PHASES.DEALER_TURN) {
    return null;
  }

  const message = phase === GAME_PHASES.DEALING ? 'Dealing...' : "Dealer's Turn...";

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
      <div className="text-yellow-300 text-3xl font-bold animate-pulse bg-green-900/80 px-8 py-4 rounded-xl shadow-lg">
        {message}
      </div>
    </div>
  );
}
