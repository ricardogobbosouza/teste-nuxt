// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/google-fonts", "@nuxtjs/tailwindcss"],
  googleFonts: {
    families: {
      Roboto: true,
      Ubuntu: true
    }
  },
  nitro: {
    prerender: {
      routes: ['/']
    }
  }
})