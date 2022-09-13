import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import User from '../components/user/User.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import List from '../components/goods/List.vue'
import Add from '../components/goods/Add.vue'
import Order from '../components/order/Order.vue'
import Reports from '../components/reportss/Reports.vue'

Vue.use(VueRouter)

const routes = [
  {path:'/',redirect:'/Login'}, //重定向
  {path:'/Login',component:Login},
  {
    path:'/home',
    component:Home,
    redirect:'/welcome',
    children:[
    {path:'/welcome',component:Welcome},
    {path:'/users',component:User},
    {path:'/rights',component:Rights},
    {path:'/roles',component:Roles},
    {path:'/categories',component:Cate},
    {path:'/params',component:Params},
    {path:'/goods',component:List},
    {path:'/goods/add',component:Add},
    {path:'/orders',component:Order},
    {path:'/reports',component:Reports}
  ]}
]

const router = new VueRouter({
  routes
})

// 设置导航守卫控制访问权限
router.beforeEach((to,from,next)=>{
  // 访问的是登录页直接放行
  if(to.path === '/Login'){
    return next()
  }else{
    const tokenStr = window.sessionStorage.getItem('token')
    if(!tokenStr){
      // 没有token强制跳转到登录页
     return next('/Login')
    }else{
      next()
    }
  }
})

export default router
