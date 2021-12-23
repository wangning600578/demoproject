<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部区域 -->
      <el-row :gutter="20">
        <!--搜索区域  -->
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodslist()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodslist()"
            ></el-button>
          </el-input>
        </el-col>
        <!-- 添加商品按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table
        :data="goodsList"
        style="width: 100%"
        border
        stripe
        max-height="415"
      >
        <!-- 索引列  -->
        <el-table-column type="index" width="50" label="序号">
        </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px">
        </el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="140px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editList(scope.row)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 底部分页区域 -->
      <div class="block">
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
      </div>
    </el-card>
    <!-- 编辑弹框 -->
    <el-dialog
      title="修改信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editClose"
    >
      <!--警告  -->
      <el-alert title="后台接口有误,修改功能暂无法实现" type="error" show-icon> </el-alert>
      <!-- 表单区域 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoods()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //查询参数的对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      //存放表格数据
      goodsList: [],
      //总条数
      total: 0,
      //每页可选的条数数组
      pageSizes: [10, 15, 20, 25],
      //控制修改弹框的显示与隐藏
      editDialogVisible: false,
      //用于修改的数组
      editForm: {
        id: '',
        goods_name: '',
        goods_price: '',
        goods_number: '',
        goods_weight: '',
      },
      //修改框表单的验证规则对象
      editFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getGoodslist()
  },
  methods: {
    async getGoodslist() {
      const { data: res } = await this.$axios.get('goods', {
        params: this.queryInfo,
      })
      console.log('请求到的列表数据', res)
      if (res.meta.status !== 200)
        return this.$message.error('获取数据泪飙失败')
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    //每页条数发生改变时
    handleSizeChange(newSize) {
      // console.log('每页'+newSize+'条')
      this.queryInfo.pagesize = newSize
      this.getGoodslist()
    },
    //当前页数发生改变时
    handleCurrentChange(newPage) {
      // console.log('当前是第'+newPage+'页')
      this.queryInfo.pagenum = newPage
      this.getGoodslist()
    },
    //删除当前行数据触发的事件
    removeById(id) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$axios.delete(`goods/${id}`)
          if (res.meta.status !== 200)
            return this.$message.error('删除商品失败')
          //删除成功的提示
          this.$message({
            type: 'success',
            message: '删除成功!',
          })
          //刷新列表
          this.getGoodslist()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    //点击跳转到添加商品页面
    goAddPage() {
      this.$router.push('/goods/add')
    },
    //点击编辑按钮所触发的事件
    editList(row) {
      this.editDialogVisible = true
      this.editForm = {
        id: row.goods_id,
        ...row,
      }
      console.log(this.editForm)
    },
    //点击编辑弹框内的确定按钮所触发的事件
    editGoods() {
      // !!!后台接口有误,暂无法修改

      // this.$refs.editFormRef.validate(async valid =>{
      //   if(!valid) return this.$message.error('输入的信息不合法,请重新输入')
      //   const {data:res} = await this.$axios.put('goods/'+this.editForm.id,this.editForm)
      //   console.log(res)
      this.editDialogVisible = false
      //})
    },
    editClose() {
      //重置表单
      this.$refs.editFormRef.resetFields()
    },
  },
}
</script>
<style lang="less" scoped>
.el-alert{
  margin-bottom: 15px;
}
</style>
