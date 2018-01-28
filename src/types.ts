export interface GranelData<D> {
  refetch(): void;
  fetchMore(variables: Object, storeUpdater: StoreUpdater): void;
  data: D;
  loading: boolean;
}

export interface GranelState {
  loading: boolean;
}

export type GraphQlAst = any;

export interface GranuleRender<D> {
  (props: GranelData<D>): any;
}

export interface IStore {
  getState(): any;
  setState(nextState: any): any;
}

export interface GranelProps {
  children(data: GranelData<any>): any;
  endpoint: string;
  query: GraphQlAst
  variables?: Object;
  fetchMore?(variables: any, props: GranelData<any>): Object;
  storeUpdater?(nextData: any, currentData: any): any;
  store: IStore;
}

export interface StoreUpdater {
  (nextData: any, store: any): any;
}
