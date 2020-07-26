export type SpotterActionId = string;

export interface SpotterAction {
  id?: string,
  title: string,
  subtitle: string,
  image: string,
}

export declare interface SpotterPlugin {

  actions: SpotterAction[];

  onSelectAction(actionId: SpotterActionId): void;

}
