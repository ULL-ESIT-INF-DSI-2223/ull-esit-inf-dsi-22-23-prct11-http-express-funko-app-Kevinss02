---
title: Informe DSI P11
subtitle: Http-Express-FunkoApp
---

# Ejercicio - Crear un servidor Express para aplicación de registro de Funko Pops

## Enunciado

La tarea consiste en utilizar las implementaciones previas de una aplicación de registro de Funko Pops para crear un servidor HTTP usando Express. Los clientes podrán enviar solicitudes HTTP al servidor para añadir, modificar, eliminar, listar y mostrar los Funko Pops de un usuario específico. La información de los Funko Pops se almacenará como ficheros JSON en el sistema de ficheros del servidor, utilizando la misma estructura de directorios de prácticas pasadas.

## Implementación - Novedades

Se ha  modificado las funciones básicas de las operaciones add, remove, modify, read y list del archivo FunkoCollectionManager.ts, de manera que ahora implementan el patrón callback y además devuelven a su llamada una respuesta con el resultado de la operación y que sigue esta estructura definida en el fichero types.ts:
```
import { IFunkoData } from "./Funko.js";

/**
 * Default ResponseType Express server will emit
 */
export type ResponseType<T> = {
  type: 'add' | 'remove' | 'update' | 'read' | 'list';
  success: boolean;
  output: IFunkoData[] | string | undefined;
  error?: T;
}
```

Así por ejemplo, las operaciones más sencillas, read y list han quedado implementadas de la siguiente manera:

```
  /**
   * Opearion to list all existing funkos in user's system
   * @param callback - A function to be called when the operation is complete
   */
  public listFunkos(callback: (error: ResponseType<string> | null, response: ResponseType<string> | null) => void): void {
    const funkos = this._funkoCollection;
    let funkosJSON: IFunkoData[] = []; 
    let response: ResponseType<string>;
    try {
      funkos.forEach((funko) => {
        funkosJSON.push(funko.toJSON());
      });
      response = {
        type: 'list',
        success: true,
        output: funkosJSON
      }
      callback(null, response);
    } catch (e) {
      const err = "An error occurred while converting the funkos to JSON:" + e;
      let error: ResponseType<string> = {
        type: 'list',
        success: false,
        output: undefined,
        error: err
      }
      callback(error, null);
    }
  }
  
  /**
   * Operation to show information about an unique existing funko in user's system
   * @param funkoId - Funko's id to be shown
   * @param callback - A function to be called when the operation is complete
   */
  public showFunko(funkoId: string, callback: (error: ResponseType<string> | null, outputMessage: ResponseType<string> | null) => void): void {
    const funkos = this._funkoCollection;
    const funko = funkos.find((funko) => funko.id === funkoId);
  
    if (funko) {
      let result: ResponseType<string> = {
        type: 'read',
        success: true,
        output: [funko.toJSON()]
      }     
      callback(null, result);
    } else {
      const err = `Funko with ${funkoId} does not exist in system`;
      let error: ResponseType<string> = {
        type: 'read',
        success: false,
        output: undefined,
        error: err
      }
      callback(error, null);
    }
  }
}
```

# Implementación - Servidor Express

Se ha creado un fichero app.ts que contine la definición del servidor Express y que según el tipo de petición que le llegue llevará a cabo una determinada operación sobre el sistema de Funkos.

Así por ejemplo, las operaciones de "list" y "read", se llevaran a cabo cuando se reciban peticiones Http de tigo GET como queda definido a continuación:
```
app.get('/funkos', (req, res) => {
  if (!req.query.user) {
    const outputError: ResponseType<string> = {
      type: 'list' && 'read',
      success: false,
      output: undefined,
      error: 'A username has to be provided'
    }
    res.status(400).send({
      error: outputError
    })
  } else {
    const user = req.query.user.toString();
    const manager = new FunkoCollectionManager(user);
    const id = req.query.id?.toString();
    if (id) {
      manager.showFunko(id, (error, outputMessage) => {
        if (error) {
          res.status(500).send({error: error});
        } else {
          res.send({response: outputMessage});
        }
      });
    } else {
      manager.listFunkos((error, outputMessage) => {
        if (error) {
          res.status(500).send({error: error});
        } else {
          res.send({response: outputMessage});
        }
      });
    }
  }
});
```
Como se puede observar se está utilizando el patrón callback para llevar a cabo las operaciones y obtener una respuesta o un error. 

A continuación se adjuntan algunos ejemplos de ejecución del funcionamiento de este tipo de peticiones:

## Ejemplo de Read Success

![Ej Ejecución Read Success](Assets/Img/readSuccess.png)

## Ejemplo de Read Error

![Ej Ejecución Read Error](Assets/Img/readError.png)

## Ejemplo de ListSuccess

![Ej Ejecución List Success](Assets/Img/listSuccess.png)

## Ejemplo de List Error

![Ej Ejecución List Error](Assets/Img/listError.png)


El resto de las operaciones siguen una estructura parecida aunque para las operaciones add y modify hay algunos cambios pues necesitan que la petición venga con un body que no es más que un json con los atributos del funko que se quiere añadir. Para poder procesar este body se ha importado body-parser y se ha añadido la siguiente línea sobre el servidor:
```
import bodyParser from 'body-parser';

export const app = express();

/**
 * This allows to analize json format bodies
 */
app.use(bodyParser.json()); 

```

Además, se ha utilizado Ajv para definir un esquema válido para este json que se recibe con el body, de manera que se podrá validar la entrada antes de llevar a cabo las operaciones. En concreto la implementación es la siguiente:

```
import Ajv from 'ajv'
const ajv = new Ajv();

/**
 * Schema to validate json files
 */
const schema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    desc: { type: 'string' },
    type: { type: 'string' },
    genre: { type: 'string' },
    franchise: { type: 'string' },
    franchiseNumber: { type: 'number' },
    isExclusive: { type: 'boolean' },
    specialFeatures: { type: 'string' },
    marketValue: { type: 'number' },
  },
  required: ['id', 'name', 'desc', 'type', 'genre', 'franchise', 'franchiseNumber', 'isExclusive', 'specialFeatures', 'marketValue'],
};
const validate = ajv.compile(schema);
```

A continuación se muestran otros ejemplos de ejecución de la aplicación:

## Ejemplo de Add Success

![Ej Ejecución Read Success](Assets/Img/addSuccess.png)

## Ejemplo de Add Error

![Ej Ejecución Read Error](Assets/Img/addError.png)

## Ejemplo de Update Success

![Ej Ejecución List Success](Assets/Img/updateSuccess.png)

## Ejemplo de Update Error

![Ej Ejecución List Error](Assets/Img/updateError.png)

## Ejemplo de Remove Success

![Ej Ejecución List Success](Assets/Img/deleteSuccess.png)

## Ejemplo de Remove Error

![Ej Ejecución List Error](Assets/Img/deleteError.png)



# Ejercicio PE 

## Enunciado

El enunciado de este ejercicio solicitaba la creación de un servidor Express que reciba peticiones GET de comandos, lo ejecute y lo devuelva en formato JSON.

## Implementación

## App.ts

Este fichero contiene el servidor web que utiliza el framework de Node.js Express para crear rutas y servir contenido estático. Cpomo mencioné anteriormente, este servidor web permite a los usuarios ejecutar comandos en el servidor y devuelve la salida del comando ejecutado.

Se define la ruta /execmd como la propia para ejecutar comandos. Este directorio debe estar dentro de un directorio con nombre public, que permite al servidor compartir contenido.

Si la consulta HTTP no tiene un parámetro cmd válido, el servidor devuelve un código de estado 400 y un mensaje de error. Si se proporciona un parámetro cmd, el servidor crea un proceso hijo usando la función spawn del módulo child_process para ejecutar el comando. La salida del comando se almacena en una variable commandOutput y se escribe en un archivo JSON commands.json en la carpeta public/execmd. 

Luego, con la función readCommand que se exporta desde el fichero commands.ts, se lee este archivo json se devuelve su contenido en una respuesta de servidor con la siguiente estructura (definida en el fichero types.ts):
```
export type Command = {
  title: string;
  output: string
}

export type ResponseType = {
  type: 'add' | 'remove' | 'read' | 'list';
  success: boolean;
  command: Command | undefined;
}
```

Finalmente, si no se encuentra ninguna ruta coincidente, el servidor devuelve un código de estado 404 y un mensaje de error Route not Found.

## Ejemplo de ejecución

![Ej Ejecución Ejercicio PE](Assets/Img/ejerciciope.png)

# Referencias
* [Enunciado Práctica](https://ull-esit-inf-dsi-2223.github.io/prct11-http-express-funko-app/)
* [Documentación File System Node.js](https://nodejs.org/docs/latest-v19.x/api/fs.html/)
