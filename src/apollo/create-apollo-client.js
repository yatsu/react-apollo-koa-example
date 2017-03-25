// @flow
import ApolloClient, { addTypename } from 'apollo-client'

export default (options: Object) =>
  new ApolloClient(
    Object.assign(
      {},
      {
        queryTransformer: addTypename,
        dataIdFromObject: (result) => {
          if (result.id && result.__typename) {
            return result.__typename + result.id
          }
          return null
        }
        // shouldBatch: true,
      },
      options
    )
  )
