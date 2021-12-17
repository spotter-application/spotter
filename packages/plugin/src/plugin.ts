import { WebSocketServer } from 'ws';
import { exec } from 'child_process';
import {
  SpotterPlugin,
  ChannelEventType,
  ChannelForPlugin,
  randomPort,
  CommandType,
  PluginConnection,
  PluginInfo,
} from '@spotter-app/core';

const PASSED_PORT: number = process.argv[2] ? Number(process.argv[2]) : null;
const PASSED_PLUGIN_PATH: string = process.argv[3] ?? null;
const port = PASSED_PORT ?? randomPort();
const wss = new WebSocketServer({ port }).setMaxListeners(1);

const channel: Promise<ChannelForPlugin> = new Promise(resolve => {
  wss.on('connection', ws => {
    resolve({
      sendToSpotter: (data: string) => ws.send(data),
      onSpotter: (
        eventType: ChannelEventType,
        callback: (data: string) => void
      ) => {
        if (eventType === 'open') {
          ws.onopen = () => {
            callback('')
          };
          return;
        }
    
        if (eventType === 'close') {
          ws.onclose = () => {
            callback('');
          };
          return;
        }
    
        if (eventType === 'message') {
          ws.onmessage = ({ data }) => {
            callback(data as string);
          };
          return;
        }
    
        if (eventType === 'error') {
          ws.onerror = ({ message }) => {
            callback(message)
          };
          return;
        }
      },
    });
  });
});

type PluginInfoInput = PluginInfo | string;

export class Plugin extends SpotterPlugin {
  constructor(plugin: PluginInfoInput) {

    super(channel);

    const pluginInfo: PluginInfo = typeof plugin === 'string'
      ? { name: plugin }
      : plugin;
    
    const connectData: PluginConnection = {
      port,
      path: PASSED_PLUGIN_PATH ?? pluginInfo.name,
      pid: process.pid,
      ...pluginInfo,
    }

    const command = {
      type: CommandType.connectPlugin,
      pluginName: pluginInfo.name,
      ...connectData,
    }

    if (command.icon) {
      command.icon = command.icon.replace(/\p{Emoji}/ug, (m) =>
        m.codePointAt(0).toString(16)
      );
    }

    const params = Object.entries(command).reduce(
      (acc, [key, value], i) => `${acc}${i ? '&' : ''}${key}=${value}`,
      '',
    );

    exec(
      `open 'spotter://x-callback-url/command?${params}'`,
      (error) => {
        if (error) {
          console.error(error.message);
          return;
        }
    });
  }
}
