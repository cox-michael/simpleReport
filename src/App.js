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

  if (loading) return <Spinner centerScreen />;

  if (loginState.isLoggedIn) {
    return (
      <Suspense fallback={<Spinner centerScreen />}>
        <RouterSessionLayout
          loginState={loginState}
          setLoginState={setLoginState}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<Spinner centerScreen />}>
      <SignIn setLoginState={setLoginState} />
    </Suspense>
  );
};

export default App;
