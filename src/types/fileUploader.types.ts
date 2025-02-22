// src/types/fileUploader.types.ts

import { Dispatch, SetStateAction } from 'react'; // Import necessary types

export interface FileUploaderProps {
    onCompare: (
        file1: File,
        file2: File,
        selectedColumns1: string[],
        selectedColumns2: string[],
        threshold: number,
        parser: string
    ) => Promise<void>;
    onExport: (
        file1: File,
        file2: File,
        selectedColumns1: string[],
        selectedColumns2: string[],
        threshold: number,
        parser: string
    ) => Promise<void>;
    setError: Dispatch<SetStateAction<string | null>>;  // Correct type for setError
    loading: boolean;
}

export interface ColumnsState {
    file1: boolean;
    file2: boolean;
}

export type FileKey = 'file1' | 'file2';

export type ParserOption = 'usaddress' | 'pyap';

// --- Custom Error Classes ---
export class FileValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FileValidationError';
    }
}

export class ColumnValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ColumnValidationError';
    }
}

// API Response Types
export interface ColumnApiResponse {
    status: 'success' | 'error';
    data?: string[];  // Optional because it might not be present on error
    suggested_address_columns?: string[]; // Optional suggested columns
    error?: string;   // Optional error message
}

export interface AddressComparisonResult {
    source_address: string;
    normalized_source?: string; // These should be optional, in case normalization fails
    matched_address: string;
    normalized_match?: string;
    match_score: number;
    source_columns?: Record<string, string>;  // Optional: original values of source columns
    matched_columns?: Record<string, string>; // Optional: original values of matched columns
}

export interface ApiResponse {  // This is for the *overall* API response (including status, etc.)
    status: 'success' | 'error';
    data?: AddressComparisonResult[];  // The actual comparison results
    error?: string;
    metadata?: {
        total_comparisons: number; // Example metadata
        matches_found: number;
    };
    job_id?: string; // If you're using job IDs
}