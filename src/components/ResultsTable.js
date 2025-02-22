import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

function ResultsTable({ results = [] }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');

  // Memoize filtered and sorted results
  const processedResults = useMemo(() => {
    // First filter
    let filteredResults = searchTerm
      ? results.filter(result => 
          result.address1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.address2?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : results;

    // Then sort
    if (sortConfig.key) {
      filteredResults.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? '';
        const bValue = b[sortConfig.key] ?? '';

        if (typeof aValue === 'string') {
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return sortConfig.direction === 'ascending'
          ? aValue - bValue
          : bValue - aValue;
      });
    }

    return filteredResults;
  }, [results, sortConfig, searchTerm]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' 
        ? 'descending' 
        : 'ascending'
    }));
  };

  const getScoreColor = (score) => {
    if (!score && score !== 0) return 'text-gray-400';
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (confidence) => {
    if (!confidence && confidence !== 0) return 'text-gray-400';
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  if (!Array.isArray(results)) {
    console.error('Results prop must be an array');
    return <div className="text-red-500">Error: Invalid results format</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex justify-end">
        <input
          type="text"
          placeholder="Search addresses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        Showing {processedResults.length} of {results.length} results
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['address1', 'address2', 'match_score', 'parsing_confidence'].map((key) => (
                <th
                  key={key}
                  scope="col"
                  onClick={() => handleSort(key)}
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
              <tr key={`${result.address1}-${result.address2}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.address1 || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.address2 || 'N/A'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getScoreColor(result.match_score)}`}>
                  {result.match_score?.toFixed(1)}%
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getConfidenceColor(result.parsing_confidence)}`}>
                  {result.parsing_confidence ? (result.parsing_confidence * 100).toFixed(1) : 'N/A'}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

ResultsTable.propTypes = {
  results: PropTypes.arrayOf(PropTypes.shape({
    address1: PropTypes.string,
    address2: PropTypes.string,
    match_score: PropTypes.number,
    parsing_confidence: PropTypes.number
  })).isRequired
};

export default ResultsTable;