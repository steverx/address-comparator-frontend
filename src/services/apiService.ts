// src/services/apiService.ts

export const apiRequest = async <T>(endpoint: string, data: FormData | object, isBlob = false): Promise<T> => {
    const API_URL = process.env.REACT_APP_API_URL || 'https://address-comparator-backend-production.up.railway.app';
    const url = `${API_URL}/${endpoint}`;

    try {
        // Prepare the request body and headers
        let body: BodyInit | undefined;
        const headers: { [key: string]: string } = {};

        if (data instanceof FormData) {
            body = data; // FormData handles its own Content-Type
            console.log('API Request (FormData):', { url, endpoint, formDataKeys: [...data.keys()], isBlob });
        } else {
            body = JSON.stringify(data); // Stringify JSON payloads
            headers['Content-Type'] = 'application/json'; // Set Content-Type for JSON
            headers['Accept'] = 'application/json';     // Always accept JSON for non-blob responses
            console.log('API Request (JSON):', { url, endpoint, data, isBlob});
        }


        const response = await fetch(url, {
            method: 'POST',
            body: body,  // Use the prepared body
            headers: headers, // Use the prepared headers
        });

        if (!response.ok) {
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
            } catch (jsonError) {
                const errorText = await response.text();
                errorMessage = errorText || response.statusText;
            }

            throw new Error(`Request failed: ${response.status} - ${errorMessage}`);
        }

        if (isBlob) {
            const blob = await response.blob();
            const filename = parseContentDisposition(response.headers.get('Content-Disposition'));
            console.log(`Response from ${endpoint} (blob):`, { filename });
            return { blob, filename } as T;
        }

        const responseData: T = await response.json();

        if (!responseData || typeof responseData !== 'object') {
            throw new Error('Invalid response format: expected JSON object');
        }

        if ('status' in responseData && responseData.status === "error") {
          throw new Error((responseData as any).error || "An unknown error occurred.");
        }
        if (endpoint === 'compare' && 'data' in responseData && !Array.isArray((responseData as any).data)) {
            throw new Error('Invalid response format: expected data to be an array');
        }

        console.log(`Response from ${endpoint}:`, {
            status: (responseData as any).status,
            hasData: Boolean((responseData as any).data),
            metadata: (responseData as any).metadata,
            dataLength: Array.isArray((responseData as any).data) ? (responseData as any).data.length : null
        });

        return responseData;

    } catch (error) {
        console.error('API Request Failed:', {
            endpoint,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
    }
};

// Helper function to parse Content-Disposition header
const parseContentDisposition = (header: string | null): string => {
    if (!header) return 'download.xlsx';

    const filenameRegex = /filename\*=UTF-8''([\w%\-.]+)|filename="([^"]*)"|filename=([^;]*)/;
    const match = header.match(filenameRegex);

    if (match && (match[1] || match[2] || match[3])) {
        return decodeURIComponent((match[1] || match[2] || match[3]).trim());
    }

    return 'download.xlsx';
};