<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="只允许为第三级分类设置相关参数"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 选择商品分类区域 -->
      <div class="cat_opt">
        <span>选择商品分类：</span>
        <!-- 级联选择框 -->
        <el-cascader
          expand-trigger="hover"
          :options="cateList"
          :props="cateProps"
          v-model="selectedCatekeys"
          @change="handleChange"
          clearable
        >
        </el-cascader>
      </div>
      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!--添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!--添加参数的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 表格区域 -->
          <el-table
            :data="manyTableData"
            style="width: 100%"
            border
            :stripe="true"
            max-height="300px"
          >
            <!-- 展开行 -->
            <el-table-column type="expand" width="50">
              <template slot-scope="scope">
                <!-- tag标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(scope.row,index)"
                >
                  {{ item }}
                </el-tag>
                <!-- tag和input的切换区域 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="序号" width="50">
            </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                  >修改</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!--添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!--添加属性的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 表格区域 -->
          <el-table
            :data="onlyTableData"
            style="width: 100%"
            border
            :stripe="true"
            max-height="300px"
          >
            <!-- 展开行 -->
            <el-table-column type="expand" width="50">
              <template slot-scope="scope">
                <!-- tag标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(scope.row, index)"
                >
                  {{ item }}
                </el-tag>
                <!-- tag和input的切换区域 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @blur="handleInputConfirm(scope.row)"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" width="50">
            </el-table-column>
            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row)"
                  >修改</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 动态参数和静态属性绑定的添加对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <!-- 添加数据的表单 -->
      <el-form
        :model="addForm"
        :rules="addFormrules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 动态参数和静态属性绑定的修改对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <!-- 添加数据的表单 -->
      <el-form
        :model="editForm"
        :rules="editFormrules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //获取到的全部的数据
      cateList: [],
      //级联选择框得配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      //级联选择框双向绑定到的数组
      selectedCatekeys: [],
      //被激活的页签的名称
      activeName: 'many', //选择谁就默认谁为高亮
      //获取到的动态参数
      manyTableData: [],
      //获取到的静态数据
      onlyTableData: [],
      //控制添加对话框的显示与隐藏
      addDialogVisible: false,
      //添加参数的表单数据对象
      addForm: {
        attr_name: '',
      },
      //添加参数的表单验证规则对象
      addFormrules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 3 到 5 个字符', trigger: 'blur' },
        ],
      },
      //控制修改对话框的显示与隐藏
      editDialogVisible: false,
      //添加参数的表单数据对象
      editForm: {
        attr_name: '',
      },
      //添加参数的表单验证规则对象
      editFormrules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 3 到 5 个字符', trigger: 'blur' },
        ],
      },
      //tag开关标记
      tagSwitch: false,
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$axios.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据列表失败')
      }
      this.cateList = res.data
      //console.log('获取到的分类数据列表的数据:', this.cateList)
    },
    //级联选择框选中项变化，会触发的函数
    handleChange() {
      //console.log('级联选择框双向绑定到的数组:', this.selectedCatekeys)
      this.getParamsData()
    },
    //tag页签的点击事件处理函数
    handleTabClick() {
      //console.log('当前绑定的页签是:', this.activeName)
      this.getParamsData()
    },
    //获取参数的数据列表
    async getParamsData() {
      if (this.selectedCatekeys.length !== 3) {
        this.selectedCatekeys = []
        this.manyTableData = []
        this.onlyTableData = []
      } else {
        //如果选中的是第三级那么就发起数据请求
        let params = { sel: this.activeName }
        const { data: res } = await this.$axios.get(
          'categories/' + this.cateId + '/attributes',
          { params }
        )
        if (res.meta.status !== 200) return this.$message.error('获取数据失败')
        //console.log('请求到的数据:', res.data)
        //将res.data中的attr_vals处理成数组
        res.data.forEach((item) => {
          item.attr_vals == ''
            ? []
            : (item.attr_vals = item.attr_vals.split(' '))
          //添加控制tag和input的切换 在循环一个数组的时候，是可以直接在循环体里给每一项（对象）增加一个键名并赋于相应的键值的。
          ;(item.inputVisible = false),
            //添加input双向绑定的值
            (item.inputValue = '')
        })
        //console.log('请求到的数据处理后的样子', res.data)
        //判断this.activeName的值，来确定获取到的数据为动态参数还是静态属性
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      }
    },
    //表单关闭时触发的事件
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    //点击添加参数对话框中的确定按钮所触发的事件
    addParams() {
      //进行预验证
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('输入的信息不合法请重新输入')
        let params = {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName,
        }
        const { data: res } = await this.$axios.post(
          `categories/${this.cateId}/attributes`,
          params
        )
        //console.log('请求到的数据', res)
        if (res.meta.status !== 201) return this.$message.error('添加参数失败!')
        this.$message.success('添加参数成功!')
        this.getParamsData()
        this.addDialogVisible = false
      })
    },
    //点击表格内的修改按钮所触发的事件
    async showEditDialog(row) {
      this.editDialogVisible = true
      const { data: res } = await this.$axios.get(
        'categories/' + this.cateId + '/attributes/' + row.attr_id,
        { attr_sel: this.activeName }
      )
      //console.log('请求到的数据', res)
      if (res.meta.status !== 200)
        return this.$message.error('获取当前行数据失败')
      this.editForm = res.data
    },
    //关闭修改对话框所触发的事件
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    //点击修改对话框的确定按钮所触发的事件
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('输入的信息不合法，请重新输入')
        let params = {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName,
        }
        const { data: res } = await this.$axios.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          params
        )
        //console.log('请求到的数据', res)
        if (res.meta.status !== 200) return this.$messge.error('更新数据失败')
        this.$message.success('更新参数成功')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    //点击删除按触发的事件
    removeParams(row) {
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$axios.delete(
            `categories/${this.cateId}/attributes/${row.attr_id}`
          )
          //console.log('接口响应的数据', res)
          if (res.meta.status !== 200)
            return this.$message.error('删除参数失败')
          this.$message({ type: 'success', message: '删除参数成功!' })
          this.getParamsData()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },

    //input框输入时，按下回车（Enter）键，或失去焦点时触发
    handleInputConfirm(row) {
      //先将tag开关标记致为true
      this.tagSwitch = true
      //可以通过作用域插槽取到当前行信息，并且直接在当前行的某个元素绑定的事件上，直接操作当前行数据,发生的变化也会更新到元素上。
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //如果没有return 就执行后面的代码
      //将当前input框双向绑定的值push到当前渲染出tag标签的数组中，这样就会将input输入的值，变成
      //tag标签，再次渲染到展开行内。
      if (row.attr_vals == '') {
        row.attr_vals = []
      }
      row.attr_vals.push(row.inputValue.trim())
      //push到数组中之后该值已经没什么用了，可以直接给他置空
      row.inputValue = ''
      //将input框隐藏，button按钮出现
      row.inputVisible = false

      //发起请求将本次操作保存到数据库中，从而使页面发生变化
      this.saveAttrVals(row)
    },

    //删除tag页签的操作
    handleClose(row, i) {
      //先将tag开关标记置为false
      this.tagSwitch = false
      //根据当前选中的tag的下标，删除row.attr_vals数组中对应的一项
      row.attr_vals.splice(i, 1)
      //发起请求将本次操作保存到数据库中，从而使页面发生变化
      this.saveAttrVals(row)
    },
    //发起修改请求的函数
    async saveAttrVals(row) {
      //发起请求将本次操作保存到数据库中
      let params = {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        //需要将row.attr_vals变为之前的样子（从数组变回字符串用空格隔开）
        attr_vals: row.attr_vals.join(' '),
      }
      const { data: res } = await this.$axios.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        params
      )
      //console.log("res",res)
      if (res.meta.status !== 200) {
        if (this.tagSwitch == false) {
          return this.$message.error('删除参数项失败！')
        } else {
          return this.$message.error('添加参数项失败！')
        }
      }
      //如果等于200，那么提示成功信息
      if (this.tagSwitch == false) {
        return this.$message.success('删除参数项成功！')
      } else {
        return this.$message.success('添加参数项成功！')
      }
    },
    //点击添加tag（el-button）标签触发的事件
    showInput(row) {
      row.inputVisible = true
      //这里涉及到一个问题，当点击了tag标签触发了当前这个函数的时候，函数的第一行代码是让控制tag和input谁显示的那个值发生变化
      //这里把inputVisible设置为true，代表当点击tag（el-button）标签时让自己消失，让input渲染出来。那么，下面代码里的this.$refs.saveTagInput.$refs.input.focus()
      //正是要让input渲染出来的同时，让其获取焦点。此时如果直接写下面的代码一定会报错，因为浏览器这个时候根本找不到input这个元素。为什么会这样呢？
      //因为在浏览器解析代码的时候是从上到下，从左到右一次检测的。刚打开页面的时候，元素已经被加载了出来。当前位置按照我们的编写，加载出来的是tag（el-button）标签
      //那么，当我们点击这个tag触发了showInput事件,便开始解析我们这个函数里的第一行代码，第一行代码虽然已将inputVisible做了修改，但dom还没有开始回流更新（重新渲染）,
      //而浏览器会忽略这一点，接着继续解析我们这个函数中的第二行代码，这时因为input框还没有被渲染出来，浏览器根本不认识谁我们下面引用的实例（saveTagInput），所以会报错。
      //要解决 这个问题还很简单，就是使用this.$nextTick,这个家伙的作用就是告诉浏览器:"你她奶奶的dom马上要更新了,你先不用解析我屋子里的代码，等会儿，等到dom更新完你在过来，dom
      //更新完马上来我屋子里解析哦！要不然弄死你”，浏览器回复：“好的，哥”。等到浏览器又逛了一圈dom之后，回来this.nextTick这里，一进屋子里看到了this.$refs.saveTagInput.$refs.input.focus()
      //马上就认出了它，然后也看明白了它的需求，它要让input获取到焦点。浏览器也欣然同意。这时我们就可以看到点击tag以后tag隐藏，input渲染了出来并且input还直接获取到了焦点。
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
  },
  //计算属性定义的区域
  computed: {
    //计算属性里的方法都可以当作是data里的一个值，直接用在元素结构上。
    isBtnDisabled() {
      if (this.selectedCatekeys.length !== 3) {
        return true
      }
      return false
    },
    cateId() {
      if (this.selectedCatekeys.length !== 3) {
        return null
      }
      return this.selectedCatekeys[2]
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },
  },
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
  margin: 10px;
}
</style>
