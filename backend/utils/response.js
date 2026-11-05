exports.ok = (res, data = null, message = 'OK', code = 200) =>
  res.status(code).json({ success: true, message, data });
exports.fail = (res, message = 'Error', code = 400, errors = null) =>
  res.status(code).json({ success: false, message, errors });
