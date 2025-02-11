// src/components/FileUploader.js
import React, { useState, useEffect } from 'react';

function FileUploader({ onCompare, onExport, setError, loading }) {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [columns1, setColumns1] = useState([]);
  const [columns2, setColumns2] = useState([]);
  const [selectedColumns1, setSelectedColumns1] = useState([]);
  const [selectedColumns2, setSelectedColumns2] = useState([]);
  const [threshold, setThreshold] = useState(80);
  const [parser, setParser] = useState('usaddress');

  useEffect(() => {
    async function fetchColumns(file, setColumns, setSelectedColumns) {
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000'}/columns`,
          { method: 'POST', body: formData }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch columns');
        }
        const data = await response.json();
        setColumns(data.columns);
        // Set default address column if available
        if (data.columns.length > 0) {
          const addressColumns = data.columns.filter(col =>
            col.toLowerCase().includes('address') ||
            col.toLowerCase().includes('street')
          );
          setSelectedColumns([addressColumns[0] || data.columns[0]]);
        }
      } catch (error) {
        setError(`Error: ${error.message}`);
        setColumns([]);
      }
    }

    if (file1) fetchColumns(file1, setColumns1, setSelectedColumns1);
    if (file2) fetchColumns(file2, setColumns2, setSelectedColumns2);
  }, [file1, file2, setError]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size exceeds 10MB limit');
      event.target.value = '';
      return;
    }
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.csv', '.xlsx'].includes(fileExt)) {
      setError('Invalid file type. Please use CSV or Excel files.');
      event.target.value = '';
      return;
    }
    setError(null);
    if (event.target.id === 'file1') {
      setFile1(file);
    } else if (event.target.id === 'file2') {
      setFile2(file);
    }
  };

  const handleColumnChange = (event, index, setSelectedColumns, currentSelectedColumns) => {
    const newSelectedColumns = [...currentSelectedColumns];
    newSelectedColumns[index] = event.target.value;
    setSelectedColumns(newSelectedColumns);
  };

  const addColumnSelector = (setSelectedColumns, currentSelectedColumns) => {
    setSelectedColumns([...currentSelectedColumns, '']);
  };

  const removeColumnSelector = (index, setSelectedColumns, currentSelectedColumns) => {
    if (currentSelectedColumns.length <= 1) {
      setError('At least one column must be selected');
      return;
    }
    const newSelectedColumns = [...currentSelectedColumns];
    newSelectedColumns.splice(index, 1);
    setSelectedColumns(newSelectedColumns);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!file1 || !file2) {
      setError('Please select both files');
      return;
    }
    if (selectedColumns1.length === 0 || selectedColumns2.length === 0) {
      setError('Please select at least one column for each file');
      return;
    }
    if (selectedColumns1.includes('') || selectedColumns2.includes('')) {
      setError('Please select valid columns');
      return;
    }
    onCompare(file1, file2, selectedColumns1, selectedColumns2, threshold, parser);
  };

  const handleExportSubmit = (event) => {
    event.preventDefault();
    if (!file1 || !file2) {
      setError('Please select both files');
      return;
    }
    if (selectedColumns1.length === 0 || selectedColumns2.length === 0) {
      setError('Please select at least one column for each file');
      return;
    }
    if (selectedColumns1.includes('') || selectedColumns2.includes('')) {
      setError('Please select valid columns');
      return;
    }
    onExport(file1, file2, selectedColumns1, selectedColumns2, threshold, parser);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <form className="space-y-6">
        {/* File 1 Section */}
        <div className="border p-4 rounded">
          <label className="block mb-2 font-medium" htmlFor="file1">
            File 1
          </label>
          <input
            type="file"
            id="file1"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            className="block w-full text-sm border rounded p-2"
          />
          {file1 && (
            <p className="mt-1 text-sm text-gray-500">Selected: {file1.name}</p>
          )}
          {/* Column Selectors */}
          <div className="mt-4 space-y-2">
            {selectedColumns1.map((col, idx) => (
              <div key={`file1-column-${idx}`} className="flex gap-2">
                <select
                  value={col}
                  onChange={(e) => handleColumnChange(e, idx, setSelectedColumns1, selectedColumns1)}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Select Column {idx + 1}</option>
                  {columns1.map((column) => (
                    <option key={column} value={column}>{column}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeColumnSelector(idx, setSelectedColumns1, selectedColumns1)}
                  className="px-3 py-2 text-red-600 border rounded hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addColumnSelector(setSelectedColumns1, selectedColumns1)}
              className="px-4 py-2 text-blue-600 border rounded hover:bg-blue-50"
            >
              Add Column
            </button>
          </div>
        </div>

        {/* File 2 Section */}
        <div className="border p-4 rounded">
          <label className="block mb-2 font-medium" htmlFor="file2">
            File 2
          </label>
          <input
            type="file"
            id="file2"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            className="block w-full text-sm border rounded p-2"
          />
          {file2 && (
            <p className="mt-1 text-sm text-gray-500">Selected: {file2.name}</p>
          )}
          {/* Column Selectors */}
          <div className="mt-4 space-y-2">
            {selectedColumns2.map((col, idx) => (
              <div key={`file2-column-${idx}`} className="flex gap-2">
                <select
                  value={col}
                  onChange={(e) => handleColumnChange(e, idx, setSelectedColumns2, selectedColumns2)}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Select Column {idx + 1}</option>
                  {columns2.map((column) => (
                    <option key={column} value={column}>{column}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeColumnSelector(idx, setSelectedColumns2, selectedColumns2)}
                  className="px-3 py-2 text-red-600 border rounded hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addColumnSelector(setSelectedColumns2, selectedColumns2)}
              className="px-4 py-2 text-blue-600 border rounded hover:bg-blue-50"
            >
              Add Column
            </button>
          </div>
        </div>

        {/* Controls Section */}
        <div className="space-y-4">
          <div>
            <label className="block mb-2" htmlFor="threshold">
              Match Threshold (%)
            </label>
            <input
              type="number"
              id="threshold"
              value={threshold}
              min="0"
              max="100"
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-24 p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2" htmlFor="parser">
              Address Parser
            </label>
            <select
              id="parser"
              value={parser}
              onChange={(e) => setParser(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="usaddress">usaddress (US)</option>
              <option value="pyap">pyap (US/Canada/UK)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 text-white rounded ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Processing...' : 'Compare Addresses'}
          </button>
          <button
            type="button"
            onClick={handleExportSubmit}
            disabled={loading}
            className={`px-6 py-2 text-white rounded ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            Export to Excel
          </button>
        </div>
      </form>
    </div>
  );
}

export default FileUploader;