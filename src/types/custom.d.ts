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

export interface AddressComparisonResult {
    source_address: string;
    matched_address: string;
    match_score: number;
    normalized_source?: string;
    normalized_match?: string;
    source_columns?: Record<string, string>;
    matched_columns?: Record<string, string>;
}

export interface ApiResponse {
    status: 'success' | 'error';
    data: AddressComparisonResult[];
    error?: string;
    metadata?: {
        total_comparisons: number;
        matches_found: number;
    };
    job_id?: string;
}