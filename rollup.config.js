import typescript from 'rollup-plugin-typescript2'
// import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          module: 'ESNext',
        },
        include: ['src/**/*'],
      },
    }),
  ],
}
