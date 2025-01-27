// src/components/AnalysisResults.tsx
type AnalysisResult = {
  condition: string;
  estimatedValue: string;
  confidence: number;
  recommendations: string[];
};

type AnalysisResultsProps = {
  result: AnalysisResult;
};

const AnalysisResults = ({ result }: AnalysisResultsProps) => {
  return (
    <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
      <div className="space-y-3">
        <p>
          <span className="font-medium">Condition:</span> {result.condition}
        </p>
        <p>
          <span className="font-medium">Estimated Value:</span>{" "}
          {result.estimatedValue}
        </p>
        <p>
          <span className="font-medium">Confidence:</span> {result.confidence}%
        </p>
        <div>
          <p className="font-medium">Recommendations:</p>
          <ul className="list-disc pl-5 mt-2">
            {result.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
