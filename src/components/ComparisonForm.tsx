import React, { useState, Dispatch, SetStateAction } from 'react';
import { compareAddresses } from '../services/addressService';
import { ComparisonResult } from '../types/address';

interface ComparisonFormProps {
  data: Record<string, string>[];
  headers: string[];
  onResults: Dispatch<SetStateAction<ComparisonResult[]>>;
}

const ComparisonForm: React.FC<ComparisonFormProps> = ({ data, headers, onResults }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const results = await compareAddresses({
        sourceFile: data,
        columns: headers,
        threshold: 80
      });
      onResults(results);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <button 
        type="submit" 
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Comparing...' : 'Compare Addresses'}
      </button>
    </form>
  );
};

export default ComparisonForm;