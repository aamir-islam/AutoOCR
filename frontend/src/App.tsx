import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import FileUpload from "./components/FileUpload";
import PreviewData from "./components/PreviewData";

const App: React.FC = () => {
  const [extractedData, setExtractedData] = useState<
    Record<string, string | number>
  >({});

  const handleDataExtracted = (data: Record<string, string | number>) => {
    setExtractedData(data);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={<FileUpload onDataExtracted={handleDataExtracted} />}
          />
          <Route
            path="/preview"
            element={<PreviewData extractedData={extractedData} />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
