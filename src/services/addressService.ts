import { endpoints } from '../config/api';
import { AddressComparisonResult } from '../types/address';

export async function compareAddresses(fileData: any[], columns: string[], threshold: number): Promise<AddressComparisonResult[]> {
    const response = await fetch(endpoints.compare, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sourceFile: fileData,
            columns,
            threshold
        })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
}