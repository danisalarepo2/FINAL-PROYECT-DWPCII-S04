// Cargando dependencias
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
// Importando passport
import passport from 'passport';
import morgan from 'morgan';
import mongoose from 'mongoose';
// Enable post and delete verbs
import methodOverride from 'method-override';

// Setting Webpack Modules
import webpack from 'webpack';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import WebpackHotMiddleware from 'webpack-hot-middleware';

// Importing webpack configuration
import webpackConfig from '../webpack.dev.config';
// Importing config session
import configSession from './config/configSessions';
// Importing template-engine
import configTemplateEngine from './config/templateEngine';
// Importing winston logger
import log from './config/winston';
// importing debuglogger
import debug from './services/debugLogger';
// Importing Router
import router from './router';

// Creando variable del directorio raiz
// eslint-disable-next-line
global['__rootdir'] = path.resolve(process.cwd());

// Creando la instancia de express
const app = express();

// Get the execution mode
const nodeEnviroment = process.env.NODE_ENV || 'production';

// Deciding if we add webpack middleware or not
if (nodeEnviroment === 'development') {
  // Start Webpack dev server
  debug('🛠️ Ejecutando en modo desarrollo 🛠️');
  // Adding the key "mode" with its value "development"
  webpackConfig.mode = nodeEnviroment;
  // Setting the dev server port to the same value as the express server
  webpackConfig.devServer.port = process.env.PORT;
  // Setting up the HMR (Hot Module Replacement)
  webpackConfig.entry = [
    'webpack-hot-middleware/client?reload=true&timeout=1000',
    webpackConfig.entry,
  ];
  // Agregar el plugin a la configuración de desarrollo
  // de webpack
  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
  // Creating the bundler
  const bundle = webpack(webpackConfig);
  // Enabling the webpack middleware
  app.use(
    WebpackDevMiddleware(bundle, {
      publicPath: webpackConfig.output.publicPath,
    }),
  );
  //  Enabling the webpack HMR
  app.use(WebpackHotMiddleware(bundle));
} else {
  console.log('🏭 Ejecutando en modo producción 🏭');
}

// Configuring the template engine
configTemplateEngine(app);

// Database connection checker Middleware
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    log.info('✅ Verificación de conexión a bd exitosa');
    next();
  } else {
    log.info('🔴 No pasa la verificación de conexión a la bd exitosa');
    res
      .status(503)
      .render('errors/e503View', { layout: 'errors', status: 503 });
  }
});

// Se establecen los middlewares
app.use(morgan('dev', { stream: log.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Enable post and delete verbs
app.use(methodOverride('_method'));
// Habilitando manejo de sesiones y mensajes flash
configSession(app);
// Agrendo middleware de passport
app.use(passport.initialize());
// Agregando el middleware de passport
// para el manejo de sesiones
app.use(passport.session());

// Crea un server de archivos estaticos
app.use(express.static(path.join(__dirname, '..', 'public')));

// Guardando en las variables locales
// de express el usuario deserealizado
// para que este sea accesible en las vistas
// con handlebars
app.use((req, res, next) => {
  log.info('⬇️ Guardando el usuario en la variable local');
  res.locals.user = req.user?.toJSON();
  next();
});

// Registro de Rutas
router.addRoutes(app);

export default app;
