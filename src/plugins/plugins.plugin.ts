import { InternalPlugin, InternalPluginLifecycle, InternalPluginOption } from "../core";
import icon from '../../preview/icon.png';

export class PluginsPlugin extends InternalPlugin implements InternalPluginLifecycle {
  onInit(): InternalPluginOption[] {
    return [{
      title: 'internal plugins list',
      icon,
      action: () => console.log('YEAH!')
    }];
  }
}
