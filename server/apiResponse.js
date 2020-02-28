module.exports = () => (req, res, next) => {
  res._success = true;
  res._messages = [];
  res.success = success => { res._success = success; return res; };
  res.messages = messages => { res._messages = messages; return res; };

  res.apiRes = (data = {}) => {
    if (res.headersSent) return;
    res.json({
      isLoggedIn: req.session.isLoggedIn,
      success: res._success,
      messages: res._messages,
      data,
    });
  };

  next();
};
