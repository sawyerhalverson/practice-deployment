import { useState } from "react";
import Title from "./components/Title";
import ImageUpload from "./components/ImageUpload";
import ImageAnalyzer from "./components/ImageAnalyzer";

function App() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-8 text-center">
        <Title>Flip Report</Title>
      </div>
      <div className="p-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <ImageUpload onImageUpload={handleImageUpload} />
          <ImageAnalyzer image={uploadedImage} />
        </div>
      </div>
    </div>
  );
}

export default App;
