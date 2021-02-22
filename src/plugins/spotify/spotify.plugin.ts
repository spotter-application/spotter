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

  private app: Application | null = null;
  private currentTrackURL: string | null = null;
  private currentTrackRequiredFor = ['Previous', 'Next', 'Pause', 'Mute', 'Unmute'];

  async onInit() {
    const apps = await getAllApplications(this.nativeModules.shell);
    this.app = apps.find(app => app.title === 'Spotify') ?? null;
  }

  async onOpenSpotter() {
    this.currentTrackURL = await this.getCurrentTrackURL()
  }

  onQuery(query: string): SpotterOption[] {
    if (!this.app) {
      return [];
    }

    const options = [
      ...(this.options.filter(option => {
          const playingRequired = this.currentTrackRequiredFor.find(title => option.title === title);
          return this.currentTrackURL ? playingRequired : !playingRequired;
        })
      ),
      ...(this.currentTrackURL
        ? [{
          title: 'Share',
          subtitle: 'Copy current track url',
          icon: this.app.path,
          action: () => this.nativeModules.clipboard.setValue(this.currentTrackURL ?? '')
        }] : []
      )
    ];

    return spotterSearch(query, options, this.identifier);
  }

  public get options(): SpotterOption[] {
    if (!this.app) {
      return [];
    }

    return [
      {
        title: 'Previous',
        icon: this.app.path,
        action: () => this.previous(),
      },
      {
        title: 'Next',
        icon: this.app.path,
        action: () => this.next(),
      },
      {
        title: 'Pause',
        icon: this.app.path,
        action: () => this.pause(),
      },
      {
        title: 'Play',
        icon: this.app.path,
        action: () => this.play(),
      },
      {
        title: 'Mute',
        icon: this.app.path,
        action: () => this.mute(),
      },
      {
        title: 'Unmute',
        icon: this.app.path,
        action: () => this.unmute(),
      },
    ];
  }

  private async previous() {
    await this.nativeModules.shell.execute("osascript -e 'tell application \"Spotify\" \n set player position to 0\n previous track\n end tell'")
  }

  private async next() {
    await this.nativeModules.shell.execute("osascript -e 'tell application \"Spotify\" to next track'")
  }

  private async pause() {
    await this.nativeModules.shell.execute("osascript -e 'tell application \"Spotify\" to pause'")
  }

  private async play() {
    console.log('PLAY!!!!!!!!!!')
    await this.nativeModules.shell.execute("osascript -e 'tell application \"Spotify\" to play'")
  }

  private async mute() {
    await this.nativeModules.shell.execute("osascript -e 'tell application \"Spotify\" to set sound volume to 0'")
  }

  private async unmute() {
    await this.nativeModules.shell.execute("osascript -e 'tell application \"Spotify\" to set sound volume to 100'")
  }

  private async getCurrentTrackURL(): Promise<string | null> {
    const meta = await this.nativeModules.shell.execute(`osascript -e '
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
}
