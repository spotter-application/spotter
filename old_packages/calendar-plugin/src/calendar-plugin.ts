import {Plugin} from '@spotter-app/plugin';
import {Event} from './interfaces';
import {run} from '@jxa/run';
import {execPromise} from './helpers';
import {join} from 'node:path';
import {parse, ParsedResult} from 'chrono-node';

new class CalendarPlugin extends Plugin {
  private appPath = '/System/Applications/Calendar.app';
  private cliPath = join(__dirname, 'lib') + '/calendarEvent';
  private date = new Date();

  constructor() {
    super('calendar-plugin');
  }
  async onInit() {
    await execPromise(`chmod 775 ${this.cliPath}`)
    this.date = new Date();
    this.spotter.setRegisteredOptions([
      {
        title: 'Calendar',
        icon: this.appPath,
        onQuery: (q) => this.menu(q),
        replaceOptions: ['Calendar']
      }
    ])
  }

  async menu(query: string, num?: number) {
    num ? this.date.setDate(this.date.getDate() + num) : this.date = new Date();
    const res = [];

    const search = parse(query);
    const date = search[0] ? search[0].start.date().toISOString() : this.date.toISOString()
    const eDate = search[0] && search[0].end ? `--end-date "${search[0].end.date().toISOString()}"` : "";
    const cmd: [string] = JSON.parse((await execPromise(`${this.cliPath} events "${date}" ${eDate}`)));
    const events: Event[] = cmd.map(e => {
      return JSON.parse(e);
    })

    events
      .sort((a,b) => (new Date(a.start) as any) - (new Date(b.start) as any))
      .map(e => {
        res.push( {
          title: e.title,
          icon: this.appPath,
          subtitle: `${e.allDay ? "All day long" : `${e.start} to ${e.end}`}`,
          onSubmit: () => this.open(e.start)
        })
      })

    res.push(
      {
        title: 'Next day',
        onQuery: (q) => this.menu(q, 1),
      },
      {
        title: 'Previous day',
        onQuery: (q) => this.menu(q, -1),
      },
      {
        title: 'Create event',
        onQuery: (q) => this.createSetName(q),
      }
    )
    return res;
  }

  createSetName(name: string) {
    this.spotter.setPlaceholder('New event name...');

    if (!name.length) {
      return [];
    }

    return [
      {
        title: `Create event ${name}`,
        onQuery: (date) => {
          this.spotter.setPlaceholder('Set event time...');
          const parseDate = parse(date);
          if (!parseDate[0]) {
            return [];
          }

          //let dateString = parseDate[0].start.date().toString();
          //const dateGmt = dateString.indexOf('GMT');
          //dateString = dateString.substring(0, (dateGmt === -1) ? dateString.length : dateGmt);

          //let endDate = parseDate[0] && parseDate[0].end ? ` - ${parseDate[0].end.date().toString()}` : "";
          //const endGtm = endDate.indexOf('GMT');
          //endDate = endDate.substring(0, (endGtm === -1) ? endDate.length : endGtm);

          return [
            {
              title: `Set date`,
              onQuery: async (q) => {
                const cmd = (await execPromise(`${this.cliPath} calendars`)).split('\n');
                return(
                  cmd.filter((c) => c.includes(q)).map(c => {
                    return {
                      title: c,
                      onSubmit: () => this.createEvent(name, parseDate, c)
                    }
                  })
                )
              }
            }
          ]
        }
      },
    ];
  }

  async createEvent(name: string, date: ParsedResult[], calendar: string) {
    const startDate = date[0].start.date().toISOString();
    const endDate = date[0] && date[0].end ? `--end-date ${date[0].end.date().toISOString()}` : "";
    await execPromise(`${this.cliPath} create-event "${name}" "${calendar}" ${startDate} ${endDate}`)
  }

  async open(date: string) {
    await run( (args) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const Calendar = Application("Calendar")
      Calendar.switchView({to: "day view"})
      Calendar.viewCalendar({at: new Date(args)})
    },(date + 'Z').replace(' ', 'T'))
  }
}
