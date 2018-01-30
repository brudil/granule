import React from 'react';
import { print } from 'graphql/language/printer';

export interface GranuleState {
  loading: boolean;
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

export interface GranuleChildProps<D> {
  refetch(): void;
  fetchMore(variables: Object, storeUpdater: StoreUpdater): void;
  data: D;
  loading: boolean;
}

const defaultStoreUpdater: StoreUpdater = (nextData: any) => nextData;

export function createStore(): IStore {
  let store = {};

  return {
    getState: () => store,
    setState: (updater: (state: any) => any) => store = updater(store),
  }
}

export class Granule extends React.Component<GranuleProps, GranuleState> {
  constructor(props: GranuleProps) {
    super(props);
    this.state = {
      loading: !this.selectQueryFromState(),
    }
  }

  private performFetch(variables: Object) {
    return fetch(
      this.props.endpoint,
      {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          query: print(this.props.query),
          variables,
        })
      }
    ).then(res => res.json());
  }

  private fetchMore() {
    if (!this.props.fetchMore) return;

    const nextVariables = this.props.fetchMore(this.props.variables, this.getChildProps());

    this.performFetch(nextVariables)
      .then((result: any) => {
        this.props.store.setState((state: GranuleState) => ({
          ...state,
          [this.getStoreKey()]: (this.props.storeUpdater || defaultStoreUpdater)(result.data, this.selectQueryFromState())
        }));
        this.forceUpdate();
      });
  }

  componentDidMount() {
    if (this.selectQueryFromState() !== null) return;

    this.performFetch(this.props.variables || {})
      .then((result: any) => {
        this.props.store.setState((store: any) => ({ ...store, [this.getStoreKey()]: result.data}));
        this.setState({ loading: false })
      });
  }

  private getStoreKey() {
    return JSON.stringify([this.props.query.definitions[0].name.value, this.props.variables]);
  }

  private selectQueryFromState() {
    return this.props.store.getState()[this.getStoreKey()] || null;
  }

  private getChildProps() {
    return {
      refetch: this.performFetch.bind(this),
      data: this.selectQueryFromState(),
      loading: this.state.loading,
      fetchMore: this.fetchMore.bind(this)
    };
  }

  render() {
    return this.props.children(this.getChildProps());
  }
}