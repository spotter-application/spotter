import {
  Application,
  getAllApplications,
  SpotterOption,
  SpotterPlugin,
  SpotterPluginLifecycle,
  spotterSearch,
} from '../../core';

export class SpotifyPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  identifier = 'Spotify';

  extendableForOption = 'Spotify';

  private app: Application | null = null;

  private currentTrackURL: string | null = null;
  private appOpened: boolean = false;

  async onInit() {
    const apps = await getAllApplications(this.api.shell);
    this.app = apps.find(app => app.title === 'Spotify') ?? null;
  }

  async onOpenSpotter() {
    this.appOpened = await this.checkOpened();
    this.currentTrackURL = await this.getCurrentTrackURL();
  }

  async onQuery(query: string): Promise<SpotterOption[]> {
    if (!this.app) {
      return [];
    }

    const childOptions: SpotterOption[] = [
      ...(this.currentTrackURL
        ? [{
          title: 'Share',
          subtitle: 'Copy current track url',
          icon: this.app.path,
          action: () => this.api.clipboard.setValue(this.currentTrackURL ?? '')
        }] : []
      ),
      ...(this.appOpened
        ? [
            {
              icon: this.app.path,
              title: 'Close',
              subtitle: `Kill all instances of ${this.app.title}`,
              action: () => this.api.shell.execute(`killall "${this.app?.title}"`),
            },
            ...this.options,
          ]
        : [{
          icon: this.app.path,
          title: 'Open',
          action: async () => await this.api.shell.execute(`open "${this.app?.path}"`),
        }]
      ),
    ];

    const options: SpotterOption[] = [
      {
        title: 'Spotify',
        subtitle: '',
        icon: this.app.path,
        action: async () => await this.api.shell.execute(`open "${this.app?.path}"`),
        onQuery: (q: string) => {
          if (!q?.length) {
            return childOptions;
          }

          return spotterSearch(q, childOptions);
        },
      }
    ];

    return spotterSearch(query, options, this.identifier);
  }

  public get options(): SpotterOption[] {
    return [
      {
        title: 'Previous',
        icon: this.app?.path,
        action: () => this.previous(),
      },
      {
        title: 'Next',
        icon: this.app?.path,
        action: () => this.next(),
      },
      {
        title: 'Play / Pause',
        icon: this.app?.path,
        action: () => this.playPause(),
      },
      {
        title: 'Mute',
        icon: this.app?.path,
        action: () => this.mute(),
      },
      {
        title: 'Unmute',
        icon: this.app?.path,
        action: () => this.unmute(),
      },
    ];
  }

  private async previous() {
    await this.api.shell.execute("osascript -e 'tell application \"Spotify\" \n set player position to 0\n previous track\n end tell'")
  }

  private async next() {
    await this.api.shell.execute("osascript -e 'tell application \"Spotify\" to next track'")
  }

  private async playPause() {
    await this.api.shell.execute("osascript -e 'tell application \"Spotify\" to playpause'")
  }

  private async mute() {
    await this.api.shell.execute("osascript -e 'tell application \"Spotify\" to set sound volume to 0'")
  }

  private async unmute() {
    await this.api.shell.execute("osascript -e 'tell application \"Spotify\" to set sound volume to 100'")
  }

  private async getCurrentTrackURL(): Promise<string | null> {
    const meta = await this.api.shell.execute(`osascript -e '
      if application "Spotify" is running then
        tell application "Spotify"
        if player state is playing then
          return (get id of current track) as text
        else
          return "0"
        end if
          end tell
        end if
      return
    '`);

    if (!meta || meta === '0') {
      return null;
    }

    const id = meta.split(':')[2];

    if (!id) {
      return null;
    }

    return `https://open.spotify.com/track/${id}`;
  }

  private async checkOpened(): Promise<boolean> {
    return await this.api.shell
      .execute("pgrep Spotify || echo 0")
      .then(result => result !== '0');
  }
}
