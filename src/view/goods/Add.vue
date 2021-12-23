<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="test-1">
      <!-- 提示区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条区域 -->
      <!-- active表示当前选中并高亮的是那个步骤 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <!-- 因为所有的tab要公用一个表单，但el-tabs的下一级只允许嵌套el-tab-pane，所以要在它们的外侧套一层表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-position="top"
      >
        <!-- v-model绑定的值于子元素的name对应上的话，就展示当前的子元素  :tab-position="'left'"和  tab-position="left"效果一样-->
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="0">
            <!-- 商品名称 -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <!-- 商品价格 -->
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <!-- 商品重量 -->
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <!-- 商品数量 -->
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <!-- 商品分类 -->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                :options="cateList"
                :props="cateProps"
                v-model="addForm.goods_cat"
                @change="handleChange"
                :clearable="true"
              >
              </el-cascader>
            </el-form-item>
          </el-tab-pane>

          <!-- 商品参数  -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableDate"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="eoc"
                  v-for="(eoc, index) in item.attr_vals"
                  :key="index"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <!-- 商品参数  -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableDate"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <!-- 商品图片 -->
          <el-tab-pane label="商品图片" name="3">
            <!-- elementuid的Upload组件的使用
            各属性的作用解释: 
            action-----表示图片要上传到的后台的Api地址（疑问从这里而来，不会用Upload组件，也是从这里开始懵逼的，我一直在想这要从那里发送请求）实际上
                       此组件封装了ajax请求，我们只需要把action字段的值写为要上传到的后台Api地址就行，它会自动上传。至于Api地址是什么那就得问问你们
                       公司得后台人员了。这里用到的是mian.js文件中写好的地址（因为一直使用axios发请求，所以请求地址干脆写在了mian.js中）在加上接口文档
                       中给定的地址成为了现在填写的'http://127.0.0.1:8888/api/private/v1/upload'。
            on-preview----- 当点击上传图片的预览时触发（处理图片预览效果）的事件，里面有一个参数是该上传图片的信息。
            on-remove------ 处理移除图片的操作，里面有两个参数，第一个是'被删除的图片信息',第二个是'已上传的图片数量(使用一个数组展示的)'
            headers-------- 此组件是使用的自己的ajax请求，但我们知道除了登录接口，其他接口都是有权限的，那么可以成功的请求其他接口的数据是因为在登录后，我们
                            将登录时后台返回的token保存到了sessionStorage中，并在后续的请求头中携带了此token，所以才可以正常请求其他接口，但组件自己的封装的
                            请求中，明显没有我们的token，所以就要在这个属性下，将我们的token从sessionStorage中取出来赋值给它。正要就可保证上传成功，这个字段
                            的值接受一个对象.具体看data里如何写。
            list-type ----- 这是ui要渲染的效果。可以看到elementui里有不同的上传图片效果,控制这个效果的正是该字段。
            :file-list ---- 文件列表,放在这个文件里的图片会被自动上传,但这里用不到。因为我们可以直接点击上传图片从本地选择图片上传。这中方式目前没有必要。
            :on-success --- 文件上传成功时的钩子函数,虽然图片已经上传成功，但并没有实际的提交到后台。所以当我们上传成功时，后台接口会返回一条当前图片的信息,里面
                            携带着图片的零时保存路径。我们要把这个零时路径保存起来，然后随着添加商品的表单一起提交给添加商品的Api接口。所以就用到了当前这个属性，这个属性
                            的值可以为一个钩子函数名字随便起，它接收三个参数，第一个是当请求成功后，接口返回的信息，第二个是当前成功上传的图片信息，第三个是当前成功上传的图片
                            列表信息。
             -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="headerObj"
              list-type="picture"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器标签
            如何使用：首先下载富文本编辑器 npm install vue-quill-editor --save
            其次在mian.js文件内 
            1.导入富文本编辑器
              import VueQuillEditor from 'vue-quill-editor'
            2.导入富文本编辑器的样式
              import 'quill/dist/quill.core.css'
              import 'quill/dist/quill.snow.css'
              import 'quill/dist/quill.bubble.css'
            3.注册富文本编辑器
              Vue.use(VueQuillEditor)
            之后回到此页面，由于我们使用的是spa 客户端的使用方法，所以可以直接将'quill-editor'标签
            放进来并且给一个v-model双向绑定的值即可使用
             -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 整个添加商品表单的确定按钮 -->
            <el-button type="primary" class="bthAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片时打开的对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="50%"
    >
    <img :src="previewPath" alt="图片加载失败" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
//导入lodash
import _ from 'lodash'

export default {
  data() {
    return {
      //控制步骤条和tab栏显示的值
      activeIndex: '0',
      //添加信息的表单对象
      addForm: {
        goods_cat: '',
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //保存图片零时路径的数组
        pics: [],
        //富文本编辑器输入内容的双向绑定值
        goods_introduce:'',
        //商品的参数（数组），包含 `动态参数` 和 `静态属性`
        attrs:[]
      },
      //添加信息的表单验证队则对象
      addFormRules: {
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
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' },
        ],
      },
      //商品分类的列表数据
      cateList: [],
      //定义级联选择框的配置对象
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
      },
      //获取到的动态参数列表
      manyTableDate: [],
      //获取到的静态属性列表
      onlyTableDate: [],
      //上传图片的url地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      //图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      //上传图片的列表
      // fileList:[
      //   {name:'图片1',url:'http://m.qpic.cn/psc?/V549dDAq0Hzgjh2ZHUOx3ILb0N35ZgUY/45NBuzDIW489QBoVep5mcdhnygCVV7z7phGoI3kNWdMR1EHiddBDf5si*kIqth*hLtjYxzE7WGdFIfaW1x1EbOr9KlOyQAbQBGVD7c0s0no!/b&bo=4AGAAgAAAAABF1M!&rf=viewer_4'},
      //   {name:'图片2',url:'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'}
      // ],

      //图片的url路径（用于预览图片时使用）
      previewPath: '',
      //控制图片预览对话框的显示与隐藏
      previewVisible:false,
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$axios.get('categories')
      if (res.meta.status !== 200)
        return this.message.error('获取商品分类列表失败')
      console.log('请求到的商品分类列表数据', res)
      this.cateList = res.data
    },
    //当级联选择框选中的值发生变化的时候
    handleChange() {
      //console.log("---",this.addForm.goods_cat)
      //只能选择三级分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    //切换tabs标签页时触发的事件
    beforeTabLeave(activeName, oldActiveName) {
      console.log('即将离开的标签页是:', oldActiveName)
      console.log('即将进入的标签页是:', activeName)
      if (activeName != 0 && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        //如果return false 则禁止跳转
        return false
      }
    },
    //点击tab标签页的任意一项时触发的事件
    async tabClicked() {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$axios.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'many' } }
        )
        if (res.meta.status !== 200)
          return this.$message.error('获取动态参数失败')
        //处理数据
        res.data.forEach((item) => {
          item.attr_vals == ''
            ? (item.attr_vals = [])
            : (item.attr_vals = item.attr_vals.split(' '))
        })
        this.manyTableDate = res.data
        console.log('动态参数列表', this.manyTableDate)
      }

      if (this.activeIndex === '2') {
        const { data: res } = await this.$axios.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'only' } }
        )
        if (res.meta.status !== 200)
          return this.$message.error('获取静态属性失败')
        //处理数据
        this.onlyTableDate = res.data
        console.log('静态属性列表', this.onlyTableDate)
      }
    },
    //监听图片上传成功的事件
    handleSuccess(response) {
      console.log('后台返回的数据:', response)
      //定义一个对象，存放每张上传成功的图片临时路径
      const picInfo = {
        pic: response.data.tmp_path,
      }
      //将对象添加到数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },

    //当点击上传图片的预览时触发（处理图片预览效果）
    handlePreview(file) {
      console.log('将要预览的图片信息', file)
      //将图片的url路径赋值给previewPath
      this.previewPath = file.response.data.url
      //将预览对话框打开
      this.previewVisible = true
    },

    //处理移除图片的操作
    handleRemove(file, fileList) {
      console.log('被删除的图片信息', file, '已上传的图片列表数量', fileList)
      //获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      //将存放图片临时路径的数组和当前将要删除的图片路径的路径做对比,
      //如果数组里的某一个对象的键值能和它对应上，就相应的删除该对象。

      //这里使用一个新方法叫做findIndex，这个方法可以接收一个回调函数，这个回调函数的第一个
      //参数代表使用这个方法的数组中的每一项。然后依照回调函数里的规则将，匹配的值对应的下标返回出来。
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath)
      // 此时i就代表数组中与filePath相同的那个对象（对象内某一个键值对儿的键值）
      // 然后使用数组的方法将其删除就行
      this.addForm.pics.splice(i, 1)
    },

    //添加商品（富文本编辑器页面的按钮）
    add() {
      //在发起添加请求前做预验证
      this.$refs.addFormRef.validate(async valid =>{
        if(!valid) return this.$message.error('请填写必要的表单项并填写正确！')
        //做发起添加请求前的数据处理

         //1.首先对级联选择器绑定的数组（this.addForm.goods_cat）做处理，将其变为字符串,但这里不能直接操作绑定的数组

           //因为级联选择框希望绑定的是一个数组，而这里如果直接将数组改为字符串后续添加就会报错
           //所以在处理数据前先将this.addForm深拷贝一份出来进行操作，不对原来的对象进行改动

            //那么深拷贝可以使用
            //1.下载 ： npm install -save lodash
            //2.在需要用到的页面导入 import _ from 'lodash'
            const form = _.cloneDeep(this.addForm) //将对象进行深拷贝
            form.goods_cat = form.goods_cat.join(',')

         //2.其次处理富文本编辑器的内容，将里面的标签去掉
         form.goods_introduce = form.goods_introduce.replace(/<.*?>/ig,"")

         //3.最后处理动态参数和静态属性符合接口文档中的attrs
         if(this.manyTableDate !== [] ) {
           this.toProcess(this.manyTableDate)
         }
         if(this.onlyTableDate !== [] ) {
           this.toProcess(this.onlyTableDate)
         }
         //  将this.addForm.attrs赋值给form.attrs
         form.attrs = this.addForm.attrs
         //console.log('form',form)

      //正式发起数据请求
        const {data:res} = await this.$axios.post('goods',form)
        if(res.meta.status !== 201) return this.$message.error('添加商品失败')
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    },
    //处理数据的函数
    toProcess(arr) {
      arr.forEach(item =>{
        if( item.attr_vals instanceof Array  === true){
          item.attr_vals = item.attr_vals.join(' ')
        }
        let params = {
          attr_id:item.attr_id,
          attr_value:item.attr_vals
        }
        this.addForm.attrs.push(params)
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      } else {
        return null
      }
    },
  },
}
</script>

<style lang="less" scoped>
.el-steps {
  margin: 15px 0;
}
.el-card {
  max-height: 555px;
  overflow: auto;
}
.test-1::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 5px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}
.test-1::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 5px rgba(180, 184, 187, 0.897);
  background: #bbb9b9;
}
.test-1::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  -webkit-box-shadow: inset 0 0 5px rgba(165, 169, 171, 0.897);
  border-radius: 10px;
  background: #ededed;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg{
  width: 100%;
  height: 100%;
}
.bthAdd{
  margin-top: 15px;
}
</style>