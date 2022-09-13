<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 主体区域 -->
      <el-table :data="RolesList" border>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <!-- 作用域插槽 -->
          <template v-slot="scope">
            <!-- i1是索引 -->
            <el-row v-for="item1 in scope.row.children" :key="item1.id" class="elrow vcenter">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRight(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <!-- 通过二级循环渲染二级权限 -->
              <el-col :span="19">
                <el-row class="elrow2 vcenter" v-for="item2 in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRight(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRight(scope.row, item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" width="300px" @click="setRightdialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->

    <el-dialog title="分配权限" :visible.sync="setRightVisiable" width="50%" @close="rightDialogClose">
      <!-- 分配权限的树形结构列表 -->
      <el-tree :data="rightList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defkeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightVisiable = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
name: 'Roles'
export default {
  data() {
    return {
      RolesList: [],
      // 分配权限的显示与隐藏
      setRightVisiable: false,
      // 权限列表
      rightList: [],
      //
      treeProps: {
        label: 'authName',
        // 树形控件的树形绑定对象
        children: 'children'
      },
      // 默认勾选的数组
      defkeys: [],
      // 即将分配权限的id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')
      this.RolesList = res.data
    },
    // 删除权限
    async removeRight(role, rightid) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除！')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightid}`)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败！')
      role.children = res.data
    },
    // 分配权限
    async setRightdialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败！')
      this.rightList = res.data
      // console.log(this.rightList)
      // 递归调用获取id
      this.getlefKeys(role, this.defkeys)
      this.setRightVisiable = true
    },
    // 递归调用获取角色下所有三级权限id，保存到defkeys数组中
    getlefKeys(node, arr) {
      // 判断节点是否有children属性,三级节点没有
      if (!node.children) {
        return arr.push(node.id)
      } else {
        node.children.forEach(item => {
          this.getlefKeys(item, arr)
        })
      }
    },
    // 关闭分配权限对话框
    rightDialogClose() {
      this.defkeys = []
    },
    // 为角色分配权限
    async allotRights() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]

      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightVisiable = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.elrow {
  border-bottom: 1px solid #eee;
}
.elrow:nth-child(1) {
  border-top: 1px solid #eee;
}
.elrow2 {
  border-top: 1px solid #eee;
}
.elrow2:nth-child(1) {
  border-top: 0;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
