import Keycloak from 'keycloak-js'



interface Store {
  initOAuth: (keycloak: Keycloak) => void
}

const options = {
  url: import.meta.env.VITE_KEYCLOAK_URL,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  realm: import.meta.env.VITE_KEYCLOAK_REALM
}

const keycloak = new Keycloak(options)

let authenticated: boolean
let store: Store | null = null

async function init(onInitCallback: () => void): Promise<void> {
  try {
    let initOptions = {
      onLoad: 'check-sso',
      // scope: 'openid profile roles dac:read dac:write policy:read policy:write submission:read membership:read membership:write dataset:read dac-portal-audience',
      checkLoginIframe: false
      // silentCheckSsoRedirectUri: window.location.origin + "/assets/silent-check-sso.html"
    }
    if (options.url == 'http://0.0.0.0:8080') {
      initOptions = {
            onLoad: 'check-sso',
            checkLoginIframe: false
            // silentCheckSsoRedirectUri: window.location.origin + "/assets/silent-check-sso.html"
      }
    }
    authenticated = await keycloak.init(initOptions)
    onInitCallback()
  } catch (error) {
    if (error.error === 'login_required'){
      keycloak.login()
    }
    console.error('Failed to initialize Keycloak')
    console.error(error)
  }
}

async function initStore(storeInstance: Store): Promise<void> {
  try {
    store = storeInstance
    store.initOAuth(keycloak)
    if (!authenticated) {
      // alert('not authenticated')
    }
  } catch (error) {
    console.error('Failed to initialize store')
    console.error(error)
  }
}

async function refreshToken() {
  try {
		console.log("updateToken")
    await keycloak.updateToken(30)
    return keycloak
  } catch (error) {
    console.error('Failed to refresh token')
    console.error(error)
  }
}

function login(): void {
  let loginOptions = {
    idpHint: 'switch-fega',
    // scope: 'openid profile roles dac:read dac:write policy:read policy:write submission:read membership:read membership:write dataset:read dac-portal-audience'
  }
  if (options.url === 'http://0.0.0.0:8080'){
    loginOptions = {
      idpHint: 'switch-fega'
    }
  }
  keycloak.login(loginOptions)
}

function logout(url: string): void {
  keycloak.logout({ redirectUri: url })
}

const service = {
  init,
  initStore,
  refreshToken,
  logout,
  login,
}

export default service
