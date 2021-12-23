<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <!-- 搜索区域 使用layout布局 -->
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList()"
            ></el-button>
          </el-input>
        </el-col>
        <!-- 添加区域 使用layout布局 -->
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" stripe border max-height="445px">
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <!-- 作用域插槽 作用就是拿到当前这一整行的数据 -->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStatusChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 底部分页区域 -->
      <!-- @size-change:绑定监听pagesize（每页条数） 改变的事件 -->
      <!-- @current-change:绑定监听页码值改变的事件 -->
      <!-- current-page:它的值是填当前页数，那么最初要写为1 -->
      <!-- page-sizes:它的意思为让你自定义一个选择每页为多少条的数组，如[1,5,10,15] -->
      <!-- page-size:它的意思是当前每页显示多少条数据 -->
      <!-- layout 里面是分页的一些功能模块，它是一个字符串并已逗号隔开 -->
      <!-- :total: 它代表总条数 -->
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
      <!-- 添加用户的对话框 -->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
      >
        <!-- 对话框内容主体区域 -->
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="70px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户的对话框 -->
      <el-dialog
        title="修改用户信息"
        :visible.sync="EditDialogVisible"
        width="50%"
        @close="editDialogClose"
      >
        <!-- 修改用户的表单 -->
        <!-- 这里需要验证邮箱和手机号，直接用添加用户时用到的验证规则即可 -->
        <el-form
          :model="editForm"
          :rules="addFormRules"
          ref="EditFormRef"
          label-width="70px"
        >
          <!-- 用户名 -->
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" :disabled="true"></el-input>
          </el-form-item>
          <!-- 邮箱 -->
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <!-- 手机号 -->
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="EditDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色的对话框 -->
      <el-dialog
        title="分配角色"
        :visible.sync="setRoleDialogVisible"
        width="50%"
        @close="RoleDialogclose"
      >
        <!-- 主体内容区域 -->
        <div>
          <el-alert title="不允许修改admin账户" type="warning" show-icon v-if="this.userInfo.id == '500'" :closable="false"> </el-alert>
          <p>当前的用户： {{ this.userInfo.username }}</p>
          <p>当前的角色： {{ this.userInfo.role_name }}</p>
          <p>
            <span>分配新的角色：</span>
            <!-- 下拉菜单 -->
            <el-select
              v-model="selectedRoleId"
              placeholder="请选择角色"
              :disabled="this.userInfo.id == '500' ? true : false"
            >
              <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="seveRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    //自定义验证邮箱的规则
    //首先var一个变量接受一个函数，此函数有三个参数，分别是rule验证规则对象（基本用不上）,value待验证的值（也就是用户输入的值）,
    //callback回调函数,之后用变量或常量接收一个正则表达式进行判断。具体如下代码所示。
    //需要注意的是这里完成后需要在对应的验证规则里添加一个对象，对象里的validator键对应的键值为var出来的变量(如：checkEmail)
    var checkEmail = (rule, value, callback) => {
      //console.log('rule:',rule,'value:',value)
      const regEamil = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEamil.test(value)) {
        // 直接调用callback回调函数表示邮箱为合法
        return callback()
      }
      callback(new Error('请输入合法邮箱'))
    }
    //自定义验证手机号的规则
    var checkMobile = (rule, value, callback) => {
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        // 直接调用callback回调函数表示手机号为合法
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }
    return {
      //获取用户列表的参数对象
      queryInfo: {
        query: '', //查询的内容
        pagenum: 1, //当前页数
        pagesize: 5, //当前每页显示多少条数据
      },
      //用户列表数据
      userlist: [],
      total: 0, //总条数
      pageSizes: [5, 10, 15, 20], //选择每页为多少条的数组
      addDialogVisible: false, //控制添加用户的对话框显示与隐藏
      EditDialogVisible: false, //控制修改用户的对话框显示与隐藏
      //添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      //修改用户信息（查询到的用户信息并存储的数据）
      editForm: {},
      //添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名长度在3~10个字符间',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '密码长度在6~15个字符间',
            trigger: 'blur',
          },
        ],
        email: [
          { required: true, message: '请输入您的邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入您的手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      //控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      //需要被分配角色的用户信息
      userInfo: {},
      //所有角色的数据列表
      rolesList: [],
      //已选中的角色Id值
      selectedRoleId: '',
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$axios.get('users', {
        params: this.queryInfo,
      })
      //console.log('请求到的用户列表数据', res)
      if (res.meta.status !== 200)
        return this.$message.error('获取用户列表信息失败')
      this.userlist = res.data.users
      //console.log(this.userlist)
      this.total = res.data.total
    },
    //监听pagesize（每页条数） 改变的事件
    handleSizeChange(newSzie) {
      //console.log("每页条数改变为",newSzie)
      this.queryInfo.pagesize = newSzie //当监听到每页条数发生改变时应将目前的条数赋值给queryInfo.pagesize
      this.getUserList() //重新发送请求使页面数据更新
    },
    //监听页码值改变的事件
    handleCurrentChange(newPage) {
      //console.log("当前页码值为",newPage)
      this.queryInfo.pagenum = newPage //当监听到页数发生改变时应将当前的页数赋值给queryInfo.newPage
      this.getUserList() //重新发送请求使页面数据更新
    },
    async userStatusChanged(userInfo) {
      //console.log("当前行的数据",userInfo)
      const { data: res } = await this.$axios.put(
        'users/' + userInfo.id + '/state/' + userInfo.mg_state
      )
      //反引号的写法为 const {data:res} = await this.$axios.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更改用户状态失败')
      }
      this.$message.success('更改用户状态成功')
    },
    //监听添加用户对话框的关闭事件
    addDialogClosed() {
      //重置表单  详细分析见login组件
      console.log('this', this)
      this.$refs.addFormRef.resetFields()
    },
    //点击添加用户的确定按钮
    addUser() {
      //对表单进行与验证，详解见login组件
      this.$refs.addFormRef.validate(async (valid, notPass) => {
        console.log('是否校验成功:', valid, '未通过校验的字段:', notPass)
        if (!valid) return this.$message.error('输入的信息不正确，请重新输入')
        //发起添加用户的请求
        const { data: res } = await this.$axios.post('users', this.addForm)
        //console.log("请求到的数据",res)
        if (res.meta.status !== 201)
          return this.$message.error('添加用户失败' + res.meta.msg)
        this.$message.success('添加用户成功')
        //隐藏添加用户的对话框
        this.addDialogVisible = false
        //刷新用户列表
        this.getUserList()
      })
    },
    //展示编辑用户的对话框
    async showEditDialog(id) {
      //点击修改按钮打开修改对话框
      this.EditDialogVisible = true
      //使用当前行id，发起请求，请求当前行的数据
      const { data: res } = await this.$axios.get('users/' + id)
      //console.log("请求到的数据",res)
      if (res.meta.status !== 200)
        return this.$message.error('查询用户信息失败')
      this.editForm = res.data
      //console.log("editForm",this.editForm)
    },
    //监听修改用户对话框的关闭事件
    editDialogClose() {
      //console.log("this",this)
      this.$refs.EditFormRef.resetFields()
    },
    //修改用户信息并提交(确定按钮)
    editUserInfo() {
      //首先需要进行预验证
      this.$refs.EditFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('用户信息不合法请重新输入')
        let params = {
          email: this.editForm.email,
          mobile: this.editForm.mobile,
        }
        const { data: res } = await this.$axios.put(
          'users/' + this.editForm.id,
          params
        )
        //console.log("编辑用户提交请求到的数据",res)
        if (res.meta.status !== 200)
          return this.$message.error('更新用户信息失败')
        //关闭对话框
        this.EditDialogVisible = false
        //刷新数据列表
        this.getUserList()
        //提示修改成功
        this.$message.success('更新用户信息成功')
      })
    },
    //点击删除按钮根据用户Id删除对应的用户信息（另一种写法在下面）
    removeUserById(id) {
      //弹框询问用户是否删除数据
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$axios.delete('users/' + id)
          //console.log('res', res)
          if (res.meta.status !== 200)
            return this.$message.error('删除用户失败')
          this.$message({ type: 'success', message: '删除用户成功!' })
          //刷新用户数据列表
          this.getUserList()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    // //删除的另一种写法
    // async removeUserById(id) {
    //   //弹框询问用户是否删除数据
    //   //这里之所以用到了async await 是因为使用this.$confirm后会返回一个promise对象
    //   //使用任何方法后，只要返回值为promise都可以使用async await 来简化promise操作
    //   //因为使用了async await 后this.$confirm的返回值就会变成一个字符串。
    //   const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning',
    //   }).catch(err => err)
    //   //.catch这里，简化前应该是.catch(err => { return err}),此操作的意思为，如果选择取消，那么要将取消后的错误暴露（return）出来
    //   //如果不暴露出来控制台便会报错。上面的写法理解为，如果{}只有return的一行代码那么就可以省略return 和 {}。

    //   console.log(confirmResult)
    //   //如果用户确认删除，则返回值为字符串 confirm
    //   //如果用户取消了删除，则返回值为字符串 cancel

    //   //接下来便可通过判断来确定后续操作了
    //   if(confirmResult !== "confirm") return this.message.info("已取消删除")
    //   const {data:res} = await this.$axios.delete("users/"+id)
    //   //console.log("res",res)
    //   if(res.meta.status !== 200) return this.$message.error('删除用户失败')
    //   this.$message({ type: 'success',message: '删除用户成功!',})
    //   //刷新用户列表数据
    //   this.getUserList()
    // }

    //点击分配角色按钮触发的事件
    setRole(row) {
      //让弹框打开
      this.setRoleDialogVisible = true
      //将当前行的信息赋值
      this.userInfo = row
      //console.log('当前行的数据:', row)
      //请求所有角色的数据列表
      this.$axios
        .get('roles')
        .then((res) => {
          if (res.data.meta.status !== 200)
            return this.message.error('获取角色数据列表失败')
          this.rolesList = res.data.data
          //console.log('所有角色的数据列表:', this.rolesList)
        })
        .catch((err) => {
          console.log(err)
          return this.$message.error(err)
        })
    },
    //点击分配角色弹出框的确定按钮所触发的事件
    async seveRoleInfo() {
      // 如果用户什么角色都未选就点了确定
      if (this.selectedRoleId == '') {
        return this.$message.error('请选择您要分配的角色')
      }
      //发起数据请求
      let params = {
        rid: this.selectedRoleId,
      }
      const { data: res } = await this.$axios.put(
        'users/' + this.userInfo.id + '/role',
        params
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      //成功后的提示
      this.$message.success(res.meta.msg)
      //刷新用户列表
      this.getUserList()
      //关闭分配角色对话框
      this.setRoleDialogVisible = false
    },
    //手动关闭分配角色弹出框所触发的事件
    RoleDialogclose() {
      this.selectedRoleId = ''
    },
  },
}
</script>
<style lang="less" scoped>
</style>
