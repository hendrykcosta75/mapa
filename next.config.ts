import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['react-map-gl', 'mapbox-gl', 'deck.gl', '@deck.gl/react', '@deck.gl/layers'],
};

export default nextConfig;
