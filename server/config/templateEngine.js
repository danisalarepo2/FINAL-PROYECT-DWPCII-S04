// Se importa el objeto "engine" y se renombra
// como "exphbs"

import { engine as exphbs } from 'express-handlebars';
import path from 'path';

// funcion de configuracion
export default (app) => {
  // Se registra el motor de plantillas
  app.engine(
    'hbs',
    exphbs({
      // Se define extensión de la plantilla
      extname: '.hbs',
      // Se define el nombre del layout del proyecto
      defaultLayout: 'main',
    }),
  );
  console.log(__dirname);

  // Se selecciona el motor de plantilla
  app.set('view engine', 'hbs');
  // Se establece la ruta de las vistas
  app.set('views', path.join(__dirname, '..', 'views'));

  // Se retorna la instancia de la app
  return app;
};
