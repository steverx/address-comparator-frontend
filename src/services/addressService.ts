import { endpoints } from '../config/api';
import { ComparisonResult, ApiResponse } from '../types/address';

export const compareAddresses = async (request: {
  sourceFile: Record<string, string>[],
  columns: string[],
  threshold: number
}): Promise<ComparisonResult[]> => {
  try {
    const response = await fetch(endpoints.compare, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `HTTP error! status: ${response.status}`
      );
    }

    const result: ApiResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to compare addresses:', error);
    throw error;
  }
};