import React, { useState, useEffect, useCallback } from "react";
import { Alert, Button, Col, Container, Row } from "reactstrap";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { OreId } from 'oreid-js';
import { getConfig } from "../config";
import Loading from "../components/Loading";
import Highlight from "../components/Highlight";

export const OreIdApiComponent = () => {

  const { apiOrigin = "http://localhost:3001", audience } = getConfig();

  const userAuthCallbackUrl = `${window.location.origin}/oreid/authcallback`

  const oreId = new OreId({
    appName: 'ORE ID - Auth0 Sample App',
    appId: process.env.REACT_APP_OREID_APP_ID,
    oreIdUrl: process.env.REACT_APP_OREID_URL,
    authCallbackUrl: userAuthCallbackUrl
  });


  const [state, setState] = useState({
    showResult: false,
    apiMessage: "",
    error: null,
  });
  const [user, setUser] = useState({
    account: '',
    info: null,
  })
  const {
    getAccessTokenSilently,
    loginWithPopup,
    getAccessTokenWithPopup,
    getIdTokenClaims,
  } = useAuth0();

  const handleConsent = async () => {
    try {
      await getAccessTokenWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await callApi();
  };

  const handleLoginAgain = async () => {
    try {
      await loginWithPopup();
      setState({
        ...state,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }

    await callApi();
  };

  const callApi = async () => {
    try {
      const token = await getAccessTokenSilently();

      let response = await fetch(`${apiOrigin}/api/external`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const responseData = await response.json();

      response = await fetch(`${process.env.REACT_APP_OREID_URL}/status`)
      const apiStatus = await response.json()
  
      setState({
        ...state,
        showResult: true,
        apiMessage: {
          ...apiStatus,
          ...responseData,
        }
      });
    } catch (error) {
      setState({
        ...state,
        error: error.error,
      });
    }
  };

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  const loadUserFromStorage = () => {
    const user = JSON.parse(window.localStorage.getItem('user')) || {};
    setState({
      ...state,
      user: {
        account: user?.account,
        info: user?.info,
      }
    })
  }
  /** Retrieve user info from ORE ID service - user info is automatically saved to local storage */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadUserFromApi = useCallback((account) => {
    return new Promise((resolve, reject) => {
      oreId.getUserInfoFromApi(account).then(userInfo => {
        if(userInfo && userInfo.accountName) {
          resolve(userInfo);
        } else {
          reject()
        }
      })
    })
  })

  const fetchOreIdUser = async () => {
    let userInfo = (await oreId.getUser()) || {};
    delete userInfo.permissions
    return userInfo
  }

  const { apiMessage, showResult } = state

  /* Handle the authCallback coming back from ORE ID with an "account" parameter indicating that a user has logged in */
  useEffect(() => {
    loadUserFromStorage();
    const urlPath = `${window.location.origin}${window.location.pathname}`;
    if (!user.info?.account && urlPath === userAuthCallbackUrl) {
      const { account, errors } = oreId.handleAuthResponse(window.location.href);
      if (account && !errors) {
        loadUserFromApi(account).then(info => {
          setState({
            ...state,
            user: {
              account,
              info,
            }
          })
          window.location.replace(`${window.location.origin}/oreid`)
        }).catch(error => {
          console.error(error)
          window.localStorage.removeItem('user')
        })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const localUser = JSON.parse(window.localStorage.getItem('user'))
    if( user.account ){
      window.localStorage.setItem('user', JSON.stringify({
        account : user.account,
        info : user.info,
      }))  
    } else if (localUser?.account && localUser !== user) {
      setUser({
        account: localUser?.account,
        info: localUser?.info,
      })  
    }
  }, [user])

  const handleOreIdLogin = async () => {
    const idToken = await getIdTokenClaims()
    console.log('My Auth0 idToken', idToken)
    let { accessToken } = await oreId.login({ idToken: idToken?.__raw })
    console.log('ORE ID accessToken', accessToken)
    const oreIdUser = await fetchOreIdUser()
    setUser({
      account: oreIdUser?.accountName,
      info: oreIdUser,
    })
  }

  return (
    <>
      <div className="d-flex flex-column">
        {state.error === "consent_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleConsent)}
            >
              consent to get access to users api
            </a>
          </Alert>
        )}

        {state.error === "login_required" && (
          <Alert color="warning">
            You need to{" "}
            <a
              href="#/"
              class="alert-link"
              onClick={(e) => handle(e, handleLoginAgain)}
            >
              log in again
            </a>
          </Alert>
        )}

        <div className="d-flex justify-content-between">
          <h1>ORE ID</h1>
          {!user.info && (
            <div>
              {/* <LoginButton provider='auth0' onClick={handleLogin}/> */}
              <button className="oreid-login" onClick={handleOreIdLogin}>
                <img className="oreid-logo" src={`${window.location.origin}/oreid.svg`} alt="ORE ID - Logo" />
                <span>Login to OreId</span>
              </button>
            </div>
          )}
        </div>
        {!audience && (
          <Alert color="warning">
            <p>
              You can't call the API at the moment because your application does
              not have any configuration for <code>audience</code>, or it is
              using the default value of <code>YOUR_API_IDENTIFIER</code>. You
              might get this default value if you used the "Download Sample"
              feature of{" "}
              <a href="https://auth0.com/docs/quickstart/spa/react">
                the quickstart guide
              </a>
              , but have not set an API up in your Auth0 Tenant. You can find
              out more information on{" "}
              <a href="https://auth0.com/docs/api">setting up APIs</a> in the
              Auth0 Docs.
            </p>
            <p>
              The audience is the identifier of the API that you want to call
              (see{" "}
              <a href="https://auth0.com/docs/get-started/dashboard/tenant-settings#api-authorization-settings">
                API Authorization Settings
              </a>{" "}
              for more info).
            </p>

            <p>
              In this sample, you can configure the audience in a couple of
              ways:
            </p>
            <ul>
              <li>
                in the <code>src/index.js</code> file
              </li>
              <li>
                by specifying it in the <code>auth_config.json</code> file (see
                the <code>auth_config.json.example</code> file for an example of
                where it should go)
              </li>
            </ul>
            <p>
              Once you have configured the value for <code>audience</code>,
              please restart the app and try to use the "Ping API" button below.
            </p>
          </Alert>
        )}
        <div className="align-self-end">
          <Button
            color="primary"
            onClick={callApi}
            disabled={!audience}
          >
            Ping API
          </Button>
        </div>
      </div>
      {apiMessage && <div className="result-block-container">
        {showResult && (
          <div className="result-block" data-testid="api-result">
            <h6 className="muted">Result</h6>
            <Highlight>
              <span>{JSON.stringify(apiMessage, null, 2)}</span>
            </Highlight>
          </div>
        )}
        </div>
      }
      {user.info && (
        <Container>
          <Row className="align-items-center profile-header mb-5 text-center text-md-left">
            <Col md={2}>
              <img
                src={user.info.picture}
                alt="Profile"
                className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
              />
            </Col>
            <Col md>
              <h2>{user.info.name}</h2>
              <p className="lead text-muted">{user.info.email}</p>
            </Col>
          </Row>
          <Row>
            <Highlight>{JSON.stringify(user.info, null, 2)}</Highlight>
          </Row>
        </Container>
      )}
    </>
  );
};

export default withAuthenticationRequired(OreIdApiComponent, {
  onRedirecting: () => <Loading />,
});
