import { resolve } from 'pathe'
import { defineNuxtModule, resolvePath } from '@nuxt/kit'

export default defineNuxtModule({
  async setup(options, nuxt) {
    const outputDir = await resolvePath('fonts')

    nuxt.options.css.push(resolve(outputDir, 'style.css'))
    nuxt.options.nitro = nuxt.options.nitro || {}
    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
    nuxt.options.nitro.publicAssets.push({ dir: outputDir })
  }
})