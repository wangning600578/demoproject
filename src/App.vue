<template>
  <div id="app">
    <!-- router-view 路由占位符：通过路由匹配到的组件都会被渲染到routerview里面进行展示 -->
    <router-view></router-view>
  </div>
</template>

<script>
// 在项目里有一个文件名为.prettierrc,这是我们自己创建的一个文件，用来编写在格式化文档后希望得到
// 的规范，首先这个文件式json格式，里面的"semi":false --代表不自动不全分号，"singleQuote":true--代表不适用双引号表示字符串。
export default {
  name: 'app',
}
</script>

<style>
</style>
