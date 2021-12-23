<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-table :data="rightsList" stripe border max-height="480">
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column label="权限等级">
          <template slot-scope="scope">
            <!-- 第一种写法 使用v-if决定谁来渲染 -->
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
            <!-- 第二种写法 完全依靠三目运算来做 -->
            <!-- <el-tag
              :type="
                scope.row.level == '0'
                  ? ''
                  : scope.row.level == '1'
                  ? 'success'
                  : 'warning'
              "
              >{{ scope.row.level - 0 + 1 == '1' ? '一级':scope.row.level - 0 + 1 == '2' ? '二级':'三级' }}</el-tag
            > -->
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rightsList: [],
    }
  },
  created() {
    //获取所有的权限
    this.getRightsList()
  },
  methods: {
    //获取权限列表
    async getRightsList() {
      const { data: res } = await this.$axios.get('rights/list')
      //console.log("请求到的数据",res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsList = res.data
      console.log('this.rightsList:', this.rightsList)
    },
  },
}
</script>
<style lang="less" scoped>
</style>