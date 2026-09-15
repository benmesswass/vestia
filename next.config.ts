import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Épingle la racine du projet : un package-lock.json présent plus haut dans
  // l'arborescence de l'utilisateur ferait autrement remonter Turbopack trop loin.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
