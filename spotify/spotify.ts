import { SpotterPlugin, SpotterActionId } from '../base/base.plugin';

export default class Spotify implements SpotterPlugin {
  actions = [
    {
      title: 'First',
      subtitle: 'First subtitle',
      image: '',
    },
    {
      title: 'Second',
      subtitle: 'Second subtitle',
      image: '',
    },
  ];

  onSelectAction(actionId: SpotterActionId) {
    console.log('Action: ', actionId);
  }
}
