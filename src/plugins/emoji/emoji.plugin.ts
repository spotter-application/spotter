import { SpotterOption, SpotterPlugin, SpotterPluginLifecycle, spotterSearch } from '../../core';
import SQLite from 'react-native-sqlite-2';
import emoji from './emoji-en-US.json';

const KEYWORDS_SEPARATOR = ';';

interface Emoji {
  keywords: string;
  value: string;
};

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
        const k = keywords.join(KEYWORDS_SEPARATOR);
        txn.executeSql("INSERT INTO Options (value, keywords) VALUES (:value, :keywords)", [emj, k]);
      });
    });

    return database;
  }

  async onQuery(q: string): Promise<SpotterOption[]> {
    const [ prefixFromQuery, ...restQuery ] = q.split(' ');
    const queryWithoutPrefix = restQuery.join(' ');

    const query = queryWithoutPrefix ?? q;

    const emojis: Emoji[] = await this.queryOnDB(query);
    const options = emojis.map((emj: Emoji) => ({
      title: emj.keywords.split(KEYWORDS_SEPARATOR)[0],
      keywords: emj.keywords.split(KEYWORDS_SEPARATOR),
      icon: emj.value,
      action: () => {
        this.nativeModules.clipboard.setValue(emj.value);
        this.nativeModules.shell.execute(`osascript -e 'tell application "System Events" to keystroke "v" using command down'`)
      }
    }));

    // return options;
    return spotterSearch(q, options, this.identifier);
  }

  private queryOnDB(query: string): Promise<Emoji[]> {
    return new Promise((resolve) => {
      this.database.transaction((txn: any) => {
        txn.executeSql(`SELECT * FROM 'Options' WHERE keywords LIKE '%${query}%'`, [], (_: any, res: any) => {
          const result: Emoji[] = [];
          for (let i = 0; i < res.rows.length; i++) {
            result.push(res.rows.item(i));
          }
          resolve(result)
        });
      });
    });
  }

}

