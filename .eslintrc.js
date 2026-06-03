module.exports = {
  extends: 'expo',
  // Deno edge functions use a different runtime/toolchain (URL imports) and are
  // type-checked/deployed by the Supabase CLI, not linted by the RN app config.
  ignorePatterns: ['/dist/*', '/node_modules/*', '/supabase/functions/**'],
  rules: {
    'import/order': 'off',
  },
};
