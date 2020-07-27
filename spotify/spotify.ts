import { SpotterPlugin, SpotterAction } from '../base/base.plugin';

export enum SpotifyActionKey {
  Previous = 'previous',
  Next = 'Next',
  Pause = 'pause',
  Play = 'play',
  Mute = 'mute',
  Unmute = 'unmute',
  TogglePlayPause = 'togglePlayPause',
}

export default class Spotify implements SpotterPlugin {
  actions = [
    {
      key: SpotifyActionKey.Previous,
      title: 'Previous',
      subtitle: 'Previous track',
      image: '',
    },
    {
      key: SpotifyActionKey.Next,
      title: 'Next',
      subtitle: 'Next track',
      image: '',
    },
    {
      key: SpotifyActionKey.Pause,
      title: 'Pause',
      subtitle: 'Pause',
      image: '',
    },
    {
      key: SpotifyActionKey.Play,
      title: 'Play',
      subtitle: 'Play',
      image: '',
    },
    {
      key: SpotifyActionKey.Mute,
      title: 'Mute',
      subtitle: 'Mute',
      image: '',
    },
    {
      key: SpotifyActionKey.Unmute,
      title: 'Unmute',
      subtitle: 'Unmute',
      image: '',
    },
    {
      key: SpotifyActionKey.TogglePlayPause,
      title: 'Toggle play/pause',
      subtitle: 'Toggle play/pause',
      image: '',
    },
  ];

  onSelectAction(action: SpotterAction) {
    switch (action.key) {
      case SpotifyActionKey.Previous:
        console.log('Previous!!!');
        break;
      case SpotifyActionKey.Next:
        console.log('Next!!!');
        break;
      case SpotifyActionKey.Pause:
        this.pause();
        break;
      case SpotifyActionKey.Play:
        console.log('Play!!!');
        break;
      case SpotifyActionKey.Mute:
        console.log('Mute!!!');
        break;
      case SpotifyActionKey.Unmute:
        console.log('Unmute!!!');
        break;
      case SpotifyActionKey.TogglePlayPause:
        console.log('TogglePlayPause!!!');
        break;
      default:
        throw new Error('Something went wrong')
    }
  }

  async pause() {
    // await runApplescript('tell application "Spotify" to pause');
  }
}
