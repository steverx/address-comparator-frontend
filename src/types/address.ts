export interface AddressData {
  [key: string]: string;
}

export interface AddressMatch {
    raw_address: string;
    member_id: string;
    lic: string;
    match_score: number;
}

export interface ComparisonResult {
    original_row: Record<string, string>;
    matches: AddressMatch[];
}

export interface ComparisonRequest {
    sourceFile: Record<string, string>[];
    columns: string[];
    threshold: number;
}

export interface AddressComparisonResult {
    source_address: string;
    matched_address: string;
    match_score: number;
}