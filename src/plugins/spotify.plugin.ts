import {
  SpotterOption,
  SpotterPlugin,
  SpotterPluginLifecycle,
  spotterSearch,
} from '../core';

export class SpotifyPlugin extends SpotterPlugin implements SpotterPluginLifecycle {

  onQuery(query: string): SpotterOption[] {
    return spotterSearch(query, this.options);
  }

  private get options(): SpotterOption[] {
    return [
      {
        title: 'Previous',
        subtitle: 'Spotify Previous track',
        image: '',
        action: () => this.previous(),
      },
      {
        title: 'Next',
        subtitle: 'Spotify Next track',
        image: '',
        action: () => this.next(),
      },
      {
        title: 'Pause',
        subtitle: 'Spotify Pause',
        image: '',
        action: () => this.pause(),
      },
      {
        title: 'Play',
        subtitle: 'Spotify Play',
        image: '',
        action: () => this.play(),
      },
      {
        title: 'Mute',
        subtitle: 'Spotify Mute',
        image: '',
        action: () => this.mute(),
      },
      {
        title: 'Unmute',
        subtitle: 'Spotify Unmute',
        image: '',
        action: () => this.unmute(),
      },
      {
        title: 'Toggle play/pause',
        subtitle: 'Spotify Toggle play/pause',
        image: '',
        action: () => this.togglePlayPause(),
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

  private async togglePlayPause() {
    await this.nativeModules.shell.execute("osascript -e 'tell application \"Spotify\" to playpause'")
  }
}
