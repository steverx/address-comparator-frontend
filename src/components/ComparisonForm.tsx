import React, { useState } from 'react';
import { compareAddresses } from '../services/addressService';

interface ComparisonFormProps {
  onResults: (results: any) => void;
}

const ComparisonForm: React.FC<ComparisonFormProps> = ({ onResults }) => {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [threshold, setThreshold] = useState(80);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      // Process file headers
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const headers = text.split('\n')[0].split(',');
        setColumns(headers.map(h => h.trim()));
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n').slice(1).map(row => {
          const values = row.split(',');
          return columns.reduce((obj, header, index) => {
            obj[header] = values[index]?.trim();
            return obj;
          }, {} as Record<string, string>);
        });

        const response = await compareAddresses({
          sourceFile: rows,
          columns: columns,
          threshold: threshold
        });

        onResults(response.data);
      };
      reader.readAsText(file);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      console.error('Comparison error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upload Address File
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="mt-1 block w-full"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Match Threshold ({threshold}%)
            <input
              type="range"
              min="0"
              max="100"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="mt-1 block w-full"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Comparing...' : 'Compare with Database'}
        </button>
      </form>
    </div>
  );
};

export default ComparisonForm;