import { useState, useCallback } from 'react';
import FileUploader from './components/FileUploader';
import ResultsTable from './components/ResultsTable';
import { apiRequest } from './services/apiService';
import { AddressComparisonResult, ApiResponse } from './types/fileUploader.types'; // Import ApiResponse too

function App() {
    const [results, setResults] = useState<AddressComparisonResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleCompare = useCallback(async (
        file1: File,
        file2: File,
        selectedColumns1: string[],
        selectedColumns2: string[],
        threshold: number,
        parser: string
    ): Promise<void> => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        setResults([]);

        try {
            const formData = new FormData();
            formData.append('file1', file1);
            formData.append('file2', file2);
            selectedColumns1.forEach(col => formData.append('columns1[]', col));
            selectedColumns2.forEach(col => formData.append('columns2[]', col));
            formData.append('threshold', threshold.toString());
            formData.append('parser', parser);

            const response = await apiRequest<ApiResponse>('compare', formData);

            if (!response || typeof response !== 'object') {
                throw new Error('Invalid response format: expected object');
            }

            if (response.status !== 'success' || !Array.isArray(response.data)) {
                throw new Error(response.error || 'Invalid response format from server');
            }

            setResults(response.data);
            setSuccess(`Found ${response.data.length} matches`);

        } catch (err) {
            console.error('Comparison failed:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleExport = useCallback(async (
        file1: File,
        file2: File,
        selectedColumns1: string[],
        selectedColumns2: string[],
        threshold: number,
        parser: string
    ): Promise<void> => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const formData = new FormData();
            formData.append('file1', file1);
            formData.append('file2', file2);
            selectedColumns1.forEach(col => formData.append('columns1[]', col));
            selectedColumns2.forEach(col => formData.append('columns2[]', col));
            formData.append('threshold', threshold.toString());
            formData.append('parser', parser);
            formData.append('export', 'true');

            const response = await apiRequest<{ blob: Blob; filename: string }>('compare', formData, true);

            if (!response.blob) {
                throw new Error('No data received from server');
            }

            const url = window.URL.createObjectURL(response.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = response.filename || 'comparison_results.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

            setSuccess('File exported successfully');

        } catch (err) {
            console.error('Export failed:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
                            No results to display.  Upload files and compare addresses to see matches.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;