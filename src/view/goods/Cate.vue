<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showaddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 树形表格区域 -->
      <!-- 首先说一下树形element-ui里没有提供，要想使用必须下载插件 使用npm install vue-table-with-tree-grid 版本未0.2.4或更高-->
      <!-- 其次在mian.js中 import treeTable from 'vue-table-with-tree-grid' //导入vue树形表格 -->
      <!-- Vue.component('tree-table',treeTable) //注册使用vue树形表格  第一个是使用名称,第二个是导入名称 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="序号"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效列 -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序列 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag
            v-else-if="scope.row.cat_level === 1"
            type="success"
            size="mini"
            >二级</el-tag
          >
          <el-tag v-else type="warning" size="mini">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCate(scope.row)"
            >编辑</el-button
          >
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 底部分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="pageSizes"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClose"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormrules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedkeys"
            :options="parentCateList"
            expandTrigger="hover"
            :props="cascaderProps"
            @change="parentCateChanged"
            :pcheckStrictly="true"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 点击编辑的对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClose"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormrules"
        ref="editruleFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //商品分类得数据列表，默认为空
      cateList: [],
      //请求需要用到得参数
      queryInfo: {
        type: [1, 2, 3],
        pagenum: 1,
        pagesize: 5,
      },
      //总条数
      total: 0,
      //定义一页为几条数据的数组
      pageSizes: [5, 10, 15, 20],
      //定义tree-table设置和获取数据的源
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          //表示 将当前列定义为模板列
          type: 'template',
          //表示当前这一列使用的模板名称
          template: 'isOk',
        },
        {
          label: '排序',
          //表示 将当前列定义为模板列
          type: 'template',
          //表示当前这一列使用的模板名称
          template: 'order',
        },
        {
          label: '操作',
          //表示 将当前列定义为模板列
          type: 'template',
          //表示当前这一列使用的模板名称
          template: 'opt',
        },
      ],
      //控制添加对话框的显示与隐藏
      addCateDialogVisible: false,
      //添加分类的表单数据对象
      addCateForm: {
        //将要添加的分类名称
        cat_name: '',
        //父级分类的id
        cat_pid: 0,
        //分类的等级，默认要添加的是一级分类
        cat_level: 0,
      },
      //添加的表单验证规则对象
      addCateFormrules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },
      //添加弹出框内的父级分类列表
      parentCateList: [],
      //储存级联选择器选中的内容(选中的父级分类的id数组)
      selectedkeys: [],
      //指定级联选择器的配置对象
      cascaderProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
      },
      //控制编辑对话框的显示与隐藏
      editCateDialogVisible: false,
      //当前行所对应的Id
      cateId:''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$axios.get('categories', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取商品分类列表失败')
      //console.log('请求到的数据', res)
      this.cateList = res.data.result
      this.total = res.data.total
    },
    //监听pagesize（每页条数） 改变的事件
    handleSizeChange(newSzie) {
      //console.log("每页条数改变为",newSzie)
      this.queryInfo.pagesize = newSzie //当监听到每页条数发生改变时应将目前的条数赋值给queryInfo.pagesize
      this.getCateList() //重新发送请求使页面数据更新
    },
    //监听页码值改变的事件
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage //当监听到页数发生改变时应将当前的页数赋值给queryInfo.newPage
      this.getCateList() //重新发送请求使页面数据更新
    },
    //点击弹出添加分类的对话框
    showaddCateDialog() {
      this.addCateDialogVisible = true
      //获取父级分类的数据列表
      this.getParentCateList()
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$axios.get('categories', {
        params: { type: 2 },
      })
      //console.log("请求到的父级分类的数据列表",res)
      if (res.meta.status !== 200) {
        return this.$mwssage.error('获取父级分类数据失败')
      }
      this.parentCateList = res.data
      //console.log(this.parentCateList)
    },
    //选择项发生变化所触发的函数
    parentCateChanged() {
      //由于级联选择器的v-model绑定的值为selectedkeys，那么当你的级联选择器发生变化的时候，这个selectedkeys数组也会跟着变化
      console.log('级联选择器双向绑定的数组:', this.selectedkeys)
      //本项目这里要实现的是添加分类时上面的“分类名称必须写”,下面的级联选择器如果不选，就会默认他为父级，如果只选了父级那我们添加的分类名称
      //就会变成子级,如果选中的是父级-子级的话，就会变成第三级。在你选择后会通过双向绑定会将选中的值，储存在this.selectedkeys这个数组里，数组的第一项
      //代表父级，第二项代表子级。如[1,3] ---这里1为父级，3为子级 ---如果时这样的数组的话代表我们添加的这个分类是要放在3这个子级之下的第三级。

      //根据本项目接口传参的规定，我们要传父分类的id，如果不传，就默认为0默认你要添加的分类为父级分类。那么我们上面定义的addCateForm里已将cat_pid
      //默认写为了0.在这里呢，我们需要做个判断
      if (this.selectedkeys.length > 0) {
        //如果双向绑定的这个数组的长度大于0，代表你已经至少选择了一级
        //长度大于0的话，我们的数组可能时[1]也可能选择了两级[1,3],我们只要最后一级的id给接口传过去，所以要用它的长度减去1.因为数组下标是从0开始
        //而长度是从1开始，让长度减一，这样就可以确定数组的最后一项的值。然后将这个值赋值给我们马上给添加分类接口传递的参数中（参数是addCateForm是个数组）
        this.addCateForm.cat_pid =
          this.selectedkeys[this.selectedkeys.length - 1]

        //接口另外一个要传递的参数为等级也就是level，接口文档强调，0为父级，1为子级，2为最小级（第三级）,那么这个值岂不是正好与this.selectedkeys.length
        //的长度一样吗。我们可以直接操作
        this.addCateForm.cat_level = this.selectedkeys.length
      } else {
        //如果这个this.selectedkeys的长度为0，代表用户什么等级都没选，那我们直接默认就行。没必要在写else这里只是为了方便看
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    //点击添加分类对话框的确定按钮
    addCate() {
      //console.log("要给添加分类接口传递的数据:",this.addCateForm)
      this.$refs.addCateFormRef.validate((valid) => {
        if (!valid) return this.$message.error('输入的信息不合法，请重新输入')
        // 验证无误，发起请求
        this.$axios
          .post('categories', this.addCateForm)
          .then((res) => {
            console.log(res)
            if (res.data.meta.status !== 201)
              return this.$message.error('创建商品分类失败')
            //重新渲染列表数据
            this.getCateList()
            //提示成功消息
            this.$message.success('创建商品分类成功')
            //关闭添加的对话框
            this.addCateDialogVisible = false
          })
          .catch((err) => {
            this.$message.error('错误信息', err)
          })
      })
    },
    //添加分类弹框关闭后触发的事件
    addCateDialogClose() {
      //清空表单
      this.$refs.addCateFormRef.resetFields()
      //清空表单内的级联选择器的内容,清空这个能够清空级联选择器的用户界面上的内容
      this.selectedkeys = []
      //这里还要将给接口传递的参数（this.addCateForm）也重置为0，因为当用户选择了级联选择器中的等级后，因为发生了变化所以
      //会触发级联选择器的函数（parentCateChanged），在函数中this.addCateForm的值被修改了。这时用户不点确定反而退出了，在进来时时
      //虽然用户界面空空的。但此时它如果只写了分类名称，不选级联选择器中的内容（想直接添加父级），这时就会出错，因为this.addCateForm里的
      //cat_pid和cat_level都还是第一次的样子，因为用户不点级联选择器，所以它也不会触发函数让this.addCateForm重新赋值。
      //为了不出错，我们要在关闭的时候将this.addCateForm也清空
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      //this.addCateForm.cat_name不需要，因为在清空表单的时候已经清空掉了。
    },
    //点击编辑对话框触发的事件
    showEditCate(row) {
      console.log('当前行的数据', row ,"addCateForm",this.addCateForm)
      //给弹框内的input框赋值
      this.addCateForm.cat_name = row.cat_name
      //将当前行的id赋值出去
      this.cateId = row.cat_id
      //打开弹框
      this.editCateDialogVisible = true  
    },
    //关闭编辑弹框后重置表单
    editCateDialogClose() {
      this.$refs.editruleFormRef.resetFields()
    },
    //点击编辑弹框的确定按钮触发的事件
    editCate() {
      this.$refs.editruleFormRef.validate(async valid =>{
        if(!valid) return this.$message.error('输入的信息不合法,请重新输入')
        let params = {
          cat_name:this.addCateForm.cat_name
          }
        const {data:res} = await this.$axios.put('categories/'+this.cateId,params)
        console.log('请求到的数据',res)
        if(res.meta.status !== 200) return this.$message.error('更新分类失败')
        this.$message.success('更新分类成功')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    //点击删除按钮触发的事件
    deleteCate(row) {
      console.log("当前行数据",row)
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          const {data:res} = await this.$axios.delete(`categories/${row.cat_id}`)
          if(res.meta.status !== 200) return this.$message.error('删除分类失败')
          this.$message({type: 'success',message: '删除分类成功!'});
          this.getCateList()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
    }
  },
}
</script>
<style lang="less" scoped>
.zk-table {
  margin-top: 15px;
  margin-bottom: 15px;
  max-height: 415px;
  overflow: auto;
}
.el-cascader {
  width: 100%;
}
</style>
