// src/services/apiService.js
export const apiRequest = async (endpoint, data, isBlob = false) => {
    const API_URL = process.env.REACT_APP_API_URL || 'https://address-comparator-backend-production.up.railway.app';
    const url = `${API_URL}/${endpoint}`;
  
    try {
      console.log(`Making request to: ${url}`);
  
      const response = await fetch(url, {
        method: 'POST',
        body: data,
        // No need to set mode: 'cors' or credentials: 'include' if you aren't dealing with
        // cross-origin requests that require credentials.  If you ARE, then include them.
        // But for a standard API on the same origin or one that properly handles CORS,
        // these aren't needed.
        // headers: {  // Don't set 'Accept': 'application/json' when sending FormData
        //   'Accept': 'application/json',  // The *response* might be JSON, but you're sending FormData
        // }
      });
  
      if (!response.ok) {
        // Attempt to parse as JSON, but fall back to text if it fails.  This handles
        // cases where the server sends back an error that isn't JSON formatted.
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          // If parsing as JSON fails, get the raw text.
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status} - ${errorText || response.statusText}`);
        }
        // If we got JSON, use the 'error' property if it exists, otherwise the whole response.
        throw new Error(errorData.error || `HTTP error! status: ${response.status} - ${JSON.stringify(errorData)}`);
      }
  
  
      if (isBlob) {
        const blob = await response.blob();
        // More robust Content-Disposition parsing: handles quotes, semicolons, etc.
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'download.xlsx'; // Default filename
        if (contentDisposition) {
          const filenameRegex = /filename\*=UTF-8''([\w%\-.]+)|filename="([^"]*)"|filename=([^;]*)/;
          const match = contentDisposition.match(filenameRegex);
          if (match && (match[1] || match[2] || match[3])) {
            filename = decodeURIComponent(match[1] || match[2] || match[3]).trim(); // Decode URI-encoded filenames
          }
        }
        return { blob, filename };
      }
  
      const responseData = await response.json();
      console.log(`Response from ${endpoint}:`, responseData);
      return responseData;
    } catch (error) {
      console.error(`API request failed (${endpoint}):`, error);
      throw error; // Re-throw the error so the calling function can handle it.
    }
  };