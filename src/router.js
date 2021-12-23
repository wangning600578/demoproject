import Vue from 'vue';  //导入vue
import VueRouter from 'vue-router' //导入vue-router 

Vue.use(VueRouter)  //注册VueRouter

//导入组件,需要切换的路由组件(页面)的路径
import Login from './components/Login.vue' //将login登录组件(页面)导入到router文件里
import Home from './components/Home.vue' // 将home主页组件(页面)导入到router文件里
import Welcome from './components/Welcome.vue' //将home主页组件(页面)导入到router文件里
import Users from './view/user/Users.vue' //将用户列表组件导入到router文件里
import Roles from './view/power/Roles.vue'//将角色列表组件导入到router文件里
import Rights from './view/power/Rights.vue'//将角色列表组件导入到router文件里
import Cate from './view/goods/Cate.vue' //将商品分类组件导入到router文件里
import Params from './view/goods/Params.vue' //将分类参数组件导入到router文件里
import GoodsList from './view/goods/Goods_list.vue' //将商品列表组件导入到router文件里
import Add from './view/goods/Add.vue' //将添加商品组件导入到router文件里
import Order from './view/order/Order.vue' //将订单列表组件导入到router文件里
import Report from './view/report/Report.vue' //将数据报表组件导入到router文件里

let route = [{ //配置路由规则
    path:"/login",  // path用来指定路径，当用户访问了该地址时，就给用户看到下面component字段值代表的页面
    component:Login // 当用户访问到'/login'时给用户展示Login组件
},{  
    path:"/",
    redirect:"/login" //redirect(重定向)，此代码表示，当用户访问"/"该地址时，让它重定向到"/login"这个路径上来所以给用户展示的也是Login组件的内容
},{
    path:"/home",
    component:Home,
    redirect:"/welcome",
    children:[
        {
            path:"/welcome",
            component:Welcome
        },{
            path:"/users",
            component:Users
        },{
            path:"/roles",
            component:Roles
        },{
            path:"/rights",
            component:Rights
        },{
            path:'/categories',
            component:Cate
        },{
            path:'/params',
            component:Params
        },{
            path:'/goods',
            component:GoodsList
        },{
            path:'/goods/add',
            component:Add
        },{
            path:'/orders',
            component:Order
        },{
            path:'/reports',
            component:Report
        }
    ]
}]

let router = new VueRouter({ // 创建路由实例，将路由规则加入到路由实例当中
    routes:route
})


//为什么要做导航守卫，因为如果用户没有登录，但直接通过URL访问特定页面，需要重新导航到登录页面
// 挂载路由守卫 beforeEach
router.beforeEach((to,from,next) => {
    //to 代表将要访问的路径
    //from 代表从那个路径跳转而来
    //next 是一个函数，代表放行。其中next()-----放行 ,next('/login')----强制跳转到登录页面
    if(to.path === '/login') return next() //如果用户要去登录页面的直接放行，否则执行下面的代码
    //从sessionStorage里获取token
    const tokenStr = window.sessionStorage.getItem('token')
    //判断是否有token，如果没有(为空)，那么强制跳转到登录页，如果有那么直接放行
    if(!tokenStr){
        return next('/login')
    }else{
        next()
    }
})

export default router // 导出路由实例



//还可以使用下面这样的简单写法（直接导出路由规则）
// export default new VueRouter ({
//     routes:[
//         { path:'/login',
//           component:Login 
//         }
//     ]
// })