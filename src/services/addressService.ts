import { ComparisonRequest, ComparisonResult } from '../types/address';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export async function compareAddresses(request: ComparisonRequest): Promise<ComparisonResult[]> {
    let attempts = 0;
    while (attempts < MAX_RETRIES) {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/compare`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return data.data;
        } catch (error) {
            attempts++;
            if (attempts === MAX_RETRIES) throw error;
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
    throw new Error('Failed to compare addresses');
}