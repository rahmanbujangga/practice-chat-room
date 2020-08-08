exports.generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime(),
  };
};

exports.generateLocUrl = (username, url) => {
  return {
    username,
    url,
    createdAt: new Date().getTime(),
  };
};
