import { hot } from 'react-hot-loader/root';
import React, {
  Suspense, lazy, useState, useEffect,
} from 'react';
import Spinner from './Spinner';

const RouterSessionLayout = lazy(() => import('./RouterSessionLayout'));
const SignIn = lazy(() => import('./SignIn'));

const App = () => {
  const [loading, setLoading] = useState(true);
  const [loginState, setLS] = useState({
    isLoggedIn: false,
    displayName: '',
    userid: '',
    permissions: {},
  });

  const setLoginState = ({
    isLoggedIn, displayName, userid, permissions,
  }) => setLS({
    isLoggedIn, displayName, userid, permissions,
  });

  useEffect(() => {
    fetch(`${process.env.API_URL}loggedIn`, { credentials: 'same-origin' })
      .then(response => response.json())
      .then(data => {
        setLoginState(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner centerScreen message="Verifying login status..." />;

  if (loginState.isLoggedIn) {
    return (
      <Suspense fallback={<Spinner centerScreen message="Loading app layout..." />}>
        <RouterSessionLayout
          loginState={loginState}
          setLoginState={setLoginState}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<Spinner centerScreen message="Getting Sign-In form..." />}>
      <SignIn setLoginState={setLoginState} />
    </Suspense>
  );
};

const ExportedApp = process.env.NODE_ENV === 'development' ? hot(App) : App;

export default ExportedApp;
