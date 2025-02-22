export const apiRequest = async <T>(endpoint: string, data: FormData | object, isBlob = false): Promise<T> => {
    const API_URL = process.env.REACT_APP_API_URL || 'https://address-comparator-backend-production.up.railway.app';
    const url = `${API_URL}/${endpoint}`;

    try {
        // Improved logging for FormData
        if (data instanceof FormData) {
            const formDataEntries: Record<string, string[]> = {};
            // Group entries by key
            for (const [key, value] of data.entries()) {
                if (!formDataEntries[key]) {
                    formDataEntries[key] = [];
                }
                formDataEntries[key].push(value instanceof File ? value.name : String(value));
            }

            console.log('API Request:', {
                endpoint,
                url,
                type: 'FormData',
                data: formDataEntries,
                isBlob
            });
        } else {
            // JSON data logging
            console.log('API Request:', {
                endpoint,
                url,
                type: 'JSON',
                data,
                isBlob
            });
        }

        const requestInit: RequestInit = {
            method: 'POST',
            headers: data instanceof FormData ? {} : {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: data instanceof FormData ? data : JSON.stringify(data)
        };

        const response = await fetch(url, requestInit);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Log response data
        const result = isBlob ? await response.blob() : await response.json();
        console.log('Response:', {
            endpoint,
            status: response.status,
            data: isBlob ? 'Blob data' : result
        });

        return result as T;
    } catch (error) {
        console.error('API Request failed:', {
            endpoint,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
};