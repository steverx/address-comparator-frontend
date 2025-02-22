export const apiRequest = async (endpoint, data, isBlob = false) => {
    const API_URL = process.env.REACT_APP_API_URL || 'https://address-comparator-backend-production.up.railway.app';
    const url = `${API_URL}/${endpoint}`;

    try {
        // Log request details - Improved logging for FormData
        console.log('API Request:', {
            url,
            endpoint,
            dataType: data instanceof FormData ? 'FormData' : typeof data,
            formDataKeys: data instanceof FormData ? [...data.keys()] : null, // Log FormData keys
            isBlob // Log whether it's a blob request
        });

        const response = await fetch(url, {
            method: 'POST',
            body: data,
            headers: {
                // Only set Accept and Content-Type if NOT sending FormData
                ...(!(data instanceof FormData) && {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' // Set Content-Type for JSON requests
                })
            }
        });

        // Enhanced error handling:  Handles non-JSON errors *and* JSON errors
        if (!response.ok) {
            let errorMessage;
            try {
                // Try to parse as JSON.  If it fails, we'll get the text.
                const errorData = await response.json();
                // Look for common error message keys.  Prioritize 'error', then 'message'.
                errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
            } catch (jsonError) {
                // If parsing as JSON failed, get the raw text.
                const errorText = await response.text();
                errorMessage = errorText || response.statusText; // Use statusText if no body
            }

            throw new Error(`Request failed: ${response.status} - ${errorMessage}`);
        }

        // Handle blob responses (BEFORE trying to parse JSON)
        if (isBlob) {
            const blob = await response.blob();
            const filename = parseContentDisposition(response.headers.get('Content-Disposition'));
            console.log(`Response from ${endpoint} (blob):`, { filename }); // Log blob response
            return { blob, filename };
        }

        // Handle JSON responses
        const responseData = await response.json();

        // Validate response structure *after* handling blobs, and *after* parsing JSON
        if (!responseData || typeof responseData !== 'object') {
            throw new Error('Invalid response format: expected JSON object');
        }
        // Check for specific status, and if the response is what you expect.
        if (responseData.status === "error") {
            throw new Error(responseData.error || "An unknown error occurred.");
        }
        if (endpoint === 'compare' && !Array.isArray(responseData.data)) {
            throw new Error('Invalid response format: expected data to be an array');
        }


        // Log successful response *after* all validation.
        console.log(`Response from ${endpoint}:`, {
            status: responseData.status,  // Log the status
            hasData: Boolean(responseData.data), // Check if data exists
            metadata: responseData.metadata, // Log any metadata
            dataLength: Array.isArray(responseData.data) ? responseData.data.length : null //log data length
        });

        return responseData;

    } catch (error) {
        console.error('API Request Failed:', {
            endpoint,
            error: error.message,
            stack: error.stack
        });
        throw error; // Re-throw the error so the caller can handle it.
    }
};

// Helper function to parse Content-Disposition header (remains the same)
const parseContentDisposition = (header) => {
    if (!header) return 'download.xlsx';

    const filenameRegex = /filename\*=UTF-8''([\w%\-.]+)|filename="([^"]*)"|filename=([^;]*)/;
    const match = header.match(filenameRegex);

    if (match && (match[1] || match[2] || match[3])) {
        return decodeURIComponent(match[1] || match[2] || match[3]).trim();
    }

    return 'download.xlsx';
};