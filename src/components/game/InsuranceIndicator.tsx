interface InsuranceIndicatorProps {
  insuranceAmount: number;
}

export default function InsuranceIndicator({ insuranceAmount }: InsuranceIndicatorProps) {
  if (insuranceAmount <= 0) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="text-center text-yellow-300 font-bold bg-green-900/90 px-6 py-3 rounded-lg shadow-lg border-2 border-yellow-300">
        Insurance: ${insuranceAmount}
      </div>
    </div>
  );
}
