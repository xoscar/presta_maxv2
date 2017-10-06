function ErrorHandler({ statusCode, messages, type }) {
  const send = (res) => {
    res.status(statusCode).json({
      messages,
      type,
    });
  };

  return {
    send,
    info: () => ({ statusCode, messages }),
  };
}

ErrorHandler.handle = (err) => {
  if (err instanceof ErrorHandler) {
    return err;
  }

  // only log not handled errors
  if (!err.messages) {
    console.log('An unhandled error ocurred', err, JSON.stringify(err));

    return Promise.reject(new ErrorHandler({
      statusCode: 500,
      type: 'UnhandledError',
      messages: [{
        code: 'UnhandledError',
        text: `Unhandled error ${err}`,
      }],
    }));
  }

  console.log('An error ocurred', err, JSON.stringify(err));

  return Promise.reject(new ErrorHandler(err));
};

ErrorHandler.attach = res => (
  err => (
    ErrorHandler.handle(err)

    .catch(handledErr => (
      handledErr.send(res)
    ))
  )
);

module.exports = ErrorHandler;
