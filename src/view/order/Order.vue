<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部区域 -->
      <el-row :gutter="20">
        <!--搜索区域  -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable>
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table
        :data="orderlist"
        style="width: 100%"
        border
        :stripe="true"
        max-height="400px"
      >
        <el-table-column type="index" label="序号" width="50" align="center">
        </el-table-column>
        <el-table-column
          prop="order_number"
          label="订单编号"
          width="400"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="order_price"
          label="订单价格"
          width="80"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="pay_status"
          label="是否付款"
          width="100"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag :type="scope.row.pay_status === '0' ? 'danger' : 'success'">
              {{ scope.row.pay_status === '0' ? '未付款' : '已付款' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="is_send"
          label="是否发货"
          width="80"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="create_time"
          label="下单时间"
          width="300"
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.create_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template>
            <!-- 编辑按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showBox"
            ></el-button>
            <!-- 定位按钮 -->
            <el-button
              icon="el-icon-location"
              size="mini"
              class="alterBackground"
              @click="showprogressBox"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 底部分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.queryInfo.pagenum"
        :page-sizes="this.pageSizes"
        :page-size="this.queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total"
        background
      >
      </el-pagination>
    </el-card>
    <!-- 编辑弹框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="addressDialogClose"
    >
      <el-alert title="后台原因,修改功能暂无法实现" type="error" show-icon>
      </el-alert>
      <!-- 表单区域 -->
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            expand-trigger="hover"
            :options="cityData"
            v-model="addressForm.address1"
          >
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 展示物流进度的弹框 -->
    <el-dialog title="提示" :visible.sync="progressDialogVisible" width="50%">
      <el-alert title="后台原因,无法获取物流进度的信息,时间线组件无法学习" type="error" show-icon>
      </el-alert>
      <span>展示物流进度的弹框</span>
    </el-dialog>
  </div>
</template>
<script>
import cityData from './citydata.js'
export default {
  data() {
    return {
      //请求订单数据和查询所用到的对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      //总条数
      total: 0,
      //每页显示条数的可选则列表
      pageSizes: [5, 10, 15, 20],
      //获取到的订单数据
      orderlist: [],
      //控制编辑弹框的显示或隐藏
      addressDialogVisible: false,
      //表单对象
      addressForm: {
        address1: [],
        address2: '',
      },
      //表单验证规则对象
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' },
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' },
        ],
      },
      //可将导入的文件已data值的形式存放在这里
      //原写为 cityData:cityData,如果属性值和属性名相同则可以简写位一个就行
      cityData, //城市的数据,共级联选择器使用
      //展示物流进度的弹框弹框的显示与隐藏
      progressDialogVisible: false,
      //存放物流信息的数组
      progressInfo:[]
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$axios.get('orders', {
        params: this.queryInfo,
      })
      console.log('请求到的订单数据', res)
      if (res.meta.status !== 200)
        return this.$message.error('获取订单数据列表失败')
      this.orderlist = res.data.goods
      this.total = res.data.total
    },
    //每页条数发生改变时
    handleSizeChange(newSize) {
      // console.log('每页'+newSize+'条')
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    //当前页数发生改变时
    handleCurrentChange(newPage) {
      // console.log('当前是第'+newPage+'页')
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    //点击编辑按钮触发的事件
    showBox() {
      this.addressDialogVisible = true
    },
    //修改弹框的关闭事件
    addressDialogClose() {
      this.$refs.addressFormRef.resetFields()
    },
    //点击定位按钮触发的事件
    async showprogressBox() {
      // const {data:res} = await this.$axios.get('/kuaidi/1106975712662')
      // if(res.meta.status !== 200 ) return this.$message.error('获取物流进度失败')
      // this.progressInfo = res.data
      this.progressDialogVisible = true
      //console.log("物流信息",this.progressInfo)
    },
  },
}
</script>
<style lang="less" scoped>
.alterBackground {
  background: rgb(59, 181, 59);
  color: white;
}
.el-cascader {
  width: 100%;
}
.el-alert {
  margin-bottom: 15px;
}
</style>
