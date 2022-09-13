import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import '../src/assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
// 导入treetable
import TreeTable from 'vue-table-with-tree-grid'
// 配置axios
import axios from 'axios'
// 配置axios请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 在挂载到原型之前先预处理一下，请求拦截器添加token，保证后续访问数据的权限，请求头携带一个token
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// axios挂载到vue原型对象上作为一个属性，这样每个vue的组件都能使用axios
// $http 是自定义的
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 注册treetable
Vue.component('tree-table',TreeTable)

// 导入富文本编辑器插件
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
Vue.use(VueQuillEditor)

// 全局过滤器，格式化文本的，这里格式化日期 
// dateFormat 过滤器名字 originVal要过滤的东西  padStart字符串补零方法
Vue.filter('dateFormat',function(originVal){
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth()+1+'').padStart(2,'0')
  const d = (dt.getDate()+'').padStart(2,'0')
  const hh = (dt.getHours()+'').padStart(2,'0')
  const mm = (dt.getMinutes()+'').padStart(2,'0')
  const ss = (dt.getSeconds()+'').padStart(2,'0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
