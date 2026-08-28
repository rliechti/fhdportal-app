/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  rules: {
    'vue/multi-word-component-names': 0,
    'vue/valid-v-slot': ['error', {
      allowModifiers: true,
    }],
    // Guards the exact pattern behind security audit H-1: a target="_blank" link
    // needs rel="noopener" (already present at every current call site) or the
    // opened page can reach back into window.opener.
    'vue/no-template-target-blank': ['error', { allowReferrer: false, enforceDynamicLinks: 'always' }]
  },
  parserOptions: {
    ecmaVersion: 'latest'
  }
}
