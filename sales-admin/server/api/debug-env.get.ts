// Temporary debug endpoint - REMOVE AFTER DEBUGGING
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const cfEnv = (event as any).context?.cloudflare?.env || {}

  // List all keys in cfEnv (not values for security)
  const cfKeys = Object.keys(cfEnv)

  return {
    cfEnvKeys: cfKeys,
    cfEnvTypes: cfKeys.reduce((acc: Record<string, string>, k: string) => {
      acc[k] = typeof cfEnv[k]
      return acc
    }, {}),
    runtimeConfigKeys: {
      googleClientId: !!config.googleClientId,
      googleRedirectUri: !!config.googleRedirectUri,
      googleClientSecret: !!config.googleClientSecret,
      publicGoogleClientId: !!config.public?.googleClientId,
      publicGoogleRedirectUri: !!config.public?.googleRedirectUri,
    },
    processEnvKeys: Object.keys(process.env || {}).filter(k => k.startsWith('NUXT_')),
  }
})
