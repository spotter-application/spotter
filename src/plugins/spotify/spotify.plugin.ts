import {
  getAllApplications,
  SpotterOption,
  SpotterPlugin,
  SpotterPluginLifecycle,
  spotterSearch,
} from '../../core';
import icon from './icon.png';

export class SpotifyPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  public title = 'Spotify';

  private enabled = false;
  private currentTrackURL: string | null = null;
  private currentTrackRequired = ['Previous', 'Next', 'Pause', 'Mute', 'Unmute'];

  async onInit() {
    const apps = await getAllApplications(this.nativeModules.shell);
    this.enabled = !!apps.find(app => app.title === 'Spotify');
  }

  async onOpenSpotter() {
    this.currentTrackURL = await this.getCurrentTrackURL()
  }

  onQuery(query: string): SpotterOption[] {
    if (!this.enabled) {
      return [];
    }

    const options = [
      ...(this.currentTrackURL
        ? this.options
        : this.options.filter(option => !this.currentTrackRequired.find(title => option.title === title))
      ),
      ...(this.currentTrackURL
        ? [{
          title: 'Share',
          subtitle: 'Copy current track url',
          icon,
          action: () => this.nativeModules.clipboard.setValue(this.currentTrackURL ?? '')
        }] : []
      )
    ];

    return spotterSearch(query, options);
  }

  public get options(): SpotterOption[] {
    if (!this.enabled) {
      return [];
    }

    return [
      {
        title: 'Previous',
        subtitle: 'Spotify Previous track',
        icon,
        action: () => this.previous(),
      },
      {
        title: 'Next',
        subtitle: 'Spotify Next track',
        icon,
        action: () => this.next(),
      },
      {
        title: 'Pause',
        subtitle: 'Spotify Pause',
        icon,
        action: () => this.pause(),
      },
      {
        title: 'Play',
        subtitle: 'Spotify Play',
        icon,
        action: () => this.play(),
      },
      {
        title: 'Mute',
        subtitle: 'Spotify Mute',
        icon,
        action: () => this.mute(),
      },
      {
        title: 'Unmute',
        subtitle: 'Spotify Unmute',
        icon,
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
