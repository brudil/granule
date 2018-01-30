export interface GranuleChildProps<D> {
  refetch(): void;
  fetchMore(variables: Object, storeUpdater: StoreUpdater): void;
  data: D;
  loading: boolean;
}

export interface GranuleState {
  loading: boolean;
}

export interface GranuleRender<D> {
  (props: GranuleChildProps<D>): any;
}

export interface IStore {
  getState(): any;
  setState(nextState: any): any;
}

export interface GranuleProps {
  children(props: GranuleChildProps<any>): any;
  endpoint: string;
  query: any;
  variables?: Object;
  fetchMore?(variables: any, props: GranuleChildProps<any>): Object;
  storeUpdater?(nextData: any, currentData: any): any;
  store: IStore;
}

export interface StoreUpdater {
  (nextData: any, store: any): any;
}
