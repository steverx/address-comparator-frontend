import { endpoints } from '../config/api';

export interface ComparisonRequest {
  sourceFile: any[];
  columns: string[];
  threshold: number;
}

export interface ComparisonResponse {
  status: string;
  data: Array<{
    original_row: Record<string, any>;
    matches: Array<{
      raw_address: string;
      member_id: string;
      lic: string;
      match_score: number;
    }>;
  }>;
}

export async function compareAddresses(request: ComparisonRequest): Promise<ComparisonResponse> {
  const response = await fetch(`${endpoints.compare}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}