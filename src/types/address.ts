export interface AddressData {
  [key: string]: string;
}

export interface ComparisonResult {
  original_row: AddressData;
  matches: Array<{
    raw_address: string;
    member_id: string;
    lic: string;
    match_score: number;
  }>;
}

export interface AddressComparisonResult {
    source_address: string;
    matched_address: string;
    match_score: number;
}