const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Prompt the user for a project name
rl.question('Enter the project name: ', (projectName) => {
  // Step 1: Create a new project folder
  fs.mkdirSync(projectName);
  process.chdir(projectName);

  // Step 2: Initialize a new npm project
  execSync('npm init -y');

  // Step 3: Install TypeScript and necessary libraries
  execSync('npm install typescript --save-dev');
  execSync('npm install ts-node --save-dev');


  // Step 4: Set up TypeScript configuration
  const tsconfig = {
    compilerOptions: {
      target: 'ES2018',
      module: 'commonjs',
      strict: true,
      outDir: 'dist',
      esModuleInterop: true, // Allow import/export syntax
    },
    include: ['src'],
    exclude: ['node_modules'],
  };
  fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));

  // Step 5: Create source and test folders
  fs.mkdirSync('src');
  fs.mkdirSync('test');

  // Step 6: Create a sample TypeScript file
  const sampleFileContent = `
  const greeting: string = 'Hello, TypeScript!';
  console.log(greeting);
  `;
  fs.writeFileSync('src/index.ts', sampleFileContent);

  // Step 7: Create a sample test file
  const sampleTestContent = `
  test('Sample Test', () => {
    const greeting: string = 'Hello, TypeScript!';
    expect(greeting).toBe('Hello, TypeScript!');
  });
  `;
  fs.writeFileSync('test/sample.test.ts', sampleTestContent);

  // Step 8: Install testing libraries
  execSync('npm install jest @types/jest ts-jest --save-dev @jest/globals');
  execSync('npx ts-jest config:init');

  // Step 9: Update package.json scripts
  const packageJson = JSON.parse(fs.readFileSync('package.json'));
  packageJson.scripts = {
    test: 'jest',
    build: 'tsc',
    start: 'npm run test && ts-node src/index.ts',
  };
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

  console.log('Project setup complete!');
  rl.close();
});