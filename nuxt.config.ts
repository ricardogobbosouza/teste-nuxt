// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [/*"@nuxtjs/google-fonts",*/"@nuxtjs/tailwindcss"],
  googleFonts: {
    families: {
      Inter: true,
      Ubuntu: true
    }
  },
  nitro: {
    publicAssets: [
      { dir: './fonts' }
    ],
    prerender: {
      routes: ['/']
    }
  },
  /*
  css: [
    '@/assets/css/style.css'
  ],
  */
  /*postcss: {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
      cssnano:
        process.env.NODE_ENV === 'production'
          ? { preset: ['default', { discardComments: { removeAll: true } }] }
          : false, // disable cssnano when not in production
     },
  }*/
})
