/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  webpack: (config, { isServer }) => {
    // Add a rule for .geojson files
    config.module.rules.push({
      test: /\.geojson$/,
      use: [
        {
          loader: 'json-loader', // Use json-loader to parse the geojson file
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
