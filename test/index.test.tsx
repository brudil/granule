import React from 'react';
import gql from 'graphql-tag';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import { Granule, createStore } from '../src/index';
import { GranuleRender } from '../src/types';

Enzyme.configure({ adapter: new Adapter() });


const store = createStore();

const Query = (props) => (
  <Granule
    endpoint="test.local"
    store={store}
    {...props}
  >
    {props.children}
  </Granule>
);

const BasicQuery = gql`
query EventList($fromTime: String) {
  allEvents(filter: {fromTime: $fromTime}, first: 4) {
    edges {
      node {
        title
        slug
        eventId
        featuredImage {
          resource
        }
        shortDescription
        startTime
        endTime
        locationDisplay
        venue {
          name
        }
      }
    }
  }
}`;

const ChildQuery = gql`
query ChildQuery($fromTime: String) {
  allEvents(filter: {fromTime: $fromTime}, first: 4) {
    edges {
      node {
        title
        slug
        eventId
        featuredImage {
          resource
        }
        shortDescription
        startTime
        endTime
        locationDisplay
        venue {
          name
        }
      }
    }
  }
}`;

function setApiResponse(apiResponse) {
  (global as any).fetch = jest.fn().mockImplementation((...args) => {
    return new Promise((resolve, reject) => {
      resolve({
        json: () => new Promise((resolve2, reject2) => {
          setTimeout(() => resolve2(apiResponse), 50);
        })
      });
    });
  });
}

describe('query component', () => {

  beforeEach(() => {
    store.setState(() => ({}));
  })

  test('defaults to loading', () => {
    setApiResponse({});

    mount((
      <Query
        query={BasicQuery}
      >
        {({ loading, data }) => {
          // expect(loading).toBe(true);
          // expect(data).toBeNull();
          return <h1>Hello</h1>;
        }}
      </Query>
    ))
  });

  test('returns child with data', (done) => {
    setApiResponse({ data: { allItems: ['fizz', 'buzz', 'fizzbuzz'] } });

    const root = mount((
      <Query
        query={BasicQuery}
      >
        {({ loading, data }) => {
          if (loading) {
            return <div>loading</div>
          }
          
          return (
            <ul>
              {data.allItems.map(item => <li key={item}>{item}</li>)}
            </ul>
          );
        }}
      </Query>
    ));

    expect(root.contains(<div>loading</div>)).toBe(true);

      setTimeout(() => {
        expect(root.update().contains((
          <ul>
            <li key="fizz">fizz</li>
            <li key="buzz">buzz</li>
            <li key="fizzbuzz">fizzbuzz</li>
          </ul>
        ))).toBe(true);
        done();
      }, 100);
  });

  test('skips loading of cached query', (done) => {
    setApiResponse({ data: { allItems: ['fizz', 'buzz', 'fizzbuzz'] } });

    const root = mount((
      <Query
        query={BasicQuery}
      >
        {({ loading, data }) => {
          if (loading) {
            return <div>loading</div>
          }
          
          return (
            <ul>
              {data.allItems.map(item => <li key={item}>{item}</li>)}
            </ul>
          );
        }}
      </Query>
    ));

    expect(root.contains(<div>loading</div>)).toBe(true);

    setTimeout(() => {
      const repeatWrapper = mount((
        <Query
          query={BasicQuery}
        >
          {({ loading, data }) => {
            if (loading) {
              return <div>loading</div>
            }

            return (
              <ul>
                {data.allItems.map(item => <li key={item}>{item}</li>)}
              </ul>
            );
          }}
        </Query>
      ));

      expect(repeatWrapper.contains(<div>loading</div>)).toBe(false);
      done();
    }, 200)
    
  });

  test('fetchMore replaces by default', (done) => {
    setApiResponse({ data: { allItems: ['fizz', 'buzz', 'fizzbuzz'] } });

    const root = mount((
      <Query
        query={BasicQuery}
        fetchMore={(variables) => variables}
      >
        {({ loading, data, fetchMore }) => {
          if (loading) {
            return <div>loading</div>
          }
          
          return (
            <div>
            <ul>
              {data.allItems.map(item => <li key={item}>{item}</li>)}
            </ul>
              <button id="load-more-button" onClick={fetchMore}>load more</button>
            </div>
          );
        }}
      </Query>
    ));

    setTimeout(() => {
      setApiResponse({ data: { allItems: ['kale', 'spinach', 'chicken'] } });
      root.update().find('#load-more-button').simulate('click');

      setTimeout(() => {
        expect(root.update().contains((
          <ul>
            <li key="kale">kale</li>
            <li key="spinach">spinach</li>
            <li key="chicken">chicken</li>
          </ul>
        ))).toBe(true);
        done();
      }, 100);
    }, 100);
  });
})
