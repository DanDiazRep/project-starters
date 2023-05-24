const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Prompt the user for a project name
rl.question('Enter the project name: ', (projectName) => {
  // Step 1: Create the project folder
  fs.mkdirSync(projectName);
  process.chdir(projectName);

  // Step 2: Initialize a new npm project
  execSync('npm init -y');

  // Step 3: Install necessary dependencies
  execSync('npm install --save-dev typescript');
  execSync('npm install --save-dev webpack webpack-cli webpack-dev-server');
  execSync('npm install html-webpack-plugin --save-dev');
  
  execSync('npm install style-loader css-loader --save-dev');
  execSync('npm install --save-dev mini-css-extract-plugin');
  execSync('npm install --save-dev @babel/core @babel/preset-env babel-loader');
  execSync('npm install --save-dev @babel/plugin-transform-typescript');
  execSync('npm install --save-dev @babel/preset-typescript');

  // Step 4: Create the necessary files and folders
  const srcFolder = 'src';
  const distFolder = 'dist';
  fs.mkdirSync(srcFolder);
  fs.mkdirSync(distFolder);
  fs.writeFileSync(`${srcFolder}/index.ts`, '');
  fs.writeFileSync('index.html', generateHtmlTemplate());

  // Step 5: Create the Babel configuration
  fs.writeFileSync('.babelrc', JSON.stringify({
    "presets": [
        "@babel/preset-env",
        "@babel/preset-typescript"
    ],
    "plugins": [
        "@babel/plugin-transform-typescript"
    ]
}));

  // Step 6: Create the TypeScript configuration
  fs.writeFileSync('tsconfig.json', generateTsConfig());

  // Step 7: Create the webpack configuration
  fs.writeFileSync('webpack.config.js', generateWebpackConfig());

  // Step 8: Update package.json scripts
  const packageJson = JSON.parse(fs.readFileSync('package.json'));
  packageJson.scripts = {
    start: 'webpack serve --mode development',
    build: 'webpack --mode production',
  };
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

  console.log('Project setup complete!');
  rl.close();
});

// Helper function to generate the HTML template
function generateHtmlTemplate() {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>My TypeScript Web App</title>
  </head>
  <body>
    <script src="bundle.js"></script>
  </body>
</html>
`;
}

// Helper function to generate the TypeScript configuration
function generateTsConfig() {
  return `
  {
    "compilerOptions": {
      "target": "es5",
      "module": "commonjs",
      "strict": false,
      "outDir": "./dist",
      "resolveJsonModule": true,
      "moduleResolution": "node",
    },
    "include": [
      "src/**/*.ts",
      "src/*.json"
    ],
    "exclude": [
      "node_modules"
    ]
  }
`;
}

// Helper function to generate the webpack configuration
function generateWebpackConfig() {
  return `
  const path = require('path');
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  const MiniCssExtractPlugin = require("mini-css-extract-plugin");
  
  module.exports = {
    entry: './src/index.ts',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
      }
      ],
    },
    resolve: {
      extensions: ['.ts', '.js',],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        inject: true,
        minify: false,
      }),
      new MiniCssExtractPlugin({
        filename: "main.css",
        chunkFilename: "main.css",
      }),
    ],
    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist'),
      },
      
      compress: true,
      port: 3000,
    },
    stats: 'errors-only',
  
  };
`;
}