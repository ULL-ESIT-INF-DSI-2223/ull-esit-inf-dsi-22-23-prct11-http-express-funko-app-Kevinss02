---
title: Informe DSI P10
subtitle: API's asíncronas: ficheros, procesos, sockets
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

![Ej Ejecución List Success](Assets/Img/removeSuccess.png)

## Ejemplo de Remove Error

![Ej Ejecución List Error](Assets/Img/removeError.png)



# Ejercicio PE 

## Enunciado

El enunciado de este ejercicio solicitaba la creación de un cliente / servidor cuyo funcionamiento consitiría en que el cliente sea capaz de nviar un comando como mensaje JSON a través de un socket y el servidor se encargue de ejecutarlo y devolver al cliente el resultado de la ejecución.

## Implementación

## Clase MessageEventEmitterClient

Esta clase extiende de la clase EventEmitter de Node.js, lo que significa que hereda todas las capacidades de la clase EventEmitter y puede emitir y escuchar eventos.

El constructor de la clase toma un argumento connection que es también una instancia de la clase EventEmitter. Dentro del constructor, se define una variable wholeData como una cadena vacía. Se registra un manejador de eventos en el objeto connection para el evento data. Cada vez que se emite el evento data, el manejador de eventos concatena los datos en la variable wholeData.

La función general de esta clase es crear un mecanismo para recibir y procesar mensajes a través de una conexión de red. La clase se encarga de concatenar los datos recibidos en la conexión hasta que se complete un mensaje completo y luego emite un evento message con el mensaje completo como argumento.

## Servidor 

```
import net from "net";
import { spawn } from "child_process";
import {MessageEventEmitterClient} from './eventEmitterClient.js';

net.createServer((connection) => {
    console.log("A client has connected.");

    connection.write(JSON.stringify({ type: "ready" }) + "\n");

    let commandString = '';
    connection.on("data", (dataJSON) => {
      commandString = dataJSON.toString();
      console.log(commandString);
    });

    const command = spawn("cat", ["-n", "a.txt"]); // CommandString here

    let output = "";
    command.stdout.on("data", (piece) => {
      output = piece.toString();
    });

    command.on("close", () => {
      connection.write(
        JSON.stringify({
          type: "commandOutput",
          output: output,
        }) + "\n"
      );
    });

    connection.on("close", () => {
      console.log("A client has disconnected.");
    });
  })
  .listen(60300, () => {
    console.log("Waiting for clients to connect.");
  });
```

## Cliente

```
import {connect} from 'net';
import {MessageEventEmitterClient} from './eventEmitterClient.js';

if (process.argv.length < 3) {
  console.log('Please, provide a valid command.');
} else {
  let command = '';
  for (let i = 0; i < process.argv.length - 2; i++) {
    if (i === process.argv.length - 1) { command += process.argv[i + 2]; }
    else { command += process.argv[i + 2] + " "; }
  }

  console.log(command);

  const client = new MessageEventEmitterClient(connect({port: 60300}));

  client.emit('data', command);
  
  client.on('message', (message) => {
    if (message.type === 'ready') {
      console.log(`Connection established.`);
    } else if (message.type === 'commandOutput') {
      console.log(`Execution command ${command}`);
      console.log(`Output: \n${message.output}`);
    } else {
      console.log(`Message type ${message.type} is not valid`);
    }
  });
}
```
El cliente recibe como argumento de la línea de comandos el comando que se querrá ejecutar. Luego se crea el socket correspondiente a la conexión con el puerto 60300 y el cliente emite por el socket la información de este comando a ejecutar.

Cuando el servidor envíe una respuesta de tipo message que estará en formato JSON, se imprimirá en pantalla el resultado de la ejecución.

# Referencias
* [Enunciado Práctica](https://ull-esit-inf-dsi-2223.github.io/prct11-http-express-funko-app/)
* [Documentación File System Node.js](https://nodejs.org/docs/latest-v19.x/api/fs.html/)
