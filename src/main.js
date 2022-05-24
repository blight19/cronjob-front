import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import VueAxios from 'vue-axios'


import App from './App.vue'
import router from './router'

Vue.config.productionTip = false
Vue.use(ElementUI)
axios.defaults.baseURL='http://localhost:8080'
axios.interceptors.request.use(
    config => {
      if (window.sessionStorage.getItem('token')) {
        config.headers.Authorization = "Bearer "+window.sessionStorage.getItem('token');
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    });

axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    if(response.data.message==="invalid token"){
        window.sessionStorage.removeItem("token")

    }
    return response;
}, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
})
Vue.use(VueAxios, axios)
new Vue({

  render: h => h(App),
  router,
}).$mount('#app')

