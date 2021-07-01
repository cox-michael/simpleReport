const app = require('./app');

app.dboPromise.then(() => {
  app.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
    console.log(`Server running at http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/`);
  });
});
