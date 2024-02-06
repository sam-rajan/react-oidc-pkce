/**
 * @jest-environment jsdom
 */

import { render, act } from '@testing-library/react';
import { OidcConfig } from '../provider/auth/config';
import OIDCContextProvider from '../provider/provider';
import { mockFlowController } from './mockReducer';


const mockOidcConfig: OidcConfig = {
  redirectUrl: 'http://example.com/callback',
  autoTokenRefresh: true,
  clientId: "abc",
  scope: "email",
  oidcUrl: "https://oidc.com/"
  // add other necessary config properties
};

// const MockFlowController = jest.fn()
jest.mock('../provider/reducer', () => ( {flowController:  jest.fn(()=> mockFlowController)}))

describe('OIDCContextProvider', () => {

  it('should trigger the token exchange flow', () => {
    Object.defineProperty(window, "location", {
      value: {
        href: 'http://example.com/callback?code=mockCode&state=mockState'
      },
    })
    let component: any;
    act(() => {
      component = render(
        <OIDCContextProvider oidcConfig={mockOidcConfig}></OIDCContextProvider>
      )
    })



  })
  
})
