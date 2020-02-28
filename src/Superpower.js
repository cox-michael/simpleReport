import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
// import { Fingerprint } from '@material-ui/icons';
// import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
// import Input from '@material-ui/core/Input';
// import InputLabel from '@material-ui/core/InputLabel';
// import FormControl from '@material-ui/core/FormControl';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
// import CheckIcon from '@material-ui/icons/Check';
// import CircularProgress from '@material-ui/core/CircularProgress';
import AutocompleteSelect from './AutocompleteSelect';
import { Spinner } from './components';
import { SessionContext } from './Session';
import { useFetch } from './hooks';

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(1) * 6,
  },
  button: {
    marginTop: theme.spacing(1) * 3,
  },
  progress: {
    // color: green[500],
    position: 'relative',
    top: 24,
    left: -39,
    zIndex: 10000,
  },
}));

const Superpower = props => {
  const classes = useStyles();
  const { history } = props;
  const [username, setUsername] = useState('');
  const [fetching, setFetching] = useState(false);
  // const [fetchSuccess, setFetchSuccess] = useState(false);
  const { setLoginState, openSnack } = useContext(SessionContext);
  const [suggestions, setSuggestions] = useState([]);
  const [fetchUsers, loading] = useFetch('findUsers', setSuggestions);

  // const handleSubmit = e => {
  //   e.preventDefault();
  //   setFetching(true);
  //   setFetchSuccess(false);
  //
  //   fetch(`${process.env.API_URL}api/superpower`, {
  //     method: 'POST',
  //     credentials: 'same-origin',
  //     headers: {
  //       Accept: 'application/json',
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       username,
  //     }),
  //   })
  //     .then(response => response.json())
  //     .then(data => {
  //       if (data.success) setLoginState(data);
  //       setFetchSuccess(data.success);
  //       setFetching(false);
  //       openSnack(data.success ? 'User changed' : 'Your powers have failed you');
  //       setTimeout(() => setFetchSuccess(false), 6000);
  //     });
  // };

  const handleSubmit2 = ({ value }) => {
    const { sAMAccountName } = value;
    setUsername(sAMAccountName);
    setFetching(true);
    // setFetchSuccess(false);

    fetch(`${process.env.API_URL}api/superpower`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: sAMAccountName }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) setLoginState(data);
        // setFetchSuccess(data.success);
        openSnack(data.success ? 'User changed' : 'Your powers have failed you');
        if (data.success) history.push('/');

        // if pushing history, setFetching will not fire in time
        if (!data.success) setFetching(false);
        // setTimeout(() => setFetchSuccess(false), 6000);
      });
  };

  const handleAutocomplete = query => {
    setUsername(query);
    if (query.length < 2) return;
    fetchUsers({ query });
  };

  if (fetching) return <Spinner centerScreen />;

  return (
    <Paper className={classes.paper}>
      <Typography variant="h4" gutterBottom>
        Superpower
      </Typography>
      <Typography>
        This gives you the ability to view the site from the perspective
        <br />
        of someone else. You can see what they have access to and
        <br />
        what they don&#39;t.
        <br />
      </Typography>
      <br />
      <Divider />
      { /*
      <form onSubmit={handleSubmit}>
        <FormControl margin="normal">
          <InputLabel htmlFor="username">Username</InputLabel>
          <Input
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
          />
        </FormControl>
        <IconButton
          color="primary"
          onClick={handleSubmit}
          className={classes.button}
        >
          {fetchSuccess ? <CheckIcon /> : <Fingerprint />}
        </IconButton>
        { fetching &&
          <CircularProgress size={30} className={classes.progress} />
        }
      </form>
      */ }
      <br />
      <AutocompleteSelect
        id="username"
        name="username"
        value={username}
        onChange={handleSubmit2}
        onInputChange={handleAutocomplete}
        suggestions={suggestions}
        loading={loading}
      />
    </Paper>
  );
};

Superpower.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  history: PropTypes.object.isRequired,
};

export default Superpower;
