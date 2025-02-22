export const apiRequest = async (endpoint, data, isBlob = false) => {
  const API_URL = process.env.REACT_APP_API_URL || 'https://address-comparator-backend-production.up.railway.app';
  const url = `${API_URL}/${endpoint}`;

  try {
      console.log(`Making request to: ${url}`, {
          endpoint,
          dataType: data instanceof FormData ? 'FormData' : typeof data,
          isBlob
      });

      const response = await fetch(url, {
          method: 'POST',
          body: data,
          headers: {
              // Only set Accept header if not sending FormData
              ...(!(data instanceof FormData) && {
                  'Accept': 'application/json'
              })
          }
      });

      // Enhanced error handling
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

      // Handle blob responses
      if (isBlob) {
          const blob = await response.blob();
          const filename = parseContentDisposition(response.headers.get('Content-Disposition'));
          return { blob, filename };
      }

      // Handle JSON responses
      const responseData = await response.json();
      
      // Validate response structure
      if (!responseData || typeof responseData !== 'object') {
          throw new Error('Invalid response format: expected JSON object');
      }
      
      // Log successful response
      console.log(`Response from ${endpoint}:`, {
          status: responseData.status,
          hasData: Boolean(responseData.data),
          metadata: responseData.metadata
      });
      
      return responseData;
      
  } catch (error) {
      console.error(`API request failed (${endpoint}):`, {
          error: error.message,
          stack: error.stack
      });
      throw error;
  }
};

// Helper function to parse Content-Disposition header
const parseContentDisposition = (header) => {
  if (!header) return 'download.xlsx';

  const filenameRegex = /filename\*=UTF-8''([\w%\-.]+)|filename="([^"]*)"|filename=([^;]*)/;
  const match = header.match(filenameRegex);
  
  if (match && (match[1] || match[2] || match[3])) {
      return decodeURIComponent(match[1] || match[2] || match[3]).trim();
  }
  
  return 'download.xlsx';
};