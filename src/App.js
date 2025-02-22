import React, { useState, useCallback } from 'react';
import FileUploader from './components/FileUploader';
import ResultsTable from './components/ResultsTable';
import { apiRequest } from './services/apiService';

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleCompare = useCallback(async (file1, file2, selectedColumns1, selectedColumns2, threshold, parser) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResults([]);

    try {
      // Log the incoming data
      console.log('Compare request:', {
        files: [file1?.name, file2?.name],
        columns1: selectedColumns1,
        columns2: selectedColumns2,
        threshold,
        parser
      });

      const formData = new FormData();
      formData.append('file1', file1);
      formData.append('file2', file2);
      
      // Fix: Use correct field names for columns
      selectedColumns1.forEach(col => formData.append('columns1[]', col));
      selectedColumns2.forEach(col => formData.append('columns2[]', col));
      
      formData.append('threshold', threshold);
      formData.append('parser', parser);

      const data = await apiRequest('compare', formData);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from server');
      }

      setResults(data);
      setSuccess('Comparison completed successfully');
    } catch (err) {
      console.error('Comparison failed:', err);
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExport = useCallback(async (file1, file2, selectedColumns1, selectedColumns2, threshold, parser) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file1', file1);
      formData.append('file2', file2);
      
      // Fix: Use correct field names for columns
      selectedColumns1.forEach(col => formData.append('columns1[]', col));
      selectedColumns2.forEach(col => formData.append('columns2[]', col));
      
      formData.append('threshold', threshold);
      formData.append('parser', parser);
      formData.append('export', 'true');

      const { blob, filename } = await apiRequest('compare', formData, true);
      
      if (!blob) {
        throw new Error('No data received from server');
      }

      // Trigger file download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'comparison_results.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      setSuccess('File exported successfully');
    } catch (err) {
      console.error('Export failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Address Comparator
          </h1>
          <p className="text-gray-600">
            Compare and match addresses across different files
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-500 text-red-700 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-500 text-green-700 rounded">
            <p className="font-bold">Success</p>
            <p>{success}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <FileUploader 
              onCompare={handleCompare} 
              onExport={handleExport} 
              setError={setError}
              loading={loading}
            />
          </div>

          {loading && (
            <div className="flex items-center justify-center p-8 bg-gray-50">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <span className="ml-2 text-gray-600">Processing...</span>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Results ({results.length} matches)
              </h2>
              <ResultsTable results={results} />
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="text-center p-8 text-gray-500">
              No results to display. Upload files and compare addresses to see matches.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;