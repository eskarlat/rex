/** Generates a tsconfig.json for any extension type. */
export function getTsconfig(): string {
  const config = {
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      declaration: true,
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
    },
    include: ['src'],
    exclude: ['dist', 'node_modules'],
  };
  return JSON.stringify(config, null, 2) + '\n';
}
