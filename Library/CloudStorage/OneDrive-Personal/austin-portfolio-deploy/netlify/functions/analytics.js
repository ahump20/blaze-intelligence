// Analytics endpoint stub - deployment pending
exports.handler = async () => ({
  statusCode: 501,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    error: 'not_implemented',
    detail: 'Analytics endpoint stubbed; deployment pending',
    docs: 'mailto:ahump20@outlook.com'
  })
});