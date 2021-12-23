<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <div>
        <el-button type="primary" @click="addRoleDialogVisible = true"
          >添加角色</el-button
        >
      </div>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe max-height="448px">
        <!-- 索引列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 首先通过el-row 在加两个el-col将布局变成两部分，第一部分是一级权限，第二部分放剩余的二，三级权限 -->
            <el-row
              :class="['dbbottom', index1 === 0 ? 'dbtop' : '', 'vcenter']"
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级，三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 渲染二级权限 在第二部分在分出两个el-col -->
                <el-row
                  :class="[index2 === 0 ? '' : 'dbtop', 'vcenter']"
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 通过for循环渲染三级权限 -->
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 展开列 -->
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"  width="350"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述" width="350"></el-table-column>
        <el-table-column label="操作" width="396">
          <template slot-scope="scope">
            <!--编辑按钮 -->
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <!-- 删除按钮 -->
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRolesById(scope.row.id)"
              >删除</el-button
            >
            <!-- 分配权限按钮 -->
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色的弹框 -->
      <el-dialog
        title="添加角色"
        :visible.sync="addRoleDialogVisible"
        width="50%"
        @close="addDialogClose"
      >
        <!-- 弹框表单区域 -->
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="80px"
        >
          <!-- 表单验证这里需要着重注意一点，那就是prop里的值要和v-model里的值名称一摸一样，不然会出错 -->
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer">
          <el-button @click="addRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改角色信息的弹框 -->
      <el-dialog
        title="编辑角色信息"
        :visible.sync="EditDialogVisible"
        width="50%"
        @close="editDialogClose"
      >
        <!-- 弹框表单区域 -->
        <el-form
          :model="editForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="80px"
        >
          <!-- 表单验证这里需要着重注意一点，那就是prop里的值要和v-model里的值名称一摸一样，不然会出错 -->
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="EditDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配权限的弹框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%"
      >
        <!-- 树形控件  data代表绑定的数据源, props接收一个对象(表明要展示时的规则)-->
        <!-- show-checkbox代表前面的复选框, node-key="id"给每一个节点都绑定一个唯一的id值-->
        <el-tree
          :data="rightsList"
          :props="treeProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defKeys"
          ref="treeRef"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //表格内容的数组
      roleList: [],
      addRoleDialogVisible: false, //控制添加角色的弹框隐藏与显示
      //添加角色用到的对象
      addForm: {
        roleName: '',
        roleDesc: '',
      },
      //添加角色的表单验证对象
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '角色名称长度在3~10个字符间',
            trigger: 'blur',
          },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { max: 15, message: '角色描述长度在3~15个字符间', trigger: 'blur' },
        ],
      },
      //控制编辑角色信息弹框的隐藏与显示
      EditDialogVisible: false,
      //修改界面通过查询得到的当前行用户信息
      editForm: {},
      //控制分配权限的弹框显示与隐藏
      setRightDialogVisible: false,
      //所有权限的数据
      rightsList: [],
      //树形控件展示规则对象(属性绑定对象)
      treeProps: {
        children: 'children', //实现父子嵌套用的是数据源里的哪个字段
        label: 'authName', //树形空间展示的文本是数据源里的哪个字段
      },
      //树形控件，默认选中的节点id值数组
      defKeys: [],
      //动态接收当前行的id
      rowID:''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$axios.get('roles')
      if (res.meta.status !== 200)
        return this.$message.error('获取角色列表失败')
      this.roleList = res.data
      //console.log('请求后赋值到this.roleList的数据', res)
    },
    //监听添加角色对话框的关闭事件
    addDialogClose() {
      //console.log("this",this)
      //重置表单的操作
      this.$refs.addFormRef.resetFields()
    },
    //点击添加角色对话框内的确定按钮
    addRoleInfo() {
      //首先要对表单进行预验证
      this.$refs.addFormRef.validate(async (valid) => {
        //console.log('valid',valid)
        if (!valid) return this.$message.error('填写的内容不合法，请您重新填写')
        const { data: res } = await this.$axios.post('roles', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        //console.log('请求到的数据:',res)
        this.$message.success('添加角色成功')
        //重新刷新列表
        this.getRolesList()
        //关闭对话框
        this.addRoleDialogVisible = false
      })
    },
    //监听修改角色信息对话框的关闭事件
    editDialogClose() {
      //console.log("this",this)
      //重置表单的操作
      this.$refs.addFormRef.resetFields()
    },
    //点击编辑按钮触发的事件
    async showEditDialog(id) {
      //打开弹窗
      this.EditDialogVisible = true
      //发起数据请求
      const { data: res } = await this.$axios.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询当前用户信息失败')
      }
      console.log('请求到的数据', res)
      this.editForm = res.data
    },
    //点击编辑角色对话框内的确定按钮
    editRoleInfo() {
      this.$refs.addFormRef.validate(async (valid) => {
        //console.log("valid",valid)
        if (!valid) return this.$message.error('您输入的信息不合法,请重新输入')
        let params = {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc,
        }
        const { data: res } = await this.$axios.put(
          'roles/' + this.editForm.roleId,
          params
        )
        //console.log("请求到的数据",res)
        if (res.meta.status !== 200)
          return this.$message.error('修改角色信息失败')
        //刷新列表
        this.getRolesList()
        //隐藏对话框
        this.EditDialogVisible = false
      })
    },
    //点击删除按钮触发的事件
    removeRolesById(id) {
      // 这里返回一个promise，我们可以调用.then方法和.cath方法
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$axios.delete('roles/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error('删除角色失败')
          }
          //成功提示消息
          this.$message({ type: 'success', message: '删除角色成功!' })
          //刷新列表
          this.getRolesList()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    //根据ID删除tag标签对应的权限
    removeRightById(role, rightId) {
      console.log('当前行数据', role, '角色ID:', role.id, '权限ID:', rightId)
      //弹框提示用户是否删除
      this.$confirm('此操作将永久删除该权限变迁, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$axios.delete(
            'roles/' + role.id + '/rights/' + rightId
          )
          //console.log("删除后请求到的数据:",res)
          if (res.meta.status !== 200)
            return this.$message.error('删除权限失败')
          console.log('删除后返回的数据', res)
          //刷新数据列表 this.getRolesList()
          //这里不建议这样做，因为直接刷新整个列表的话，扩展列会自动合起来，这样对用户的体验不好
          //那么正好删除后返回的数据，是当下角色最新的数据，我们可以直接将这个数据赋值给当前行的children（角色数据）
          role.children = res.data
          //提示删除成功
          this.$message({ type: 'success', message: '删除权限成功!' })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    //点击分配权限按钮
    showSetRightDialog(row) {
      this.setRightDialogVisible = true
      //请求数据的另外一种形式，因为axios的返回值是promise，那么可以通过调用它的.then()方法，.then（）方法的第一个返回值就是请求到（并经过axios包装过的）的数据
      this.$axios
        .get('rights/tree')
        .then((res) => {
          if (res.data.meta.status !== 200) return this.$message.error('获取权限数据失败')
          this.rightsList = res.data.data
          //console.log('所有权限的数据:', this.rightsList)
          console.log("当前行数据",row)

          //这种三层循环太low了，还有另外一种高大上的方法（递归）
          // this.defKeys = [] //为防止放生叠加，先清空数组
          // row.children.forEach((item1) => {
          //   item1.children.forEach((item2) => {
          //     item2.children.forEach((item3) => {
          //       this.defKeys.push(item3.id)
          //     })
          //   })
          // })
          // console.log("this.defKeys",this.defKeys)

          //调用自己写好的递归函数来处理树形控件的默认展示
          this.defKeys = [] //为防止发生叠加，先清空数组
          this.getLeafkeys(row,this.defKeys)

          //给当前行的id赋值出去，之后用
          this.rowID = row.id
        })
        .catch((err) => {
          console.log('查看错误原因', err)
        })
    },
    // 递归函数 通过递归的形式，获取角色的下所有三级权限的id，并保存到defKeys数组中
    getLeafkeys(node,arr){
      //如果当前node节点不包含children字段，则为三级节点
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafkeys(item,arr)
      });
    },
    //点击分配权限弹框内的确定按钮触发的事件
    async allotRights() {
      //通过this.$refs.treeRef 实例可以调用两个方法
      //getCheckedKeys()拿到所有全选中的节点id,getHalfCheckedKeys()拿到所有半选中的节点id
      //console.log(...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys())
      //console.log(this.$refs.treeRef.getCheckedKeys(),this.$refs.treeRef.getHalfCheckedKeys())

      //请求时要求把所有取到的id放入一个字符串里，有两种方法个人觉得第一种简单一些

      //第一种直接将两个数组拼接中间以逗号间隔
      const idStr = this.$refs.treeRef.getCheckedKeys()+","+this.$refs.treeRef.getHalfCheckedKeys()
      //console.log(idStr,typeof idStr)

      //第二种方法
      // const keys = [...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys()]
      // console.log(keys)
      // const idStr = keys.join(",")
      //console.log(idStr, typeof idStr)
      

      //发起请求
      //console.log(this.rowID)
      const {data:res} = await this.$axios.post('roles/'+this.rowID+'/rights',{rids:idStr})
      //console.log("请求后响应的数据",res)
      if(res.meta.status !== 200) return this.$message.error('更新角色权限失败')
      this.$message.success('更新角色权限成功')
      //刷新列表
      this.getRolesList()
      //关闭对话框
      this.setRightDialogVisible = false
      
    }
  },
}
</script>
<style lang="less" scoped>
.el-row {
  margin-left: 45px;
}
.el-tag {
  margin: 7px;
}
.dbtop {
  border-top: 1px solid #eee;
}
.dbbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>