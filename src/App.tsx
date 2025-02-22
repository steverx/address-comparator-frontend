import React, { useState } from 'react';
import ComparisonForm from './components/ComparisonForm';
import ResultsTable from './components/ResultsTable';

const App: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Address Comparator</h1>
      <ComparisonForm onResults={setResults} />
      {results.length > 0 && <ResultsTable results={results} />}
    </div>
  );
};

export default App;