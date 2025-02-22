import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ComparisonForm from './components/ComparisonForm';
import ResultsTable from './components/ResultsTable';

const App: React.FC = () => {
  const [fileData, setFileData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);

  const handleDataLoaded = (data: any[], headers: string[]) => {
    setFileData(data);
    setHeaders(headers);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Address Comparator</h1>
      <FileUpload onDataLoaded={handleDataLoaded} />
      {fileData.length > 0 && (
        <ComparisonForm 
          data={fileData}
          headers={headers}
          onResults={setResults}
        />
      )}
      {results.length > 0 && <ResultsTable results={results} />}
    </div>
  );
};

export default App;