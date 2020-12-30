import SpotterSearch from '../core/search';
import { SpotterOption, SpotterPlugin, SpotterQuery } from '../core/shared';

export default class Spotify extends SpotterPlugin implements SpotterQuery {

  private searcher = new SpotterSearch(this.options);

  query(query: string): SpotterOption[] {
    return this.searcher.search(query);
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
    this.api.shellCommand("osascript -e 'tell application \"Spotify\" \n set player position to 0\n previous track\n end tell'")
  }

  private next() {
    this.api.shellCommand("osascript -e 'tell application \"Spotify\" to next track'")
  }

  private pause() {
    this.api.shellCommand("osascript -e 'tell application \"Spotify\" to pause'")
  }

  private play() {
    this.api.shellCommand("osascript -e 'tell application \"Spotify\" to play'")
  }

  private mute() {
    this.api.shellCommand("osascript -e 'tell application \"Spotify\" to set sound volume to 0'")
  }

  private unmute() {
    this.api.shellCommand("osascript -e 'tell application \"Spotify\" to set sound volume to 100'")
  }

  private togglePlayPause() {
    this.api.shellCommand("osascript -e 'tell application \"Spotify\" to playpause'")
  }
}
