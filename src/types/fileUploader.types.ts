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

// --- Custom Error Classes (Moved here) ---
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

// You *could* put API response types here too, for even more organization:
export interface ColumnApiResponse {
    status: 'success' | 'error';
    data?: string[];  // Optional because it might not be present on error
    suggested_address_columns?: string[]; // Optional suggested columns
    error?: string;   // Optional error message
}