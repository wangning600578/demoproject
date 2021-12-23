import Vue from 'vue' //导入vue
import App from './App.vue' //导入根组件App.vue
import Router from './router.js' //将router.js文件导入到根文件/也叫入口文件（mian.js）中。
import axios from 'axios'  //导入axios
import ElementUI from 'element-ui';  //导入element-ui
import TreeTable from 'vue-table-with-tree-grid' //导入vue树形表格
import 'element-ui/lib/theme-chalk/index.css'; // 导入element-ui样式组件
import './assets/css/global.css' //导入全局样式文件
import './assets/fonts/iconfont.css'//导入字体图标
// 导入quill富文本编辑器
import  VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式 
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

//注册富文本编辑器
Vue.use(VueQuillEditor)

//导入echarts 
import echarts from 'echarts'
//全局注册echarts
Vue.prototype.$echarts = echarts

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/' //配置请求的根路径

//请求拦截器  在请求到后台服务器是要做的
axios.interceptors.request.use(config => {
  //console.log('config打印结果:',config)
  // 在除了登录请求以外的所有请求的请求头中加上Authorization字段，值为登录后获取到的token
  config.headers.Authorization = window.sessionStorage.getItem('token') 
  //固定写法，在最后必须将config retrun出去
  return config
})

Vue.prototype.$axios = axios  //全局注册axios  ---- 全局注册，使用方法为:this.$axios

Vue.use(ElementUI); //将element-ui注册到根文件下。
Vue.config.productionTip = false
Vue.component('tree-table',TreeTable) //注册使用vue树形表格

//定义全局的时间过滤器 使用filter进行过滤 第一个参数是过滤器的名字(随便起)，第二个是一个回调函数originVal参数是将要处理的值。
//在页面使用时将 在对应要处理的值后面加 ‘| 过滤器名称’ 具体使用看goods_list页面
Vue.filter('dataFormat',originVal =>{
  //将originVal传入new Date 能得到一个带有年月日时分秒的值。
  const time = new Date(originVal)
  //首先将originVal值的年份过滤出来
  const year = time.getFullYear()
  //将月份过滤出来,由于月份从零开始所以需要加1，而且如果当它没有超过两位数时就给它自动补全一个0，所以用字符串补全长度功能之前要在1后面拼接一个空字符串，让该数字变为字符串
  //ES2017 引入了字符串补全长度的功能。如果某个字符串不够指定长度，会在头部或尾部补全。padStart() 用于头部补全，padEnd() 用于尾部补全。
  //简单语法:str.padStart(targetLength,padString)  -------更多用法自行百度  
  //targetLength:当前字符串需要填充到的目标长度。如果这个数值小于当前字符串的长度，则返回当前字符串本身。
  //padString：如果没有达到目标长度，需要用什么填充
  const month = (time.getMonth() + 1 + '').padStart(2,'0')
  //将日期过滤出来
  const data = (time.getDate() + '').padStart(2,'0')
  //将小时过滤出来
  const hours = (time.getHours() + '').padStart(2,'0')
  //将分钟过滤出来
  const minutes = (time.getMinutes() + '').padStart(2,'0')
  //将秒数过滤出来
  const seconds = (time.getSeconds() + '').padStart(2,'0')
  //最后将值拼接在一起return出去
  return `${year}-${month}-${data} ${hours}:${minutes}:${seconds}`
})

//这里是根目录，这里创建了一个Vue实例，将#app这个根元素挂载到了Vue实例上。  //这里必须引入vue模块
new Vue({  
  router:Router,    //将router路由文件，渗透进每一个组件中。
  render: h => h(App), //根入口mian.js文件里要引入App.vue根组件(本质上也是一个文件)
}).$mount('#app')
