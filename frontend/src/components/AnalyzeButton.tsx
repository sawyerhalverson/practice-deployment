type AnalyzeButtonProps = {
  onAnalyze: () => Promise<void>;
  disabled: boolean;
  loading: boolean;
};

const AnalyzeButton = ({
  onAnalyze,
  disabled,
  loading,
}: AnalyzeButtonProps) => {
  return (
    <div className="flex justify-center">
      <button
        onClick={onAnalyze}
        disabled={disabled || loading}
        className={`px-8 py-2 rounded-lg font-medium transition-colors
          ${
            disabled
              ? "bg-gray-300 cursor-not-allowed"
              : loading
              ? "bg-blue-400 cursor-wait"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
      >
        {loading ? "Analyzing..." : "Analyze Image"}
      </button>
    </div>
  );
};

export default AnalyzeButton;
