<template>
  <!--less sass和less都属于css预处理器(css预处理器定义了一种新语言其基本思想是,用一种专门的编程语言,为css增加了一些编程特性,
    将css作为目标生成文件,然后开发者就只要使用这种语言进行css的编码工作) -->
  <!-- 1.下载less,以及使用
   (1) less官网:https://less.bootcss.com/ 更多使用方法详情见官网，如变量，混合，嵌套，运算，函数
   (2) 在cmd或者其他命令框,找到需要下载的路径  
    npm install less --save /--save-dev
	还要下载一个less-loader,less才可以使用
	npm install less-loader --save/--save-dev
   (3) 在项目里的package.json文件里查看是否下载完成
    这里注意"dependencies"和"devDependencies"的区别 前者未生产环境,后者为开发环境
	具体可以搜百度看一下,或者查看这个网址,有详细解答 https://www.cnblogs.com/jinzhou/p/12888771.html
   (4) 不管"dependencies"和"devDependencies"哪个里面下载了less和less-loader 都可以用
    只要在<style lang="less"></style> 加上less就可以使用了.
   (5) 如果下载完成重启项目(npm run dev)报错,很有可能是less 本版太高需要降低版本，执行代码  
    先移除之前的版本: npm uninstall less-loader,
	下载指定版本如:npm install less-loader@5.0.0 -D,
	然后在重启就没问题了. -->
  <!-- scoped代表样式只在当前页面生效 -->
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <img src="../assets/the_earth.jpg" alt="" />
      <!-- 表单区域 -->
      <!--  :model是v-bind:model的缩写,它只是将父组件的数据传递到了子组件，并没有实现子组件和父组件数据的双向绑定 -->
      <el-form
        :model="loginForm"
        label-width="0px"
        class="login_form"
        :rules="loginFormRules"
        ref="loginFormRef"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //登录表单的数据绑定对象
      loginForm: {
        username: "admin",
        password: "123456",
      },
      //表单的验证队则对象
      loginFormRules: {
        //验证用户名是否合法
        username: [
          //required: true--代表必填项，message代表提示文字,trigger:'blur'代表当该输入框失去焦点时便出发验证规则
          { required: true, message: "请输入登录的用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10个字符", trigger: "blur" },
        ],
        //验证密码是否合法
        password: [
          { required: true, message: "请输入登录的密码", trigger: "blur" },
          { min: 6, max: 10, message: "长度在 3 到 10个字符", trigger: "blur" },
        ],
      },
    };
  },
  methods:{
    //点击重置按钮，重置登录表单
    resetLoginForm(){
      console.log("当前this指向(整个表单的实例化对象):",this)
      //打印出当前this看一下，很直观。首先要想获取整个表单元素（实例对象），就要在form上定义ref="loginFormRef"这个引号里的名字随便起，其次当在该表单内
      //触发一个事件，那么当前事件里打印到的this，一定指向这整个表单元素的实例对象,那么要清空（重置）实例对象，就要找到实例对象里的$refs字段，$refs字段里
      //存放着loginFormRef字段（这个名称是你刚刚自己定义的），这个字段里存放着整个表单信息，找到之后再使用elementui提供的resetFields()方法，就可以将整个表单进行重置了。
      this.$refs.loginFormRef.resetFields()

      //当然还有笨办法,但下面的代码无法清空表单的验证提示效果
      //  this.loginForm.username = ''
      //  this.loginForm.password = ''
    },
    //点击登录按钮时触发的函数
    login(){
      //点击登录时，我们不能不管用户输入的用户名和密码是否正确就发起请求，应该先预验证一下，确认输入无误后再发起请求。
      //那么如何发起预验证呢？就要使用elementui的validate方法(此方法会自动根据我们写的校验规则进行判断），此方法的参数为一个回调函数参数为一个回调函数。
      //该回调函数会在校验结束后被调用，并传入两个参数：是否校验成功,未通过校验的字段
      this.$refs.loginFormRef.validate(async (valid,notPass) => {
        console.log("是否校验成功:",valid,"未通过校验的字段:",notPass)
        if(!valid)return; //！为取反，意思为如果valid的结果为false则直接跳出当前函数
        //判断里只有一个return时可以省略{}符号
        const result = await this.$axios.post('login',this.loginForm)
        //请求还可以写为下面这样，不过下面太繁琐
        //const result = this.$axios.post('login',{username:this.loginForm.username,password:this.loginForm.password})
        //这个请求这里有待学习，目前不明白为什么这里要使用async和awite，明明axios是异步的，明明他的上一个函数（回调函数也是异步的）
        console.log("result",result)
        //当打印出result的值时发现是个对象，并且这个对象有6个值，但其实请求回来的只有data，其他值都是axios帮我们封装进去的，代表当前axios请求成功了
        //其实仔细看接口（data）的返回值data.meta.status才能知道我们输入的用户名和密码是否正确，所以还可以写一种结构赋值的写法直接将data抽离出来
        // const {data:res} = await this.$axios.post('login',this.loginForm)
        // console.log("res:",res)
        if(result.data.meta.status !== 200) return this.$message.error('登陆失败');
        this.$message.success('登陆成功');
        //登录成功之后，将登录成功之后的token，保存到客户端的sessionStorage中
        // 1.项目中除了登录之外的其他API接口，必须再登录之后才能访问
        // 2.token只应在当前网站打开期间生效，所以将token保存在sessionStorage中
        window.sessionStorage.setItem("token",result.data.data.token)
        //通过编程式导航跳转到后台主页，路由地址是'/home'
        this.$router.push('/home')
      })
    }
  }
};
</script>
<style lang="less" scoped>
.login_container {
  background: #2b4b6b;
  height: 100%;
  // display: flex;
  // justify-content: center;
  // align-items: center;
  .login_box {
    width: 450px;
    height: 300px;
    background: white;
    border-radius: 3px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    img {
      display: block;
      width: 130px;
      height: 130px;
      border: 6px solid white;
      margin: -65px auto 0;
      padding: 10px;
      border-radius: 50%;
      box-shadow: 0 0 10px #ddd;
      background: white;
    }
    .login_form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px; //这样设置的话整个form表单会朝右侧偏移，这是因为form表单默认box-sizing为content-box，也就是宽度高度不包含padding和border
      box-sizing: border-box; //border-box 代表form盒子的宽度高度为：内容+padding+border。
      // .bnts{   //不知道为什么套上btns这个类就会报错，这里要解决样式问题，要具体去看elemntui到底套了几层。
      /deep/ .el-form-item__content {
        display: flex !important;
        justify-content: flex-end !important;
      }
      //}
    }
  }
}
</style>
