// CORS middleware for extension API requests
export default defineEventHandler((event) => {
  const origin = getHeader(event, 'origin') || ''

  // Allow requests from Chrome extensions
  if (origin.startsWith('chrome-extension://') || origin.startsWith('moz-extension://')) {
    setResponseHeaders(event, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    })

    // Handle preflight OPTIONS request
    if (getMethod(event) === 'OPTIONS') {
      event.node.res.statusCode = 204
      event.node.res.end()
      return
    }
  }
})
