// @flow
import ApolloClient, { addTypename } from 'apollo-client'

export default (options: Object) =>
  new ApolloClient(
    Object.assign(
      {},
      {
        queryTransformer: addTypename,
        dataIdFromObject: (result) => {
          // eslint-disable-next-line no-underscore-dangle
          if (result.id && result.__typename) {
            // eslint-disable-next-line no-underscore-dangle
            return result.__typename + result.id
          }
          return null
        }
        // shouldBatch: true,
      },
      options
    )
  )
