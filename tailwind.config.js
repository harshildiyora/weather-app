/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ["./index.html", "./src/**/*.{js, css}"],
  theme: {
    fontFamily : {
      "montserrat" : ["Montserrat", "serif"]
    },
    extend: {
      'colors' : {
        'bg-purple' : '#5e41e4'
      }
    },
  },
  plugins: [],
}