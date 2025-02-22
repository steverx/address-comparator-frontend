// First, define the ParserOption type
export type ParserOption = 'usaddress' | 'pyap';

export const FILE_CONFIG = {
    ALLOWED_TYPES: ['.csv', '.xlsx'] as const,
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ERROR_MESSAGES: {
        NO_FILE: 'No file selected',
        SIZE_EXCEED: 'File size exceeds 10MB limit',
        INVALID_TYPE: 'Invalid file type. Please use CSV or Excel files.',
        DUPLICATE: 'Please select different files for comparison'
    }
} as const;

// Then use the ParserOption type in the PARSER_OPTIONS constant
export const PARSER_OPTIONS: Record<string, ParserOption> = {
    USADDRESS: 'usaddress',
    PYAP: 'pyap'
} as const;

// This line is no longer needed since we defined ParserOption explicitly
// export type ParserOption = typeof PARSER_OPTIONS[keyof typeof PARSER_OPTIONS];