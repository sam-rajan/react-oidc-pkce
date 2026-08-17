/**
 * @jest-environment jsdom
 */

import { render, act } from '@testing-library/react';
import { OidcConfig } from '../provider/auth/config';
import OIDCContextProvider from '../provider/provider';
import * as reducer from '../provider/reducer';

const buildConfig = (overrides: Partial<OidcConfig> = {}): OidcConfig => ({
  redirectUrl: 'http://example.com/callback',
  autoTokenRefresh: true,
  clientId: "abc",
  scope: "email",
  oidcUrl: "https://oidc.com/",
  ...overrides,
});

const setLocationHref = (href: string) => {
  Object.defineProperty(window, 'location', { value: { href }, writable: true });
};

jest.mock('../provider/reducer')
jest.mock('../provider/effects')
describe('OIDCContextProvider', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should trigger the token exchange flow when the redirect URL contains a code and state', () => {
    setLocationHref('http://example.com/callback?code=myCode&state=myState')

    act(() => {
      render(
        <OIDCContextProvider oidcConfig={buildConfig()}></OIDCContextProvider>
      )
    })

    expect(reducer.flowController).toHaveBeenCalledTimes(1)
    expect(reducer.flowController).toHaveBeenCalledWith(expect.anything(), { type: 'TOKEN' })
  })

  it('should not trigger the token exchange flow or set up the refresher when autoTokenRefresh is false', () => {
    setLocationHref('http://example.com/callback')

    act(() => {
      render(
        <OIDCContextProvider oidcConfig={buildConfig({ autoTokenRefresh: false })}></OIDCContextProvider>
      )
    })

    expect(reducer.flowController).toHaveBeenCalledTimes(0)
  })

  it('should not trigger the token exchange flow, but should set up the refresher when autoTokenRefresh is true', () => {
    setLocationHref('http://example.com/callback')

    act(() => {
      render(
        <OIDCContextProvider oidcConfig={buildConfig({ autoTokenRefresh: true })}></OIDCContextProvider>
      )
    })

    expect(reducer.flowController).toHaveBeenCalledTimes(1)
    expect(reducer.flowController).toHaveBeenCalledWith(expect.anything(), { type: 'REFRESHER' })
  })

})
