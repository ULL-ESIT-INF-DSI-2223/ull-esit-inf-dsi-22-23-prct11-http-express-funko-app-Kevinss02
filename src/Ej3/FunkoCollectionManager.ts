import { IFunkoData, Funko, FunkoType, FunkoGenre } from "./Funko.js";
import * as fs from "fs";
import chalk from "chalk";

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
    public filename = "data",
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
   */
  public addFunko(funko: Funko): string {
    let result = '';
    if (this._funkoCollection.find((f) => f.id === funko.id)) {
      result += chalk.red(`A Funko with ID ${funko.id} already exists in the collection.`);
    } else {
      this._funkoCollection.push(funko);
      this.writeUserJSON(this.filename, this._user, [funko]);
      result += chalk.green(`Funko with ID ${funko.id} has been added to the collection.`);
    }
    return result;
  }
  
  /**
   * Operation to modify an existing funko
   * @param funkoId - Funko unique identificator
   * @param modifiedFunko - New funko to be stored instead
   */
  public modifyFunko(funkoId: string, modifiedFunko: Funko): string {
    const index = this._funkoCollection.findIndex((f) => f.id === funkoId);
    let result = '';
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
      } catch (err) {
        result += chalk.red(`Error modifying file ${path}: ${err}`);
      }
      this.writeUserJSON(this.filename, this._user, [modifiedFunko]);
      result += chalk.green(`Funko with ID ${funkoId} has been modified in the collection.`);
    } else {
      result += chalk.red(`A Funko with ID ${funkoId} does not exist in the collection.`);
    }
    return result;
  }
  
  /**
   * Operation to remove a funko from the system
   * @param funkoId - Funko unique identificator
   */
  public removeFunko(funkoId: string): string {
    const index = this._funkoCollection.findIndex((f) => f.id === funkoId);
    let result = '';
    if (index !== -1) {
      this._funkoCollection.splice(index, 1);
      const path = this.getUserFunkoPath(this.filename, this._user, funkoId);
      try {
        fs.unlinkSync(path);
      } catch (err) {
        result += chalk.red(`Error modifying file ${path}: ${err}`);
      }
      result += chalk.green(`Funko with ID ${funkoId} has been removed from the collection.`);
    } else {
      result += chalk.red(`A Funko with ID ${funkoId} does not exist in the collection.`);
    }
    return result;
  }

  /**
   * Opearion to list all existing funkos in user's system
   */
  public listFunkos(): string {
    const funkos = this._funkoCollection;
    const marketValues = funkos.map((funko) => funko.marketValue);
    const maxValue = Math.max(...marketValues);
    const minValue = Math.min(...marketValues);
    let result = '';
    funkos.forEach((funko) => {
      const marketValueColor = this.getMarketValueColor(funko.marketValue, minValue, maxValue);
      result += (
        chalk.green.bold(`(${funko.id}) ${funko.name}`) +
          chalk.blue(` (${chalk.italic(funko.type)})`) +
          chalk.white(` - ${funko.desc}`) +
          chalk.yellow(` - SpecialFeatures: ${funko.specialFeatures}`) +
          chalk.blue(` - Genre: ${funko.genre}`) +
          chalk.magenta(` - Franchise: ${funko.franchise}`) +
          chalk.cyan(` - FranchiseNumber: ${funko.franchiseNumber}`) +
          chalk.yellow(` - Exclusive: ${funko.isExclusive}`) +
          chalk.white(` - MarketValue: ${marketValueColor} $`)
      ); 
      result +='\n';
    });
    return result;
  }

  /**
   * Operation to show information about an unique existing funko in user's system
   * @param funkoId - Funko's id to be shown
   */
  public showFunko(funkoId: string): string {
    const funkos = this._funkoCollection;
    const funko = funkos.find((funko) => funko.id === funkoId);
    let result: string = '';
  
    if (funko) {
      const marketValues = funkos.map((funko) => funko.marketValue);
      const maxValue = Math.max(...marketValues);
      const minValue = Math.min(...marketValues);
      const marketValueColor = this.getMarketValueColor(funko.marketValue, minValue, maxValue);
  
      result = (
        chalk.green.bold(`(${funko.id}) ${funko.name}`) +
          chalk.blue(` (${chalk.italic(funko.type)})`) +
          chalk.white(` - ${funko.desc}`) +
          chalk.yellow(` - SpecialFeatures: ${funko.specialFeatures}`) +
          chalk.blue(` - Genre: ${funko.genre}`) +
          chalk.magenta(` - Franchise: ${funko.franchise}`) +
          chalk.cyan(` - FranchiseNumber: ${funko.franchiseNumber}`) +
          chalk.yellow(` - Exclusive: ${funko.isExclusive}`) +
          chalk.white(` - MarketValue: ${marketValueColor} $`)
      );        
    } else {
      result = (
        chalk.red(`Error. Funko with ${funkoId} does not exist in system`)
      );
    }

    return result;
  }

  /**
   * Returns the color to use for the given market value, based on the provided ranges.
   * @param marketValue - The market value to get the color for.
   * @param min - The minimum market value in the range.
   * @param max - The maximum market value in the range.
   * @returns The color to use for the given market value.
   */
  private getMarketValueColor(marketValue: number, min: number, max: number): string {
    const range1 = min + (max - min) / 4;
    const range2 = min + (max - min) / 2;
    const range3 = max - (max - min) / 4;
  
    if (marketValue <= range1) {
      return chalk.red(String(marketValue));
    } else if (marketValue <= range2) {
      return chalk.yellow(String(marketValue));
    } else if (marketValue <= range3) {
      return chalk.blue(String(marketValue));
    } else {
      return chalk.green(String(marketValue));
    }
  }
  
}
