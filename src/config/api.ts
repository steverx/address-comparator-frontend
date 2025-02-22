export const API_URL = process.env.REACT_APP_API_URL || 'https://centerbeam.proxy.rlwy.net:51058';

export const endpoints = {
    compare: `${API_URL}/compare`,
    health: `${API_URL}/health`
};