import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'pathe'
import type { MetaObject } from '@nuxt/schema'
import { defineNuxtModule, isNuxt2, resolvePath, useLogger } from '@nuxt/kit'
import { constructURL, download, isValidURL, parse, merge, type DownloadOptions, type GoogleFonts } from 'google-fonts-helper'

type NuxtAppHead = Required<MetaObject>

export interface ModuleOptions extends DownloadOptions, GoogleFonts {
  prefetch?: boolean
  preconnect?: boolean
  preload?: boolean
  useStylesheet?: boolean
  download?: boolean
  inject?: boolean
}

const logger = useLogger('nuxt:google-fonts')

export default defineNuxtModule<ModuleOptions>({
  meta: {
    configKey: 'googleFonts'
  },
  defaults: {
    families: {},
    display: undefined, // set to 'swap' later if no preload or user value
    subsets: [],
    text: undefined,
    prefetch: true,
    preconnect: true,
    preload: false,
    useStylesheet: false,
    download: true,
    base64: false,
    inject: true,
    overwriting: false,
    outputDir: '@/nuxt-google-fonts',
    stylePath: 'css/nuxt-google-fonts.css',
    fontsDir: 'fonts',
    fontsPath: '../fonts'
  },
  async setup (options, nuxt) {
    // If user hasn't set the display value manually and isn't using
    // a preload, set the default display value to 'swap'
    if (options.display === undefined && !options.preload) {
      options.display = 'swap'
    }

    const fontsParsed: GoogleFonts[] = []
    // @ts-ignore
    const head = (nuxt.options.app.head || nuxt.options.head) as NuxtAppHead

    // disable module when head is a function
    if (typeof head === 'function') {
      logger.warn('This module does not work with `head` as function.')

      return
    }

    // merge fonts from valid head link
    fontsParsed.push(...head.link
      .filter(link => isValidURL(String(link.href)))
      .map(link => parse(String(link.href)))
    )

    // construct google fonts url
    const url = constructURL(merge(options, ...fontsParsed))

    if (!url) {
      logger.warn('No provided fonts.')

      return
    }

    // remove fonts
    head.link = head.link.filter(link => !isValidURL(String(link.href)))

    // download
    if (options.download) {
      const outputDir = await resolvePath(options.outputDir)

      try {
        const downloader = download(url, {
          base64: options.base64,
          overwriting: options.overwriting,
          outputDir,
          stylePath: options.stylePath,
          fontsDir: options.fontsDir,
          fontsPath: options.fontsPath
        })

        const outputFonts: string[] = []

        downloader.hook('download:start', () => {
          logger.start('Downloading fonts...')
        })

        downloader.hook('download:complete', () => {
          logger.success('Download fonts completed.')
          logger.log('')
        })

        downloader.hook('download-css:done', (url) => {
          logger.success(url)
        })

        downloader.hook('download-font:done', (font) => {
          const fontName = font.outputFont.replace(`-${font.outputFont.replace(/.*-/, '')}`, '')

          if (!outputFonts.includes(fontName)) {
            outputFonts.push(fontName)
            logger.info(fontName)
          }
        })

        await downloader.execute()

        if (options.inject) {
          let content = readFileSync(resolve(outputDir, options.stylePath), 'utf-8');

          content = content.replace('/* cyrillic */', '')
          content = content.replace('/* cyrillic */', '')
          content = content.replace('/* cyrillic */', '')
          content = content.replace('/* cyrillic-ext */', '')
          content = content.replace('/* cyrillic */', '')
          content = content.replace('/* greek-ext */', '')
          content = content.replace('/* greek */', '')
          content = content.replace('/* vietnamese */', '')
          content = content.replace('/* latin-ext */', '')
          content = content.replace('/* latin */', '')
          content = content.replace('/* cyrillic-ext */', '')
          content = content.replace('/* cyrillic */', '')
          content = content.replace('/* greek-ext */', '')
          content = content.replace('/* greek */', '')
          content = content.replace('/* latin-ext */', '')
          content = content.replace('/* latin */', '')
          content = content.replace(/\/\*[\s\S]*?\*\/|(?<=[^:])\/\/.*|^\/\/.*/g,'')

          writeFileSync(resolve(outputDir, options.stylePath), `/* https://fonts.googleapis.com/css2?family=Inter&family=Ubuntu&display=swap */
/* latin-ext */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../fonts/Inter-400-6.woff2') format('woff2');
  unicode-range: U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* latin */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../fonts/Inter-400-7.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
`, 'utf-8')
          console.log(content)

          nuxt.options.css.push(resolve(outputDir, options.stylePath))
        }

        // Add the nuxt google fonts directory
        nuxt.options.nitro = nuxt.options.nitro || {}
        nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
        nuxt.options.nitro.publicAssets.push({ dir: outputDir })
      } catch (e) {
        logger.error(e)
      }

      return
    }

    // https://developer.mozilla.org/en-US/docs/Web/Performance/dns-prefetch
    if (options.prefetch) {
      head.link.push({
        key: 'gf-prefetch',
        rel: 'dns-prefetch',
        href: 'https://fonts.gstatic.com/'
      })
    }

    // https://developer.mozilla.org/en-US/docs/Web/Performance/dns-prefetch#Best_practices
    if (options.preconnect) {
      head.link.push(
        // connect to domain of font files
        {
          key: 'gf-preconnect',
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com/',
          crossorigin: 'anonymous'
        },

        // Should also preconnect to origin of Google fonts stylesheet.
        {
          key: 'gf-origin-preconnect',
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com/'
        }
      )
    }

    // https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preload
    // optionally increase loading priority
    if (options.preload) {
      head.link.push({
        key: 'gf-preload',
        rel: 'preload',
        as: 'style',
        href: url
      })
    }

    // append CSS
    if (options.useStylesheet) {
      head.link.push({
        key: 'gf-style',
        rel: 'stylesheet',
        href: url
      })

      return
    }

    if (isNuxt2()) {
      // JS to inject CSS
      head.script.push({
        key: 'gf-script',
        innerHTML: `(function(){var l=document.createElement('link');l.rel="stylesheet";l.href="${url}";document.querySelector("head").appendChild(l);})();`
      })

      // no-JS fallback
      head.noscript.push({
        key: 'gf-noscript',
        innerHTML: `<link rel="stylesheet" href="${url}">`,
        tagPosition: 'bodyOpen'
      })

      // Disable sanitazions
      // @ts-ignore
      head.__dangerouslyDisableSanitizersByTagID = head.__dangerouslyDisableSanitizersByTagID || {}
      // @ts-ignore
      head.__dangerouslyDisableSanitizersByTagID['gf-script'] = ['innerHTML']
      // @ts-ignore
      head.__dangerouslyDisableSanitizersByTagID['gf-noscript'] = ['innerHTML']

      return
    }

    // JS to inject CSS
    head.script.unshift({
      key: 'gf-script',
      children: `(function(){
        var h=document.querySelector("head");
        var m=h.querySelector('meta[name="head:count"]');
        if(m){m.setAttribute('content',Number(m.getAttribute('content'))+1);}
        else{m=document.createElement('meta');m.setAttribute('name','head:count');m.setAttribute('content','1');h.append(m);}
        var l=document.createElement('link');l.rel='stylesheet';l.href='${url}';h.appendChild(l);
      })();`
    })

    // no-JS fallback
    head.noscript.push({
      children: `<link rel="stylesheet" href="${url}">`,
      tagPosition: 'bodyOpen'
    })
  }
})