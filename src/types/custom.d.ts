declare module '*.svg' {
    const content: string;
    export default content;
}

interface FileValidationError extends Error {
    name: 'FileValidationError';
}

interface ColumnValidationError extends Error {
    name: 'ColumnValidationError';
}

interface AddressComparisonResult {
    source_address: string;
    matched_address: string;
    match_score: number;
    normalized_source?: string;
    normalized_match?: string;
}

interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    error?: string;
    metadata?: {
        total_comparisons?: number;
        matches_found?: number;
    };
}