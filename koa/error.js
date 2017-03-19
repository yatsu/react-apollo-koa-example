export default (async function errorHandler(ctx, next) {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.app.emit('error', err, ctx)
    ctx.type = 'application/json'
    ctx.body = { error: { message: err.message, status: ctx.status } }
  }
});
