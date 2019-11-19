import typescript from 'rollup-plugin-typescript';
import { uglify } from 'rollup-plugin-uglify'

export default {
  input: "src/index.ts",
  output: {
    file: "dist/bundle.min.js",
    format: "cjs"
  },
  plugins: [
    typescript({ lib: ["es6"], target: "es5" }),
    uglify()
  ]
}