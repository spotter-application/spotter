import { SpotterOptionBase, SpotterPlugin, SpotterPluginLifecycle } from '../../core';
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

  async onQuery(query: string): Promise<SpotterOptionBase[]> {
    if (!query?.length) {
      return [];
    }

    const result = await this.queryOnDB(query);
    return result.map((emj: any) => ({
      title: 'Emoji',
      icon: emj.value,
      subtitle: 'Copy to clipboard',
      action: () => this.nativeModules.clipboard.setValue(emj.value),
    }))
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

