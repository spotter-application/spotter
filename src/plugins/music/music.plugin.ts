import {
  Application,
  getAllApplications,
  SpotterOption,
  SpotterPlugin,
  SpotterPluginLifecycle,
  spotterSearch,
} from '../../core';

export class MusicPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  identifier = 'Apple Music';

  private app: Application | null = null;
  private playing: boolean = false;
  private playingRequiredFor = ['Previous', 'Next', 'Pause', 'Mute', 'Unmute'];

  async onInit() {
    const apps = await getAllApplications(this.api.shell);
    this.app = apps.find(app => app.title === 'Music') ?? null;
  }

  async onOpenSpotter() {
    this.playing = await this.getPlayingState();
  }

  onQuery(query: string): SpotterOption[] {
    if (!this.app) {
      return [];
    }

    const options = this.options.filter(option => {
      const playingRequired = !this.playingRequiredFor.find(title => option.title === title);
      return this.playing ? !playingRequired : playingRequired;
    });

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
    await this.api.shell.execute("osascript -e 'tell application \"Music\" \n set player position to 0\n previous track\n end tell'")
  }

  private async next() {
    await this.api.shell.execute("osascript -e 'tell application \"Music\" to next track'")
  }

  private async pause() {
    await this.api.shell.execute("osascript -e 'tell application \"Music\" to pause'")
  }

  private async play() {
    await this.api.shell.execute("osascript -e 'tell application \"Music\" to play'")
  }

  private async mute() {
    await this.api.shell.execute("osascript -e 'tell application \"Music\" to set sound volume to 0'")
  }

  private async unmute() {
    await this.api.shell.execute("osascript -e 'tell application \"Music\" to set sound volume to 100'")
  }

  private async getPlayingState(): Promise<boolean> {
    const state = await this.api.shell.execute(`osascript -e '
      if application "Music" is running then
        tell application "Music"
        if player state is playing then
          return "1"
        else
          return "0"
        end if
          end tell
        end if
      return
    '`);

    if (!state) {
      return false;
    }

    return state === '1';
  }
}
