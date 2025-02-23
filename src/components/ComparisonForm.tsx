import React, { useState } from 'react';
import { compareAddresses } from '../services/addressService';
import { ComparisonResult } from '../types/address';

interface ComparisonFormProps {
  fileData: Record<string, string>[];
  columns: string[];
  onResults: (results: ComparisonResult[]) => void;
}

const ComparisonForm: React.FC<ComparisonFormProps> = ({ fileData, columns, onResults }) => {
  const [threshold, setThreshold] = useState<number>(80);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const results = await compareAddresses({
        sourceFile: fileData,
        columns: columns,
        threshold: threshold,
      });
      onResults(results); // Pass the results to the parent component
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Match Threshold (%)
        </label>
        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          min="0"
          max="100"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <button
        type="submit"
        disabled={loading || fileData.length === 0}
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Processing...' : 'Compare Addresses'}
      </button>
    </form>
  );
};

export default ComparisonForm;