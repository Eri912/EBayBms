<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 添加商品按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" class="tjsp" @click="addGoodsCate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border>
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="qureInfo.pagenum" :page-sizes="[3, 6, 10, 15]" :page-size="qureInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
      <!-- 添加商品对话框 -->
      <el-dialog title="添加商品" :visible.sync="addGoodsVisible" width="50%" @close="addCatDialogClose">
        <!-- 表单区域 -->
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 父级分类 -->
        <el-form :model="addCateForm" ref="addCateFormRef" label-width="100px">
          <el-form-item label="父级分类">
            <!-- 级联选择器 -->
            <!-- options指定数据源，props指定配置对象 -->
            <el-cascader v-model="selectedKeys" :options="parentCatList" expand-trigger="hover" :props="caceprops" @change="caceChange"></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addGoodsVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Cate',
  data() {
    return {
      // 请求体参数
      qureInfo: {
        type: 3,
        // 当前页码
        pagenum: 1,
        // 每页展示的条数
        pagesize: 5
      },
      // 商品分类数据
      cateList: [],
      // 总的条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 当前这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示将当前列定义为模板列
          type: 'template',
          // 当前这一列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示将当前列定义为模板列
          type: 'template',
          // 当前这一列使用的模板名称
          template: 'opt'
        }
      ],
      // 添加商品分类对话框显示与隐藏
      addGoodsVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类id
        cat_pid: 0,
        // 分类等级，默认添加一级分类
        cat_level: 0
      },
      // 添加分类名称的校验规则对象
      addCateFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 父级分类的数据列表
      parentCatList: [],
      // 级联选择器配置对象
      caceprops: {
        // 具体选中的
        value: 'cat_id',
        // 具体展示出来的
        label: 'cat_name',
        // 父子链接属性
        children: 'children'
      },
      // 选中的父级分类的id数组
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 请求商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.qureInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
      this.cateList = res.data.result
      //  为总的数据条数赋值
      this.total = res.data.total
    },
    // 监听每页条数改变
    handleSizeChange(newSize) {
      this.qureInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听页码的改变
    handleCurrentChange(newNum) {
      this.qureInfo.pagenum = newNum
      this.getCateList()
    },
    // 添加商品分类
    addGoodsCate() {
      this.getParentCatList()
      this.addGoodsVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCatList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
      this.parentCatList = res.data
    },
    // 级联选择器,选择项发生改变会触发的函数
    caceChange() {},
    // 关闭添加商品分类对话框重置表单
    addCatDialogClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 点击按钮，添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        } else {
          this.$message.success('添加分类成功！')
          this.getCateList()
          this.addGoodsVisible = false
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.tjsp {
  margin-bottom: 15px;
}
</style>
