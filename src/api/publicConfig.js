// Loads the public institutional branding (name, logo, colors) from GET /config.
// The endpoint is public (no auth) so it also works on the login screen.
import { useEffect, useState } from 'react';
import api from './axios';

let cached = null;
let inFlight = null;

/**
 * Fetches the public config once and memoizes it for the whole app session.
 * On failure returns an empty object (components fall back to their default
 * branding) and clears the in-flight promise so the next mount can retry.
 */
export const fetchPublicConfig = () => {
  if (cached) return Promise.resolve(cached);
  if (!inFlight) {
    inFlight = api
      .get('/config')
      .then((res) => {
        cached = res.data || {};
        return cached;
      })
      .catch(() => {
        inFlight = null;
        return {};
      });
  }
  return inFlight;
};

/**
 * React hook with the institution's public branding.
 * Returns {} while loading (or if the backend is unreachable) so consumers
 * can fall back to the default brand with `config.x || 'Aulamate'`.
 */
export const usePublicConfig = () => {
  const [config, setConfig] = useState(cached || null);

  useEffect(() => {
    if (cached) return undefined;
    let mounted = true;
    fetchPublicConfig().then((c) => {
      if (mounted) setConfig(c);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return config || {};
};

/** Default brand name used until the public config loads. */
export const DEFAULT_BRAND_NAME = 'Aulamate';
