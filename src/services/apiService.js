export async function apiRequest(endpoint, formData, isExport = false) {
    try {
        const API_URL = process.env.REACT_APP_API_URL || 'https://address-comparator-backend-production.up.railway.app';
        const fullUrl = `${API_URL}/${endpoint}`;
        console.log('Making request to:', fullUrl);

        const response = await fetch(fullUrl, {
            method: 'POST',
            body: formData,
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        return isExport ? response.blob() : response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}