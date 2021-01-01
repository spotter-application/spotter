import SpotterSearch from '../core/search';
import { SpotterOption, SpotterPlugin, SpotterPluginLifecycle } from '../core/shared';

export default class Spotify extends SpotterPlugin implements SpotterPluginLifecycle {

  private searcher = new SpotterSearch(this.options);

  onQuery(query: string) {
    this.setOptions(this.searcher.search(query))
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

  private previous() {
    this.nativeModules.api.shellCommand("osascript -e 'tell application \"Spotify\" \n set player position to 0\n previous track\n end tell'")
  }

  private next() {
    this.nativeModules.api.shellCommand("osascript -e 'tell application \"Spotify\" to next track'")
  }

  private pause() {
    this.nativeModules.api.shellCommand("osascript -e 'tell application \"Spotify\" to pause'")
  }

  private play() {
    this.nativeModules.api.shellCommand("osascript -e 'tell application \"Spotify\" to play'")
  }

  private mute() {
    this.nativeModules.api.shellCommand("osascript -e 'tell application \"Spotify\" to set sound volume to 0'")
  }

  private unmute() {
    this.nativeModules.api.shellCommand("osascript -e 'tell application \"Spotify\" to set sound volume to 100'")
  }

  private togglePlayPause() {
    this.nativeModules.api.shellCommand("osascript -e 'tell application \"Spotify\" to playpause'")
  }
}
