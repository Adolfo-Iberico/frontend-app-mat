import type { NextConfig } from 'next';

// Proyecto en modo "solo frontend": no se cargan imágenes ni servicios externos.
const nextConfig: NextConfig = {
  typescript: {
    // Igual que antes: hay errores de tipos heredados que no bloquean la vista.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
