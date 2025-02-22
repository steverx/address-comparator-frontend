import React, { useState, useMemo } from 'react';
import { AddressComparisonResult, MatchResult } from '../types/address';
import { utils, writeFile } from 'xlsx';

interface ResultsTableProps {
    results: AddressComparisonResult[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof AddressComparisonResult | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });
    const [searchTerm, setSearchTerm] = useState('');

  const processedResults = useMemo(() => {
    let filteredResults = searchTerm
      ? results.filter(result =>
          result.source_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.matched_address?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : results;

        // Then sort if we have a valid sort key
        if (sortConfig.key !== null) {
            filteredResults.sort((a, b) => {
                if (!sortConfig.key) return 0; // TypeScript now knows sortConfig.key is not null

                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                // Rest of your sorting logic
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'ascending'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'ascending'
                        ? aValue - bValue
                        : bValue - aValue;
                } else {
                    if (aValue === bValue) return 0;
                    if (aValue == null) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (bValue == null) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return typeof aValue === 'number'
                        ? (sortConfig.direction === 'ascending' ? -1 : 1)
                        : (sortConfig.direction === 'ascending' ? 1 : -1);
                }
            });
        }

    return filteredResults;
  }, [results, sortConfig, searchTerm]);

    const handleSort = (key: keyof AddressComparisonResult) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'ascending'
                ? 'descending'
                : 'ascending'
        }));
    };

     const getScoreColor = (score: number | undefined | null) => {
        if (score == null) return 'text-gray-400'; // Handles null/undefined
        if (score >= 90) return 'text-green-600';
        if (score >= 80) return 'text-yellow-600'; // Consider orange-600
        return 'text-red-600';
    };

    const getSortIcon = (key: string) => {
      if (sortConfig.key !== key) return '↕️';
      return sortConfig.direction === 'ascending' ? '↑' : '↓';
    };

    if (!Array.isArray(results)) {
      console.error('Results prop must be an array');
      return <div className="text-red-500">Error: Invalid results format</div>;
    }
        const validKeys: (keyof AddressComparisonResult)[] = ['source_address', 'matched_address', 'match_score'];

    const exportToExcel = (data: AddressComparisonResult[]) => {
        const exportData = data.map(result => ({
            source_address: result.source_address,
            matched_address: result.matched_address,
            match_score: result.match_score
        }));

        const wb = utils.book_new();
        const ws = utils.json_to_sheet(exportData);
        utils.book_append_sheet(wb, ws, 'Address Matches');
        writeFile(wb, 'address_matches.xlsx');
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Results</h2>
            <button
                onClick={() => exportToExcel(results)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Export to Excel
            </button>
        </div>
        <div className="flex justify-end">
          <input
            type="text"
            placeholder="Search addresses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-500">
          Showing {processedResults.length} of {results.length} results
        </div>
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
              {validKeys.map((key) => (
                <th
                  key={key}
                  scope="col"
                  onClick={() => handleSort(key)}  // No cast needed
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  {' '}
                  {getSortIcon(key)}
                </th>
              ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedResults.map((result, index) => (
                <tr key={`${result.source_address}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.source_address || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.matched_address || 'N/A'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getScoreColor(result.match_score)}`}>
                    {result.match_score !== undefined && result.match_score !== null ? `${result.match_score.toFixed(1)}%` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
};

export default ResultsTable;