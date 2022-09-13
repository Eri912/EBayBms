<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关的参数！" type="warning" :closable="false" show-icon> </el-alert>
      <el-row class="paramsRow">
        <el-col>
          <span
            >选择商品分类:
            <!-- 级联选择器 -->
            <el-cascader v-model="selectCatId" :options="goodsCatList" expand-trigger="hover" :props="catProps" @change="PropsHandleChange"></el-cascader>
            <!-- tab标签页 -->
            <el-tabs v-model="paramsActiveName" @tab-click="paramsHandleClick">
              <el-tab-pane label="动态参数" name="many">
                <el-button type="primary" :disabled="isDisabled" @click="addParams">添加参数</el-button>
                <!-- 动态参数表格 -->
                <el-table :data="manyTable" border stripe="">
                  <el-table-column type="expand"></el-table-column>
                  <el-table-column type="index"></el-table-column>
                  <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                  <el-table-column label="操作">
                    <template v-slot="">
                      <el-button type="primary" icon="el-icon-edit" size="small">编辑</el-button>
                      <el-button type="danger" icon="el-icon-delete" size="small">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="静态属性" name="only">
                <el-button type="primary" :disabled="isDisabled" @click="addParams">添加属性</el-button>
                <!-- 静态属性表格 -->
                <el-table :data="onlyTable" border stripe="">
                  <el-table-column type="expand"></el-table-column>
                  <el-table-column type="index"></el-table-column>
                  <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                  <el-table-column label="操作">
                    <template v-slot="">
                      <el-button type="primary" icon="el-icon-edit" size="small">编辑</el-button>
                      <el-button type="danger" icon="el-icon-delete" size="small">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </span>
        </el-col>
      </el-row>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog :title="'添加' + dialogName" :visible.sync="addparamsDialogVisible" width="50%" @close="addDialogClose">
      <!-- 表单区域 -->
      <el-form :model="addParamsForm" :rules="addParamsRul" ref="addParamsRef" label-width="100px">
        <el-form-item :label="dialogName + '名称'" prop="attr_name">
          <el-input v-model="addParamsForm.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addparamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParamsMethods">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有商品分类列表
      goodsCatList: [],
      // 级联选择器props属性绑定对象
      catProps: {
        // 具体选中的
        value: 'cat_id',
        // 具体展示出来的
        label: 'cat_name',
        // 父子链接属性
        children: 'children'
      },
      // 级联选择器中最后选中的商品分类数组，包括一级，二级，三级
      selectCatId: [],
      // tab标签页默认选中的
      paramsActiveName: 'many',
      // 动态参数table
      manyTable: [],
      // 静态属性table
      onlyTable: [],
      // 添加参数的对话框显示与隐藏
      addparamsDialogVisible: false,
      // 添加参数表单数据对象
      addParamsForm: {
        attr_name: ''
      },
      // 添加参数表单数据,校验规则对象
      addParamsRul: {
        attr_name: [
          {
            required: true,
            message: '请输入参数',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getCatList()
  },
  methods: {
    async getCatList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败！')
      this.goodsCatList = res.data
    },
    // 级联选择器点击确定后发生的事
    PropsHandleChange() {
      // 获取参数列表
      this.getParamsLists()
    },
    // 点击切换tab标签页发生的事
    paramsHandleClick() {
      // 获取参数列表
      this.getParamsLists()
    },
    // 动态获取参数列表
    async getParamsLists() {
      //  sel代表获取的是动态参数还是静态属性
      const { data: res } = await this.$http.get(`categories/${this.catId}/attributes`, { params: { sel: this.paramsActiveName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败！')
      if (this.paramsActiveName == 'many') {
        this.manyTable = res.data
      } else {
        this.onlyTable = res.data
      }
    },
    // 添加参数对话框
    addParams() {
      this.addparamsDialogVisible = true
    },
    // 对话框关闭后的表单重置效果
    addDialogClose() {
      this.$refs.addParamsRef.resetFields()
    },
    // 添加参数
    addParamsMethods() {
      // 先对表单进行预验证
      this.$refs.addParamsRef.validate(async valid => {
        if (!valid) {
          return
        } else {
          const { data: res } = await this.$http.post(`categories/${this.catId}/attributes`, {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.paramsActiveName
          })
          if (res.meta.status !== 201) return this.$message.error('添加参数失败！')
          this.$message.success('添加参数成功！')
          this.getCatList()
          this.addparamsDialogVisible = false
        }
      })
    }
  },
  // 计算属性
  computed: {
    // 根据计算属性返回的布尔值控制按钮是否禁用
    isDisabled() {
      if (this.selectCatId.length !== 3) {
        return true
      } else {
        return false
      }
    },
    // 分类参数id
    catId() {
      if (this.selectCatId.length == 3) {
        return this.selectCatId[2]
      } else {
        return null
      }
    },
    // 控制添加参数对话框的名字（动态参数和静态属性公用一个对话框）
    dialogName() {
      if (this.paramsActiveName == 'many') {
        return '参数'
      }
      return '属性'
    }
  }
}
</script>

<style lang="less" scoped>
.paramsRow {
  margin-top: 15px;
}
</style>
