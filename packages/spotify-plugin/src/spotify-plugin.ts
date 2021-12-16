import { SpotterOption } from '@spotter-app/core';
import { Plugin } from '@spotter-app/plugin';
import SpotifyWebApi from 'spotify-web-api-node';
import { SPOTIFY_SCOPES } from './constants';
import { execPromise } from './helpers';
import packageJSON from '../package.json';

new class CalculatorPlugin extends Plugin {
  private appPath = '/Applications/Spotify.app';
  private spotifyApi: SpotifyWebApi;

  constructor() {
    super({
      name: packageJSON.name,
      icon: '/Applications/Spotify.app',
      version: packageJSON.version,
    });
  }

  async onInit() {
    const storage = await this.spotter.getStorage();
    this.spotifyApi = new SpotifyWebApi(storage.tokens);

    this.spotter.setRegisteredOptions([
      {
        title: 'Spotify',
        prefix: 'spt',
        icon: this.appPath,
        onQuery: this.mainMenu,
        replaceOptions: ['Spotify'],
      },
      {
        title: 'Play',
        icon: this.appPath,
        onSubmit: this.play,
      },
      {
        title: 'Pause',
        icon: this.appPath,
        onSubmit: this.pause,
      },
      {
        title: 'Next',
        icon: this.appPath,
        onSubmit: this.next,
      },
      {
        title: 'Previous',
        icon: this.appPath,
        onSubmit: this.previous,
      },
    ]);
  }

  resetTokens() {
    this.spotter.patchStorage({
      token: null,
      access_token: null,
      refresh_token: null,
    });
  }

  async mainMenu(query: string) {
    const storage = await this.spotter.getStorage<{
      token: string,
      access_token: string,
      refresh_token: string,
    }>();

    if (storage.token) {
      const auth = await this.auth(storage.token);
      if (auth) {
        this.spotifyApi.setAccessToken(auth.access_token);
        this.spotifyApi.setRefreshToken(auth.refresh_token);
        this.spotter.patchStorage({
          token: null,
          access_token: auth.access_token,
          refresh_token: auth.refresh_token,
        });
      } else {
        this.resetTokens();
        return this.getAuthLinkOptions();
      }
    }

    if (storage.access_token && storage.refresh_token) {
      this.spotifyApi.setAccessToken(storage.access_token);
      this.spotifyApi.setRefreshToken(storage.refresh_token);
    }

    const me = await this.spotifyApi.getMe().catch(() => false);

    if (!me) {
      this.resetTokens();
      return this.getAuthLinkOptions();
    }

    const playlistOptions = await this.getPlaylistOptions();

    if (!playlistOptions) {
      this.spotter.setError('spotify-plugin: something went wrong.');
      return [];
    }

    return query.length
      ? playlistOptions.filter(p =>
          p.title.split(' ').find(t => t.toLowerCase().startsWith(query.toLowerCase())),
        )
      : playlistOptions;
  }

  private getAuthLinkOptions() {
    const authorizeURL = this.spotifyApi.createAuthorizeURL(SPOTIFY_SCOPES, packageJSON.name);
    return [
      {
        title: 'Authorize',
        icon: this.appPath,
        onSubmit: () => {
          execPromise(`open "${authorizeURL}"`);
          return true;
        },
      },
    ];
  }

  private async auth(
    token: string
  ): Promise<{ access_token: string, refresh_token: string } | null> {
    let result = null;
    try {
      const auth = await this.spotifyApi.authorizationCodeGrant(token);
      const access_token = auth.body['access_token'];
      const refresh_token = auth.body['refresh_token'];
      result = {
        access_token,
        refresh_token,
      };
    } catch ({ body }) {
      this.spotter.setError(body.error_description ?? 'Auth error');
    }

    return result;
  }

  private getPlaylistOptions = async () => {
    let playlistOptions: SpotterOption[] | null = null;
    try {
      const playlists = await this.spotifyApi.getUserPlaylists();
      playlistOptions = playlists.body.items.map(playlist => {
        return {
          title: playlist.name,
          icon: playlist.images[0]?.url ?? this.appPath,
          onSubmit: () => this.play(playlist.uri),
        }
      });
    } catch {
      return;
    }

    return playlistOptions;
  }

  async play(uri?: string, device?: string) {
    if (!uri) {
      execPromise("osascript -e 'tell application \"Spotify\" to play'");
      return true;
    }
  
    if (!device) {
      const playbackState = await this.spotifyApi.getMyCurrentPlaybackState();
      if (playbackState?.body?.device?.id) {
        this.spotifyApi.play({
          context_uri: uri,
          device_id: playbackState?.body?.device?.id,
        });
        return true;
      }
  
      const devices = await this.spotifyApi.getMyDevices().then(
        data => data.body.devices,
        () => [],
      );
  
      return devices.map(device => ({
        title: device.name,
        onSubmit: () => this.play(uri, device.id),
      }));
    }

    this.spotifyApi.play({
      context_uri: uri,
      device_id: device,
    });
    return true;
  };

  pause() {
    execPromise("osascript -e 'tell application \"Spotify\" to pause'");
    return true;
  };
  
  next() {
    execPromise("osascript -e 'tell application \"Spotify\" to next track'");
    return true;
  };
  
  previous() {
    execPromise("osascript -e 'tell application \"Spotify\" to previous track'");
    return true;
  };
}
