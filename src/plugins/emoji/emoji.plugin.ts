import { SpotterOptionBase, SpotterPlugin, SpotterPluginLifecycle, spotterSearch } from '../../core';
import SQLite from 'react-native-sqlite-2';
import emoji from './emoji-en-US.json';

export class EmojiPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  identifier = 'Emoji';

  // TODO: Add type
  private database: any;

  onInit() {
    this.database = this.initDB();
  }

  private initDB() {
    // TODO: Move logic to plugins registry
    const database = SQLite.openDatabase("spotter.db", "1.0", "", 1);
    database.transaction((txn: any) => {
      txn.executeSql("DROP TABLE IF EXISTS Options", []);
      txn.executeSql(
        "CREATE TABLE IF NOT EXISTS Options(value TEXT, keywords TEXT)",
        []
      );

      Object.entries(emoji).forEach(([emj, keywords]) => {
        txn.executeSql("INSERT INTO Options (value, keywords) VALUES (:value, :keywords)", [emj, keywords.join(';')]);
      });
    });

    return database;
  }

  async onQuery(q: string): Promise<SpotterOptionBase[]> {
    const [ prefixFromQuery, ...restQuery ] = q.split(' ');
    const queryWithoutPrefix = restQuery.join(' ');

    const query = queryWithoutPrefix ?? q;

    const result = await this.queryOnDB(query);
    const options = result.map((emj: any) => ({
      title: emj.keywords.split(';')[0],
      icon: emj.value,
      action: () => {
        this.nativeModules.clipboard.setValue(emj.value);
        this.nativeModules.shell.execute(`osascript -e 'tell application "System Events" to keystroke "v" using command down'`)
      }

    }));

    return spotterSearch(q, options, this.identifier);
  }

  private queryOnDB(query: string): Promise<SpotterOptionBase[]> {
    return new Promise((resolve) => {
      this.database.transaction((txn: any) => {
        txn.executeSql(`SELECT * FROM 'Options' WHERE keywords LIKE '%${query}%'`, [], (_: any, res: any) => {
          const result = [];
          for (let i = 0; i < res.rows.length; ++i) {
            result.push(res.rows.item(i));
          }
          resolve(result)
        });
      });
    });
  }

}

