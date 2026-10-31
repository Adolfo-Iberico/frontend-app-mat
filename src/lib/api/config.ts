const LOCAL_API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export function getApiBaseUrl(): string {
  const configuredUrl = process.env.API_BASE_URL;

  if (!configuredUrl) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('API_BASE_URL must be configured in production.');
    }

    return LOCAL_API_BASE_URL;
  }

  const url = new URL(configuredUrl);
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
    throw new Error('API_BASE_URL must use HTTPS in production.');
  }

  return configuredUrl.replace(/\/+$/, '');
}
