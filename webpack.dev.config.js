// Archivo con la lógica del front
// Importar el módulo PATH
const path = require('path');
// Importing Extract Plugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// exportamos un Configuration Options Object
module.exports = {
    // 1.- Estableciendo el archivo indexador
    // del front-end
    entry: "./client/index.js",
    // 2.- Estableciendo el archivo de salida
    output: {
        // 2.1 Ruta Absoluta de Salida
        path: path.resolve(__dirname, "public"),
        // 2.2 Nombre del archivo de salida
        filename: "bundle.js",
        // 2.3 Ruta base de archivos estáticos
        publicPath: "/"
    },
    // 3.- Servidor de Desarrollo
    devServer: {
        // 3.1 Folder de estáticos
        static: path.join(__dirname, "public"),
        // 3.2 Puerto del servidor de desarrollo
        port: 8080,
        // 3.3 Definiendo HOST
        host: '0.0.0.0'
    },
    // Agregando un modulo a webpack
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    'modules': false,
                    'useBuiltIns': 'usage',
                    'targets': '> 0.25%, not dead', //version final de scripts, puede ser espécifico o genérico
                    'corejs': 3
                  }
                ]
              ]
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [new MiniCssExtractPlugin({
    // Archivo css de salida
    filename: 'styles/app.css'
  })]
}