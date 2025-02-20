// src/components/FileUploader.js
import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/apiService';

function FileUploader({ onCompare, onExport, setError, loading }) {
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [columns1, setColumns1] = useState(null);
    const [columns2, setColumns2] = useState(null);
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
                console.log('Fetching columns for file:', file.name);

                const response = await apiRequest('columns', formData);
                console.log('Response from server:', response);

                if (response.status === 'success' && Array.isArray(response.data)) {
                    const columns = response.data;
                    console.log('Processed columns:', columns);

                    setColumns(columns);

                    // Find address-related columns
                    const addressColumns = columns.filter(col =>
                        col.toLowerCase().includes('address') ||
                        col.toLowerCase().includes('street')
                    );

                    // Set initial selected column
                    if (addressColumns.length > 0) {
                        setSelectedColumns([addressColumns[0]]);
                    } else if (columns.length > 0) {
                        setSelectedColumns([columns[0]]);
                    } else {
                        setSelectedColumns([]);
                    }
                } else {
                    throw new Error('Invalid response format from server');
                }
            } catch (error) {
                console.error('Error fetching columns:', error);
                setError(`Error: ${error.message}`);
                setColumns([]);
                setSelectedColumns([]);
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
            setColumns1(null);
            setSelectedColumns1([]);
        } else if (event.target.id === 'file2') {
            setFile2(file);
            setColumns2(null);
            setSelectedColumns2([]);
        }
    };

    const handleColumnChange = (event, index, setSelectedColumns, currentSelectedColumns) => {
        const newSelectedColumns = [...currentSelectedColumns];
        newSelectedColumns[index] = event.target.value;
        setSelectedColumns(newSelectedColumns);
        setError(null); // Clear any previous errors
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

    const validateSelections = () => {
        if (!file1 || !file2) {
            setError('Please select both files');
            return false;
        }
        if (!selectedColumns1.length || !selectedColumns2.length) {
            setError('Please select at least one column for each file');
            return false;
        }
        if (selectedColumns1.includes('') || selectedColumns2.includes('')) {
            setError('Please select valid columns');
            return false;
        }
        return true;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!validateSelections()) return;
        onCompare(file1, file2, selectedColumns1, selectedColumns2, threshold, parser);
    };

    const handleExportSubmit = (event) => {
        event.preventDefault();
        if (!validateSelections()) return;
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
                    {columns1 && (
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
                    )}
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
                    {columns2 && (
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
                    )}
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