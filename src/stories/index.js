import React from 'react'
import { storiesOf, action } from '@kadira/storybook'
import Header from '../components/Header'
import Signin from '../components/Signin/Signin'

storiesOf('Header', module)
  .add('without auth', () => <Header path={'/'} signout={action('signout')} />)
  .add('with normal user', () => <Header path={'/'} username={'bob'} signout={action('signout')} />)
  .add('with admin user', () => (
    <Header path={'/'} username={'bob'} admin signout={action('signout')} />
  ))
  .add('Local tab', () => <Header path={'/todo'} username={'bob'} signout={action('signout')} />)
  .add('GraphQL tab', () => (
    <Header path={'/todo-remote'} username={'bob'} signout={action('signout')} />
  ))
  .add('GraphQL Subscription tab', () => (
    <Header path={'/todo-pubsub'} username={'bob'} signout={action('signout')} />
  ))

storiesOf('Signin', module)
  .add('Initial state', () => <Signin authenticating={false} onSubmit={action('signin')} />)
  .add('Signing in', () => <Signin authenticating onSubmit={action('signin')} />)
  .add('Error', () => (
    <Signin authenticating={false} error={'Authentication failed'} onSubmit={action('signin')} />
  ))
