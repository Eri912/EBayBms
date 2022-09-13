<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 提示 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"> </el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 表单 -->
      <el-form :model="addForm" :rules="addRules" ref="addRef" label-width="100px" label-position="top">
        <!-- tab栏切换 -->
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="tabBeforLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>

            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>

            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>

            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>

            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="goodsCatList" expand-trigger="hover" :props="catprops" @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 表单item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTabData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTabData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 图片上传 -->
            <el-upload action="http://127.0.0.1:8888/api/private/v1/upload" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headerObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- anniu -->
            <el-button type="primary" class="tianjia" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片的对话框 -->
    <el-dialog title="预览图片" :visible.sync="previewDialogVisible" width="50%">
      <img :src="previewUrl" class="previewImg" alt="" />
    </el-dialog>
  </div>
</template>

<script>
// 导入lodash  他有个深拷贝的方法
import _ from 'lodash'
export default {
  data() {
    return {
      // 当前激活的步骤
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        // 商品所属的分类数组  级联选择器选中的三级商品3个的id
        goods_cat: [],
        // 图片
        pics: [],
        // 描述
        goods_introduce: '',
        // 商品参数
        attrs: []
      },
      // 商品分类
      goodsCatList: [],
      // 级联选择器配置对象
      catprops: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 表单校验规则对象
      addRules: {
        goods_name: [
          {
            required: true,
            message: '请输入商品名称',
            trigger: 'blur'
          }
        ],
        goods_price: [
          {
            required: true,
            message: '请输入商品价格',
            trigger: 'blur'
          }
        ],
        goods_number: [
          {
            required: true,
            message: '请输入商品数量',
            trigger: 'blur'
          }
        ],
        goods_weight: [
          {
            required: true,
            message: '请输入商品重量',
            trigger: 'blur'
          }
        ],
        goods_cat: [
          {
            required: true,
            message: '请输入',
            trigger: 'blur'
          }
        ]
      },
      // 动态参数
      manyTabData: [],
      // 静态属性
      onlyTabData: [],
      // 上传图片设置的请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片url
      previewUrl: '',
      previewDialogVisible: false
    }
  },
  created() {
    this.getCatList()
  },
  methods: {
    // 获取商品分类
    async getCatList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
      this.goodsCatList = res.data
    },
    // 级联选择器发生变化
    handleChange() {},
    // tab栏切换之前做的验证
    tabBeforLeave(activeName, oldActiveName) {
      // oldActiveName 即将离开的tab栏
      // activeName 即将去到的tab栏
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    // 点击tab栏发生切换  发生的事件
    async tabClicked() {
      // 表示进入动态参数的面板  activeIndex  那个tab栏
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.catId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) return this.$message.error('获取分类失败！')
        // 将字符串转化为数组
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length == 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTabData = res.data
        // console.log(this.manyTabData)
      } else if (this.activeIndex === '2') {
        // 表示进入静态参数tab
        const { data: res } = await this.$http.get(`categories/${this.catId}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) return this.$message.error('获取属性失败！')
        // console.log(res.data)
        this.onlyTabData = res.data
      }
    },
    // 预览图片
    handlePreview(file) {
      this.previewUrl = file.response.data.url
      this.previewDialogVisible = true
    },
    // 删除图片
    handleRemove(file) {
      // 找到要删除图片的临时路径
      const filePath = file.response.data.tmp_path
      // 从pics数组中找到图片对应的索引值
      const i = this.addForm.pics.findIndex(x => {
        x.pic === filePath
        // 调用数组的splice方法，把图片信息对象，从pics数组中移除
        this.addForm.pics.splice(i, 1)
      })
    },
    // 图片上传成功后的事件
    handleSuccess(response) {
      // 拼接得到一个图片信息对象
      const picInfo = {
        pic: response.data.tmp_path
      }
      // 添加到图片数组中
      this.addForm.pics.push(picInfo)
    },
    // 添加商品
    add() {
      // 表单预校验
      this.$refs.addRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请完善表单信息！')
        } else {
          // 执行添加的业务逻辑
          const form = _.cloneDeep(this.addForm)
          // 转化为字符串
          form.goods_cat = form.goods_cat.join(',')
          // 处理动态参数
          this.manyTabData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            }
            this.addForm.attrs.push(newInfo)
          })
          // 处理静态属性
          this.onlyTabData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addForm.attrs.push(newInfo)
          })
          form.attrs = this.addForm.attrs
          // 发起请求
          const { data: res } = await this.$http.post('goods', form)
          if (res.meta.status !== 201) return this.$message.error('添加商品失败！')
          this.$message.success('添加商品成功！')
          this.$router.push('/goods')
        }
      })
    }
  },
  // 计算属性
  computed: {
    catId() {
      if (this.addForm.goods_cat.length == 3) {
        return this.addForm.goods_cat[2]
      } else {
        return null
      }
    }
  }
}
</script>
<style lang="less" scoped>
.previewImg {
  width: 100%;
}
.tianjia {
  margin-top: 15px;
}
</style>
