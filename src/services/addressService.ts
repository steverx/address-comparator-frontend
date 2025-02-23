import { ComparisonResult, ApiResponse } from '../types/address';

export async function compareAddresses(request: {
  sourceFile: Record<string, string>[];
  columns: string[];
  threshold: number;
}): Promise<ComparisonResult[]> {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to compare addresses:', error);
    throw error;
  }
}