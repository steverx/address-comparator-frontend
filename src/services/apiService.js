export async function apiRequest(endpoint, formData, isExport = false) {
    try {
        if (!endpoint) {
            throw new Error('Endpoint is required');
        }
  
        const API_URL = process.env.REACT_APP_API_URL || 'https://address-comparator-backend-production.up.railway.app';
        // Clean up the endpoint and base URL
        const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
        const baseUrl = API_URL.replace(/\/+$/, '');
        
        const fullUrl = `${baseUrl}/${cleanEndpoint}`;
        console.log('API Request URL:', fullUrl);
        console.log('Request Payload:', formData);
  
        const response = await fetch(fullUrl, {
            method: 'POST',
            body: formData,
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Origin': 'https://address-comparator-frontend-production.up.railway.app'
            }
        });
  
        // Add response debugging
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
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