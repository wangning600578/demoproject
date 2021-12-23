<template>
  <!-- 主页整体 -->
  <el-container class="home-container">
    <!--头部区域-->
    <el-header>
      <div class="header-left">
        <img src="../assets/heima.png" alt="电商后台管理系统" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="loginOut">退出</el-button>
    </el-header>
    <!-- 内容区域 -->
    <el-container>
      <!-- 侧边栏区域 -->
      <el-aside :width="iscollapse ? '64px':'200px'">
        <!-- 侧边栏展开与收起按钮 -->
        <div class="toggle-button" @click="toggleCollapse()">
            |||
        </div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          :unique-opened="true"
          :collapse="iscollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!--:unique-opened='true' 因为true为布尔值，所以这里需要绑定一下，不绑定的话会识别为字符串从而报错 -->
          <!-- 一级菜单1 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 一级菜单图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 一级菜单文本 -->
              <span slot="title">{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="seveNavState('/'+subItem.path)"
            >
              <!-- 二级菜单模板区域 -->
              <template slot="title">
                <!-- 二级菜单图标 -->
                <i class="el-icon-menu"></i>
                <!-- 二级菜单文本 -->
                <span slot="title">{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体区域 -->
      <el-main> 
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
  <!-- 主页整体 -->
  <!-- 重点 1.在二级菜单标签里index属性被写成了:index="'/'+subItem.path" ，那是因为在element-ui中的导航菜单中有一个router属性，
  这个属性开启后会让底层菜单在点击后跳转到和它绑定的index值形同的页面去。而index值不一定必须是数字，本来就是用来确认唯一性，只要不相同就好 -->
</template>
<script>
export default {
  data() {
    return {
      menuList: [],
      iconsObj: {
        //对象里的键可以是数字也可以为字符串，都能和请求到的数据里的id字段的值对应上，这里不区分基本数据类型是字符串还是数字
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao',
      },
      //是否折叠
      iscollapse: false,
      //被激活的链接地址
      activePath:''
    }
  },
  created() {
    this.getMenuList()
    //在挂载后的生命周期函数中，将sessionStorage中的activePath赋值给activePath
    this.activePath = window.sessionStorage.getItem('activePath') 
  },
  methods: {
    //退出按钮执行的事件
    loginOut() {
      window.sessionStorage.clear() // 将sessionStorage本地数据库里的token清空
      this.$router.push('/login') // 通过编程式导航跳转回登率页
    },
    //生命周期函数中执行的函数
    async getMenuList() {
      //如果直接请求，得到的是一个promise，需要使用async和await才能请求到数据，具体为什么有待研究
      const { data: res } = await this.$axios.get('menus')
      //console.log("请求到的数据:",res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.mag)
      this.menuList = res.data
      //console.log('获取到的数据:', this.menuList)
    },
    //点击按钮，切换菜单的折叠与展开
    toggleCollapse() {
       this.iscollapse = !this.iscollapse
    },
    seveNavState(activePath) {
      window.sessionStorage.setItem('activePath',activePath) //将当前组件对应的路由地址存储到sessionStorage中
    }
  },
}
</script>
<style lang="less" scoped>
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  font-size: 20px;
  .header-left {
    display: flex;
    align-items: center;
    padding-left: 5px;
    span {
      color: #fff;
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .toggle-button{
      background-color: #4a5064;
      font-size: 10px;
      line-height: 24px;
      color: #fff;
      text-align: center;
      letter-spacing: 0.2em;
      cursor: pointer;
  }
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.home-container {
  height: 100%;
}
.iconfont {
  margin-right: 10px;
}
</style>
