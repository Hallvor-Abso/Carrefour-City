/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Les procedures sont lues avec readdirSync a l'execution : Next ne peut pas
  // le deviner en analysant le code, et n'embarquerait donc aucun .md dans la
  // fonction serverless. Sans cette ligne, le site deploye affiche une liste
  // vide alors que les fichiers sont bien dans le depot.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*", "./content-admin/**/*"],
  },
};

export default nextConfig;
