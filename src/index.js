import Vue from 'vue'

import App from './App'

const element = document.getElementById('app')

const vueElement = element.appendChild(document.createElement('div'));

new Vue({
  el: vueElement,
  components: { App },
  template: '<App />',
})
