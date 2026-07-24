import globals from 'globals'

import path from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import pluginJs from '@eslint/js'

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({ baseDirectory: __dirname, recommendedConfig: pluginJs.configs.recommended })

export default [
  // 생성 데이터/일회성 스크립트/임시 파일은 린트 제외
  {
    ignores: [
      'node_modules/**',
      'modules/cookings.js',
      'modules/ogham.json',
      'scripts/**',
      'temp/**',
      'static/**',
      '**/*.json'
    ]
  },
  { languageOptions: { globals: globals.browser } },
  ...compat.extends('standard')
]
