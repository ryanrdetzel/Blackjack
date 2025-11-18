interface HeaderButtonsProps {
  onOpenTableRules: () => void;
  onOpenSettings: () => void;
}

export default function HeaderButtons({ onOpenTableRules, onOpenSettings }: HeaderButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onOpenTableRules}
        className="text-2xl px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
        title="Table Rules"
      >
        📋
      </button>
      <button
        onClick={onOpenSettings}
        className="text-2xl px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
        title="Settings"
      >
        ⚙️
      </button>
    </div>
  );
}
