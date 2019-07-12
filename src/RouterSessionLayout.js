import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';
import Layout from './Layout';
import { SessionProvider } from './Session';

const RouterSessionLayout = props => {
  const { loginState, setLoginState } = props;

  return (
    <Router>
      <SessionProvider
        loginState={loginState}
        setLoginState={setLoginState}
      >
        <Layout />
      </SessionProvider>
    </Router>
  );
};

RouterSessionLayout.propTypes = {
  loginState: PropTypes.object.isRequired,
  setLoginState: PropTypes.func.isRequired,
};

export default RouterSessionLayout;
