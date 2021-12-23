<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 2. 为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="main" style="width: 750px; height: 400px"></div>
    </el-card>
  </div>
</template>
<script>
// 1.导入echarts
import * as echarts from 'echarts'
import _ from 'lodash'
export default {
  data() {
    return {
      // 需要合并的对象   根据接口文档说明，请求到的数据有些短缺，需要将给定的对象放置到data里，然后与请求到的数据合并后放入echarts
      options: {
        title: {
          text: '用户来源',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3',
            },
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            boundaryGap: false,
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
      },
    }
  },
  created() {
  },
  async mounted() {
    // 3.基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))
    // 4.请求数据
    const { data: res } = await this.$axios.get('reports/type/1')
    if (res.meta.status !== 200) return this.$message.error('获取报表数据失败')
    console.log('获取到的报表数据', res)

    // 5.将请求到的数据（对象）与data中的对象进行合并，合并使用lodash的merge方法。
    const result = _.merge(res.data,this.options)
    // 6.使用刚指定的配置项和数据显示图表。
    myChart.setOption(result)
  },
  methods: {
  },
}
</script>
<style lang="less" scoped>
</style>