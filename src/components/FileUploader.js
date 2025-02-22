import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/apiService';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
    static propTypes = {
        children: PropTypes.node.isRequired
    };

    constructor(props) {
        super(props);
        this.state = { hasError: false, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-50 border border-red-500 rounded">
                    <h1 className="text-red-700 font-bold">Something went wrong</h1>
                    {this.state.errorInfo && (
                        <pre className="mt-2 text-sm text-red-600">
                            {JSON.stringify(this.state.errorInfo, null, 2)}
                        </pre>
                    )}
                </div>
            );
        }
        return this.props.children;
    }
}

function FileUploader({ onCompare, onExport, setError, loading }) {
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [columns1, setColumns1] = useState(null);
    const [columns2, setColumns2] = useState(null);
    const [selectedColumns1, setSelectedColumns1] = useState([]);
    const [selectedColumns2, setSelectedColumns2] = useState([]);
    const [threshold, setThreshold] = useState(80);
    const [parser, setParser] = useState('usaddress');
    const [columnsInitialized1, setColumnsInitialized1] = useState(false);
    const [columnsInitialized2, setColumnsInitialized2] = useState(false);

    const ALLOWED_FILE_TYPES = ['.csv', '.xlsx'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    const validateFile = useCallback((file) => {
        if (!file) return { valid: false, error: 'No file selected' };

        if (file.size > MAX_FILE_SIZE) {
            return { valid: false, error: 'File size exceeds 10MB limit' };
        }

        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
            return { valid: false, error: 'Invalid file type. Please use CSV or Excel files.' };
        }

        return { valid: true, error: null };
    }, []);

    const fetchColumns = useCallback(async (file, setColumns, setSelectedColumns, isFile1) => {
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

                // Only set initial columns if not already initialized
                if ((isFile1 && !columnsInitialized1) || (!isFile1 && !columnsInitialized2)) {
                    const addressColumns = columns.filter(col => {
                        const colLower = col.toLowerCase();
                        return (
                            colLower.includes('address') ||
                            colLower.includes('street') ||
                            colLower.includes('city') ||
                            colLower.includes('state') ||
                            colLower.includes('zip') ||
                            colLower.includes('postal')
                        );
                    });

                    if (addressColumns.length > 0) {
                        console.log('Found address columns:', addressColumns);
                        setSelectedColumns(addressColumns);
                    } else {
                        console.log('No address columns found, using first column');
                        setSelectedColumns(columns.length > 0 ? [columns[0]] : []);
                    }

                    // Mark as initialized
                    if (isFile1) {
                        setColumnsInitialized1(true);
                    } else {
                        setColumnsInitialized2(true);
                    }
                }
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            console.error('Error fetching columns:', error);
            setError(`Error fetching columns: ${error.message}`);
            setColumns(null);
            setSelectedColumns([]);
        }
    }, [setError, columnsInitialized1, columnsInitialized2]);


    useEffect(() => {
        if (file1) fetchColumns(file1, setColumns1, setSelectedColumns1, true);
        if (file2) fetchColumns(file2, setColumns2, setSelectedColumns2, false);
    }, [file1, file2, fetchColumns]);


    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const validationResult = validateFile(file);  // Use the validation function
        if (!validationResult.valid) {
            setError(validationResult.error);
            event.target.value = ''; // Clear the file input
            return;
        }

        setError(null); // Clear any previous error
        if (event.target.id === 'file1') {
            setFile1(file);
            setColumns1(null);
            setSelectedColumns1([]);
            setColumnsInitialized1(false);
        } else if (event.target.id === 'file2') {
            setFile2(file);
            setColumns2(null);
            setSelectedColumns2([]);
            setColumnsInitialized2(false);
        }
    };

    const handleColumnChange = useCallback((event, index, setSelectedColumns, currentSelectedColumns) => {
        const newSelectedColumns = [...currentSelectedColumns];
        newSelectedColumns[index] = event.target.value;
        setSelectedColumns(newSelectedColumns);
        setError(null);
    }, [setError]);

    const addColumnSelector = useCallback((setSelectedColumns, currentSelectedColumns) => {
        setSelectedColumns([...currentSelectedColumns, '']);
    }, []);

    const removeColumnSelector = useCallback((index, setSelectedColumns, currentSelectedColumns) => {
        if (currentSelectedColumns.length <= 1) {
            setError('At least one column must be selected');
            return;
        }
        const newSelectedColumns = [...currentSelectedColumns];
        newSelectedColumns.splice(index, 1);
        setSelectedColumns(newSelectedColumns);
    }, [setError]);

    const validateSelections = () => {
        if (!file1 || !file2) {
            setError('Please select both input files');
            return false;
        }

        if (!selectedColumns1?.length || !selectedColumns2?.length) {
            setError('Please select at least one column for each file');
            return false;
        }

        if (selectedColumns1.some(col => !col) || selectedColumns2.some(col => !col)) {
            setError('Please select valid columns for all fields');
            return false;
        }

        console.log('Validation passed:', {
            file1: file1.name,
            file2: file2.name,
            columns1: selectedColumns1,
            columns2: selectedColumns2,
            threshold,
            parser
        });

        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            if (!validateSelections()) return;

            // Log attempt
            console.log('Attempting comparison:', {
                files: [file1?.name, file2?.name],
                columns: {
                    file1: selectedColumns1,
                    file2: selectedColumns2
                }
            });

            await onCompare(
                file1,
                file2,
                selectedColumns1,
                selectedColumns2,
                threshold,
                parser
            );
        } catch (error) {
            console.error('Comparison failed:', error);
            setError(`Comparison failed: ${error.message}`);
        }
    };

    const handleExportSubmit = async (event) => {
        event.preventDefault();
        try {
            if (!validateSelections()) return;
            await onExport(
                file1,
                file2,
                selectedColumns1,
                selectedColumns2,
                threshold,
                parser
            );
        } catch (error) {
            console.error('Export failed:', error);
            setError(`Export failed: ${error.message}`);
        }
    };


    return (
        <ErrorBoundary>
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
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                'Compare Addresses'
                            )}
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
        </ErrorBoundary>
    );
}

FileUploader.propTypes = {
    onCompare: PropTypes.func.isRequired,
    onExport: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired
};

export default FileUploader;