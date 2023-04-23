import { IFunkoData, Funko, FunkoType, FunkoGenre } from "./Funko.js";
import * as fs from "fs";
import chalk from "chalk";
import { ResponseType } from "./types.js";

/**
 * FunkoCollectionManager - Class that includes all valid Management Operations
 * upon System Funko Collection
 * @class
 */
export class FunkoCollectionManager {
  private _funkoCollection: Funko[] = [];
  private _user: string;
  
  /**
   * Constructor of FuncoCollectionMangaer class
   * @param user - Logged User 
   * @param filename - Dir where data will be stored
   * @param funkoCollection - (Optional) A collection of Funko Figures
   */
  constructor(
    user: string,
    public filename = "public/funkos",
    funkoCollection?: Funko[]
  ) {
    this._user = user;

    if (funkoCollection) {
      this._funkoCollection = funkoCollection;
    } else {
      if (!fs.existsSync(filename)) {
        fs.mkdirSync(filename);
      }

      const userDirectory = this.getUserDirectory(filename, user);
      if (!fs.existsSync(userDirectory)) {
        fs.mkdirSync(userDirectory);
      }

      this.readUserJSON(filename, user);
    }
  }
  
  /**
   * Method to get User Directory Path
   * @param filename - Dir where data will be stored
   * @param user - User logged
   * @returns Path of user directory
   */
  private getUserDirectory(filename: string, user: string): string {
    return `${filename}/${user}`;
  }
  
  /**
   * Method to get User Funko Path
   * @param filename - Dir where data will be stored
   * @param user - User logged
   * @param funkoId - Funko unique identificator
   * @returns User Funko Path
   */
  private getUserFunkoPath(
    filename: string,
    user: string,
    funkoId: string
  ): string {
    const userDirectory = this.getUserDirectory(filename, user);
    const userFunkoFilename = funkoId + ".json";
    return `${userDirectory}/${userFunkoFilename}`;
  }
  
  /**
   * Method to read a JSON file and charge data
   * @param filename - Dir where data will be stored
   * @param user - User logged
   * @returns Undefined if file does not exist
   */
  private readUserJSON(filename: string, user: string): void | undefined {
    const userDirectory = this.getUserDirectory(filename, user);
    console.log(chalk.blue(userDirectory));
    if (!fs.existsSync(userDirectory)) {
      console.error(chalk.red(`Couldn't find ${userDirectory}`));
      return undefined;
    }

    const files = fs.readdirSync(userDirectory);
    for (const file of files) {
      const filepath = `${userDirectory}/${file}`;
      const content = fs.readFileSync(filepath, "utf-8");
      const funkoData: IFunkoData = JSON.parse(content);
      this._funkoCollection.push(
        new Funko("", "", "", FunkoType.POP, FunkoGenre.ANIMATION, "", 0, false, "", 0).parse(funkoData)
      );
    }
  }
  
  /**
   * Method to write a list of Funkos into User's Directory
   * @param filename - Dir where data will be stored
   * @param user - User logged
   * @param funkos - List of Funkos to be written
   */
  private writeUserJSON(filename: string, user: string, funkos: Funko[]): void {
    const userDirectory = this.getUserDirectory(filename, user);
    if (!fs.existsSync(userDirectory)) {
      fs.mkdirSync(userDirectory);
    }

    for (let funko of funkos) {
      const funkoData = funko.toJSON();
      const userFunkoPath = this.getUserFunkoPath(filename, user, funko.id);
      let data = JSON.stringify(funkoData, null, 2);
      fs.writeFileSync(userFunkoPath, data, "utf-8");
    }
  }
  
  /**
   * Operation to add a funko to the system
   * @param funko - Funko to be added
   * @param callback - A function to be called when the operation is complete
   */
  public addFunko(funko: Funko, callback: (err: ResponseType<string> | null, result: ResponseType<string> | null) => void): void {
    if (this._funkoCollection.find((f) => f.id === funko.id)) {
      const err = `A Funko with ID ${funko.id} already exists in the collection.`;
      const error: ResponseType<string> = {
        type: 'add',
        success: false,
        output: undefined,
        error: err
      };
      callback(error, null);
    } else {
      this._funkoCollection.push(funko);
      this.writeUserJSON(this.filename, this._user, [funko]);
      const output = `Funko with ID ${funko.id} has been added to the collection.`;
      const outputMessage: ResponseType<string> = {
        type: 'add',
        success: true,
        output: output
      };
      callback(null, outputMessage);
    }
  }
  
  
  /**
   * Operation to modify an existing funko
   * @param funkoId - Funko unique identificator
   * @param modifiedFunko - New funko to be stored instead
   * @param callback - A function to be called when the operation is complete
   */
  public modifyFunko(funkoId: string, modifiedFunko: Funko, callback: (err: ResponseType<string> | null, result: ResponseType<string> | null) => void): void {
    const index = this._funkoCollection.findIndex((f) => f.id === funkoId);
    let response: ResponseType<string>;
    let error: ResponseType<string>;
    if (index !== -1) {
      const indx = this._funkoCollection.findIndex(
        (f) => f.id === modifiedFunko.id
      );
      if (indx !== -1) {
        this._funkoCollection.splice(index, 1);
      } else {
        this._funkoCollection[index] = modifiedFunko;
      }
      const path = this.getUserFunkoPath(this.filename, this._user, funkoId);
      try {
        fs.unlinkSync(path);
      } catch (e) {
        let err = `Error modifying file ${path}: ${e}`;
        error = {
          type: 'update',
          success: false,
          output: undefined,
          error: err
        }
        callback(error, null);
      }
      this.writeUserJSON(this.filename, this._user, [modifiedFunko]);
      let output = `Funko with ID ${funkoId} has been modified in the collection.`;
      response = {
        type: 'update',
        success: true,
        output: output
      }
      callback(null, response);
    } else {
      let err = `A Funko with ID ${funkoId} does not exist in the collection.`;
      error = {
        type: 'update',
        success: false,
        output: undefined,
        error: err
      }
      callback(error, null);
    }
  }
  
  /**
     * Operation to remove a funko from the system
     * @param funkoId - Funko unique identificator
     * @param callback - Callback function to be executed after removeFunko is done
     */
  public removeFunko(funkoId: string, callback: (error: ResponseType<string> | null, response: ResponseType<string> | null) => void): void {
    const index = this._funkoCollection.findIndex((f) => f.id === funkoId);
    if (index !== -1) {
      this._funkoCollection.splice(index, 1);
      const path = this.getUserFunkoPath(this.filename, this._user, funkoId);
      try {
        fs.unlinkSync(path);
      } catch (e) {
        let err = `Error modifying file ${path}: ${e}`;
        const error: ResponseType<string> = {
          type: 'remove',
          success: false,
          output: undefined,
          error: err
        }
        callback(error, null);
        return;
      }
      let result = `Funko with ID ${funkoId} has been removed from the collection.`;
      const response: ResponseType<string> = {
        type: 'remove',
        success: true,
        output: result
      }
      callback(null, response);
    } else {
      let err = `A Funko with ID ${funkoId} does not exist in the collection.`;
      const error: ResponseType<string> = {
        type: 'remove',
        success: false,
        output: undefined,
        error: err
      }
      callback(error, null);
    }
  }

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
