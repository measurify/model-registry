exports.catchErrors = (fn) => {
  return function(req, res, next) {
    return fn(req, res, next).catch(next);
  };
};

exports.notFound = (req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
};

const prepare = function (err) {
  err.stack = err.stack || '';
  if(err.message.includes("E11000 duplicate key error")) {
    err.message = "Please change _id, it is already in use";
    err.status = 400;
  }
  if(err.message.includes("validation failed:")) err.status = 400;
  return err;
}

exports.developmentErrors = (err, req, res, next) => {
  err = prepare(err);
  const errorDetails = {
    message: err.message,
    status: err.status || 500,
    stackHighlighted: err.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>')
  };
  res.status(err.status || 500);
  res.json(errorDetails)
};

exports.productionErrors = (err, req, res, next) => {
  err = prepare(err);
  const errorDetails = {
    message: err.message,
    status: err.status || 500
  };
  res.status(err.status || 500);
  res.json(errorDetails);
};
