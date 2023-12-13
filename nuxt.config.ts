export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/google-fonts"],
  googleFonts: {
     families: {
      Inter: {
        wght: '100..900'
      },
      'Space Grotesk': {
        wght: '300..700'
      }
    }
  },
  nitro: {
    prerender: {
      routes: ['/']
    }
  },
  postcss: {
     plugins: {
      cssnano:
        process.env.NODE_ENV === 'production'
          ? { preset: ['default', { discardComments: { removeAll: true } }] }
          : false, // disable cssnano when not in production
     },
  }
})
