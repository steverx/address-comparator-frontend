import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../services/apiService';
// Remove PropTypes import, no longer needed since we use Typescript.
// import PropTypes from 'prop-types';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { FileUploaderProps, ColumnsState, FileKey, FileValidationError, ColumnValidationError, ColumnApiResponse } from '../types/fileUploader.types'; // Import types
import { FILE_CONFIG, PARSER_OPTIONS, type ParserOption } from '../constants/fileUploader.constants'; // Import constants


const FileUploader: React.FC<FileUploaderProps> = ({ onCompare, onExport, setError, loading }) => {
    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);
    const [columns1, setColumns1] = useState<string[] | null>(null);
    const [columns2, setColumns2] = useState<string[] | null>(null);
    const [selectedColumns1, setSelectedColumns1] = useState<string[]>([]);
    const [selectedColumns2, setSelectedColumns2] = useState<string[]>([]);
    const [threshold, setThreshold] = useState<number>(80);
    const [parser, setParser] = useState<ParserOption>(PARSER_OPTIONS.USADDRESS); // Use the type and constant
    const [columnsInitialized1, setColumnsInitialized1] = useState<boolean>(false);
    const [columnsInitialized2, setColumnsInitialized2] = useState<boolean>(false);
    const [columnsLoaded, setColumnsLoaded] = useState<ColumnsState>({
        file1: false,
        file2: false,
    });



    const validateFile = useCallback((file: File | null) => {
        if (!file) {
            throw new FileValidationError(FILE_CONFIG.ERROR_MESSAGES.NO_FILE);
        }

        if (file.size > FILE_CONFIG.MAX_SIZE) {
            throw new FileValidationError(FILE_CONFIG.ERROR_MESSAGES.SIZE_EXCEED);
        }

        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!FILE_CONFIG.ALLOWED_TYPES.includes(fileExt as any)) { // the 'as any' is a temporary workaround.
            throw new FileValidationError(FILE_CONFIG.ERROR_MESSAGES.INVALID_TYPE);
        }

        return { valid: true, error: null };
    }, []);


    const fetchColumns = useCallback(async (file: File, setColumns: (cols: string[] | null) => void, setSelectedColumns: (cols: string[]) => void, fileKey: FileKey) => {
        if (!file || columnsLoaded[fileKey]) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response: ColumnApiResponse = await apiRequest('columns', formData); // Type the response!

            if (response.status === 'success' && Array.isArray(response.data)) {
                setColumns(response.data);

                if (response.suggested_address_columns && response.suggested_address_columns.length > 0) {
                    setSelectedColumns(response.suggested_address_columns);

                    if (fileKey === 'file1') {
                        setColumnsInitialized1(true);
                    } else {
                        setColumnsInitialized2(true);
                    }
                } else {
                  const firstColumn = response.data.length > 0 ? [response.data[0]] : [];
                  setSelectedColumns(firstColumn);
                }

                  setColumnsLoaded((prev) => ({ ...prev, [fileKey]: true }));
            } else {
                const errorMessage = response.error || 'Failed to fetch columns.';
                setError(errorMessage);
                setColumns(null);
                setSelectedColumns([]);
                setColumnsLoaded(prev => ({ ...prev, [fileKey]: false }));
            }

        } catch (error:any) {
            console.error('Error fetching columns:', error);
            setError(error.message || 'An unexpected error occurred while fetching columns.');
            setColumns(null);
            setSelectedColumns([]);
            setColumnsLoaded(prev => ({ ...prev, [fileKey]: false }));
        }
    }, [columnsLoaded, setError, setColumnsInitialized1, setColumnsInitialized2]);



    useEffect(() => {
        if (file1) fetchColumns(file1, setColumns1, setSelectedColumns1, 'file1');
        if (file2) fetchColumns(file2, setColumns2, setSelectedColumns2, 'file2');
    }, [file1, file2, fetchColumns]);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        setError(null); // Clear previous errors
        try {
            validateFile(file);
        } catch (error: any) {
            setError(error.message);
            if(event.target){
                event.target.value = '';
            }
            return;
        }

        if (event.target.id === 'file1') {
            setFile1(file);
            setColumns1(null);
            setSelectedColumns1([]);
            setColumnsInitialized1(false);
            setColumnsLoaded(prev => ({ ...prev, file1: false }));
        } else if (event.target.id === 'file2') {
            setFile2(file);
            setColumns2(null);
            setSelectedColumns2([]);
            setColumnsInitialized2(false);
            setColumnsLoaded(prev => ({ ...prev, file2: false }));
        }
    };

    const handleColumnChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>, index: number, setSelectedColumns: React.Dispatch<React.SetStateAction<string[]>>, currentSelectedColumns: string[]) => {
        const newSelectedColumns = [...currentSelectedColumns];
        newSelectedColumns[index] = event.target.value;
        setSelectedColumns(newSelectedColumns);
        setError(null);
    }, [setError]);

    const addColumnSelector = useCallback((setSelectedColumns: React.Dispatch<React.SetStateAction<string[]>>, currentSelectedColumns: string[]) => {
        setSelectedColumns([...currentSelectedColumns, '']);
    }, []);

    const removeColumnSelector = useCallback((index: number, setSelectedColumns:  React.Dispatch<React.SetStateAction<string[]>>, currentSelectedColumns: string[]) => {
        if (currentSelectedColumns.length <= 1) {
            setError('At least one column must be selected');
            return;
        }
        const newSelectedColumns = [...currentSelectedColumns];
        newSelectedColumns.splice(index, 1);
        setSelectedColumns(newSelectedColumns);
        setError(null);
    }, [setError]);

    const validateSelections = () => {
        if (!file1 || !file2) {
            throw new ColumnValidationError('Please select both input files');
        }
        if(file1 === file2){
            throw new ColumnValidationError("Please select different files for comparison");
        }
        if (!selectedColumns1?.length || !selectedColumns2?.length) {
             throw new ColumnValidationError('Please select at least one column for each file');
        }
        if (selectedColumns1.some(col => !col) || selectedColumns2.some(col => !col)) {
            throw new ColumnValidationError('Please select valid columns for all fields');
        }
        return true;
    };
    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        try {
            validateSelections();

            console.log('Attempting comparison:', {
                files: [file1?.name, file2?.name],
                columns: { file1: selectedColumns1, file2: selectedColumns2 },
                threshold,
                parser,
            });

            await onCompare(file1!, file2!, selectedColumns1, selectedColumns2, threshold, parser);

        } catch (error:any) {
            console.error('Comparison failed:', error);
            setError(error.message);
        }
    };

    const handleExportSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        try {
            validateSelections();
            await onExport(file1!, file2!, selectedColumns1, selectedColumns2, threshold, parser);
        } catch (error:any) {
            console.error('Export failed:', error);
            setError(error.message);
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
                                onChange={(e) => setParser(e.target.value as ParserOption)}
                                className="p-2 border rounded"
                            >
                                <option value={PARSER_OPTIONS.USADDRESS}>usaddress (US)</option>
                                <option value={PARSER_OPTIONS.PYAP}>pyap (US/Canada/UK)</option>
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`px-6 py-2 text-white rounded ${
                        loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
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
                        className={`px-6 py-2 text-white rounded ${
                        loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        Export Results
                    </button>
                    </div>
                </form>
            </div>
        </ErrorBoundary>
    );
}

export default FileUploader;