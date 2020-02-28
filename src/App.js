import { hot } from 'react-hot-loader/root';
import React, {
  Suspense, lazy, useState, useEffect,
} from 'react';
import { Spinner } from './components';

const RouterSessionLayout = lazy(() => import('./RouterSessionLayout'));
const SignIn = lazy(() => import('./SignIn'));

const App = () => {
  const [loading, setLoading] = useState(true);
  const [loginState, setLoginState] = useState({
    isLoggedIn: false,
    displayName: '',
    userid: '',
    permissions: {},
    preferences: {},
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
        <RouterSessionLayout {...{ loginState, setLoginState }} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<Spinner centerScreen message="Getting Sign-In form..." />}>
      <SignIn {...{ setLoginState }} />
    </Suspense>
  );
};

const ExportedApp = process.env.NODE_ENV === 'development' ? hot(App) : App;

export default ExportedApp;
