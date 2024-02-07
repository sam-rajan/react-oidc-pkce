/**
 * @jest-environment jsdom
 */

import { render, act } from '@testing-library/react';
import { OidcConfig } from '../provider/auth/config';
import OIDCContextProvider from '../provider/provider';
import * as reducer from '../provider/reducer';



const mockOidcConfig: OidcConfig = {
  redirectUrl: 'http://example.com/callback',
  autoTokenRefresh: true,
  clientId: "abc",
  scope: "email",
  oidcUrl: "https://oidc.com/"
};

Object.defineProperty(window, 'location', {
  value: {
    href: 'http://example.com/callback?code=myCode&state=myState'
  },
  writable: true
});


jest.mock('../provider/reducer')
describe('OIDCContextProvider', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should trigger the token exchange flow', () => {

    act(() => {
      render(
        <OIDCContextProvider oidcConfig={mockOidcConfig}></OIDCContextProvider>
      )
    })

    expect(reducer.flowController).toHaveBeenCalledTimes(1)

  })

  it('should not trigger the token exchange flow or setup token refresher', () => {
    window.location.href = "http://example.com/callback"
    mockOidcConfig.autoTokenRefresh = false
    act(() => {
      render(
        <OIDCContextProvider oidcConfig={mockOidcConfig}></OIDCContextProvider>
      )
    })

    expect(reducer.flowController).toHaveBeenCalledTimes(0)

  })

  it('should not trigger the token exchange flow, but invoke setup token refresher', () => {
    window.location.href = "http://example.com/callback"
    act(() => {
      render(
        <OIDCContextProvider oidcConfig={mockOidcConfig}></OIDCContextProvider>
      )
    })

    expect(reducer.flowController).toHaveBeenCalledTimes(0)

  })

})
