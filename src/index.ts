import React from 'react';
import { print } from 'graphql/language/printer';
import { GranelProps, GranelState, StoreUpdater, IStore } from './types';

const defaultStoreUpdater: StoreUpdater = (nextData: any) => nextData;

export function createStore(): IStore {
  let store = {};

  return {
    getState: () => store,
    setState: (updater: (state: any) => any) => store = updater(store),
  }
}

export class Granule extends React.Component<GranelProps, GranelState> {
  constructor(props: GranelProps) {
    super(props);
    this.state = {
      loading: this.selectQueryFromState() === null,
    }
  }

  performFetch(variables: Object) {
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
    ).then(res => {
      return res.json()
    });
  }

  fetchMore() {
    if (!this.props.fetchMore) return;

    const nextVariables = this.props.fetchMore(this.props.variables, this.getChildProps());

    this.performFetch.call(this, nextVariables)
      .then((result: any) => {
        this.props.store.setState((state: GranelState) => ({
          ...state,
          [this.getStoreKey()]: (this.props.storeUpdater || defaultStoreUpdater)(result.data, this.selectQueryFromState())
        }));
        this.forceUpdate();
      });
  }

  componentDidMount() {
    if (this.selectQueryFromState() !== null) return;

    this.performFetch.call(this, this.props.variables)
      .then((result: any) => {
        this.props.store.setState((store: any) => ({ ...store, [this.getStoreKey()]: result.data}));
        this.setState({ loading: false })
      });
  }

  getStoreKey() {
    return `${this.props.query.definitions[0].name.value}||${JSON.stringify(this.props.variables)}`;
  }

  private selectQueryFromState() {
    const state = this.props.store.getState();

    const queryContainer = state[this.getStoreKey()];
    if (!queryContainer) return null;

    return queryContainer;
  }

  getChildProps() {
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