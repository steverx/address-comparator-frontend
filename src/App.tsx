import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ComparisonForm from './components/ComparisonForm';
import ResultsTable from './components/ResultsTable';
import { ComparisonResult } from './types/address';

const App: React.FC = () => {
  const [fileData, setFileData] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [results, setResults] = useState<ComparisonResult[]>([]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Address Comparator</h1>
      <FileUpload onDataLoaded={(data, headers) => {
        setFileData(data);
        setHeaders(headers);
      }} />
      {fileData.length > 0 && (
        <ComparisonForm 
          fileData={fileData}
          columns={headers}
          onResults={setResults}
        />
      )}
      {results.length > 0 && <ResultsTable results={results} />}
    </div>
  );
};

export default App;