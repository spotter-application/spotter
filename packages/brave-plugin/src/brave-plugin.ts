import { Plugin, promisedExec } from '@spotter-app/plugin';
import axios from 'axios';

const SEPARATOR = '%%%';

new class CalculatorPlugin extends Plugin {
  private appPath = '/applications/Brave Browser.app';

  constructor() {
    super('brave-plugin');
  }

  async onInit() {
    this.spotter.setRegisteredOptions([{
      prefix: 'b',
      title: 'Brave Browser',
      icon: this.appPath,
      replaceOptions: ['Brave Browser'],
      onSubmit: () => this.openBrowser(),
      onQuery: async (q: string) => await this.getTabOptions(q),
    }]);
  }

  private async getTabOptions(q: string) {
    const tabs = await this.getOpenedTabs();
    return tabs
      .filter(t => !q.length || t.title.toLowerCase().startsWith(q))
      .map(({title, subtitle, url, icon}) => {
        return {
          title,
          subtitle,
          icon,
          onSubmit: () => {
            this.openBrowser();
            this.openTab(url);
            return true;
          },
        }
      });
  }

  private openBrowser() {
    promisedExec(`open "${this.appPath}"`);
  }

  private openTab(url: string) {
    promisedExec(`osascript << EOF
      tell application "Brave"
        set i to 0
        repeat with t in (tabs of (first window whose index is 1))
            set i to i + 1
            if URL of t is "${url}" then
                set (active tab index of (first window whose index is 1)) to i
            end if
        end repeat
      end tell
    EOF`);
  }

  private async getOpenedTabs() {
    const result: string = await promisedExec(`osascript << EOF
      set titleString to ""
      tell application "Brave"
        set window_list to every window # get the windows
        repeat with the_window in window_list # for every window
          set tab_list to every tab in the_window # get the tabs
          repeat with the_tab in tab_list # for every tab
            set the_url to the URL of the_tab # grab the URL
            set the_title to the title of the_tab # grab the URL
            set titleString to titleString & the_url & "${SEPARATOR}" & the_title & "\n"
          end repeat
        end repeat
        return titleString
      end tell
    EOF`);

    const storage = await this.spotter.getStorage();

    const tabs = await Promise.all(result.split('\n').filter(tab => !!tab).map(async t => {
      const [url, title] = t.split(SEPARATOR);
      const { hostname } = new URL(url);


      const icon = storage[hostname];

      if (!icon) {
        this.fetchIcon(hostname);
      }

      return {
        title: hostname.replace('www.', ''),
        subtitle: title,
        url,
        icon: icon ?? `https://www.google.com/s2/favicons?domain=${hostname}`,
      }
    }));

    return tabs;
  }

  private fetchIcon(hostname: string) {
    axios(`http://favicongrabber.com/api/grab/${hostname}?pretty=true`)
      .then(({ data }) => {
        if (!data?.icons) {
          return null;
        }
    
        const icon = data.icons[2] ? data.icons[2].src : data.icons[0].src;

        if (icon) {
          this.spotter.patchStorage({
            [hostname]: icon,
          });
        };

      })
      .catch(() => null);
  }

}
