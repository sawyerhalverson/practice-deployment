// src/components/ImageAnalyzer.tsx
import { useState } from "react";
import AnalyzeButton from "./AnalyzeButton";
import AnalysisResults from "./AnalysisResults";

type ImageAnalyzerProps = {
  image: File | null;
};

type AnalysisResult = {
  condition: string;
  estimatedValue: string;
  confidence: number;
  recommendations: string[];
};

const ImageAnalyzer = ({ image }: ImageAnalyzerProps) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalysis = async () => {
    if (!image) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const fakeResult: AnalysisResult = {
      condition: "Excellent",
      estimatedValue: "$150-200",
      confidence: 92,
      recommendations: [
        "Clean before listing",
        "Include original packaging",
        "Highlight rare features",
      ],
    };

    setResult(fakeResult);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <AnalyzeButton
        onAnalyze={handleAnalysis}
        disabled={!image}
        loading={loading}
      />
      {result && <AnalysisResults result={result} />}
    </div>
  );
};

export default ImageAnalyzer;