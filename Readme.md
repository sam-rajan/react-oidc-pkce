# React Context Provider implementation for OIDC Authorization code Flow with PKCE

This library provides a simple way to implement the OIDC Authorization Code flow with PKCE (Proof Key for Code Exchange) in your React applications using context provider.

## Installation

```
npm install react-oidc-pkce
```

## Usage

### 1. Initialize the OIDC Context Provider

First, initialize the OIDC context provider in your root component to provide authentication state and actions to child components:

```javascript
import React from 'react';
import { OIDCContextProvider } from "react-oidc-pkce";

const App = () => {
  const oidcConfig = {
    // Your OIDC configuration options (clientId, redirectUrl, oidcUrl, etc.)
  };

  return (
    <OIDCContextProvider oidcConfig={oidcConfig}>
      <YourAppContent />
    </OIDCContextProvider>
  );
};

export default App;
```

### 2. Use the Auth Context in Components

You can use the provided authentication context in your components to access authentication state and perform authorization flow:

```javascript
import React, { useContext, useState } from 'react';
import { useAuthContext } from 'react-oidc-pkce';

const YourComponent = () => {
  const [isAuthenticated, setAuthenticated] = useState(false)
  const auth = useAuthContext()

  useEffect(() => {
    auth.registerCallback((result) => {
      if (result === 'SUCCESS') {
        setAuthenticated(true)
      } else {
        setAuthenticated(false)
      }
    })
  }, [])

  const handleLogin = () => {
    auth.authorize({ force: false }); // Optionally pass `force: true` to force re-authorization
  };

  
  return (
    <div>
      {isAuthenticated ? (
        <button >Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
};

export default YourComponent;
```

## API Reference

### OIDCContextProvider

The `OIDCContextProvider` component is used to initialize the OIDC context provider in your application.

#### oidcConfig 

Props object containing OIDC configuration options.


```javascript
const mockOidcConfig: OidcConfig = {
  redirectUrl: 'http://example.com/callback', // OIDC callback url
  autoTokenRefresh: true, // if true, the acces token will be automatically rotated in background
  clientId: "abc", // client id 
  scope: "email", // scope for your access
  oidcUrl: "https://oidc.com/" // your oidc URL
};
```

### useAuthContext

React hook implementation which provides access to authentication state and actions.

#### authorize(options: any)

Method which intiates the authorzation flow, which accespts an options object with attribute  `force: true | false` to force re-authorization if true.

#### registerCallback(authCallback: (result: string) => void) 

For registering a authorization callback function. If auth operation is success, the specified callback function will be invoked with result `SUCCESS` else if is a failure then in will be invoked with result `FAILED`. On `logout()`, it will be invoked with result `LOGGED_OUT`.

#### logout()

Clears the locally stored tokens and session state. This only ends the session on this device — it does not redirect to or end the session with your OIDC provider.

#### getAccessToken(): string

Returns a valid access token

#### getRefreshToken(): string

Returns a refresh token

#### getIdToken(): string

Returns a ID token

#### isAuthValid(): boolen

Returns whether current authentication is valid or not

## Security considerations

Access, ID, and refresh tokens are stored in `sessionStorage`. This is a deliberate choice so that a logged-in user stays logged in across a page reload within the same tab, but it means any script able to run on the page (e.g. via an XSS vulnerability elsewhere in your app) can read these tokens. Make sure your application has strong protections against XSS if it handles sensitive data.

## Contributing

Contributions are welcome! Please feel free to open issues or pull requests for any improvements, bug fixes, or new features.