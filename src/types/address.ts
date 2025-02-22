export interface AddressMatch {
    raw_address: string;
    member_id: string;
    lic: string;
    match_score: number;
}

export interface MatchResult {
    original_row: Record<string, any>;
    matches: AddressMatch[];
}

export interface AddressComparisonResult {
    source_address: string;
    matched_address: string;
    match_score: number;
}