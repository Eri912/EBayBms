<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 搜索与添加 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="qureInfo.query" clearable @clear="getUserList"> <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button> </el-input>
        </el-col>
        <el-col :span="4"><el-button type="primary" @click="dialogVisible = true">添加用户</el-button></el-col>
      </el-row>
      <!-- 用户列表 -->
      <el-table :data="userList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <!-- 修改 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserByid(scope.row.id)"></el-button>
            <!-- 分配角色 -->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="fenpeijuese(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页效果 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="qureInfo.pagenum" :page-sizes="[1, 2, 3, 4]" :page-size="qureInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
      <!-- 添加用户的对话框 -->
      <el-dialog title="提示" :visible.sync="dialogVisible" width="50%" @close="dilogClose">
        <el-form ref="addFormRef" :model="addForm" label-width="70px" :rules="addFormRules">
          <el-form-item label="用户名" prop="username"> <el-input v-model="addForm.username"></el-input> </el-form-item>
          <el-form-item label="密码" prop="password"> <el-input v-model="addForm.password"></el-input> </el-form-item>
          <el-form-item label="邮箱" prop="email"> <el-input v-model="addForm.email"></el-input> </el-form-item>
          <el-form-item label="电话" prop="mobile"> <el-input v-model="addForm.mobile"></el-input> </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户的对话框 -->
      <el-dialog title="修改用户" :visible.sync="editDialogVisiable" width="50%" @close="editDialogClose">
        <!-- 内容主体区域 -->
        <el-form ref="editFormRef" :model="editForm" label-width="70px" :rules="editFormRules">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisiable = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色的对话框 -->
      <el-dialog title="分配角色" :visible.sync="fenpeiRoleDialogVisiable" width="50%">
        <div>
          <p>当前的用户: {{ fenpeiRole.username }}</p>
          <p>当前的角色: {{ fenpeiRole.role_name }}</p>
          <p>
            分配角色:
            <el-select v-model="selectRoleId" placeholder="请选择">
              <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"> </el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="fenpeiRoleDialogVisiable = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    // element中自定义校验规则
    // 验证邮箱的规则
    var checkEmail = (rules, value, cb) => {
      // 验证邮箱的正则表达式  value表示要校验的值  直接cb回调函数表示通过
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      } else {
        cb(new Error('请输入合法的邮箱'))
      }
    }
    // 验证电话的校验规则
    var checkPhone = (rules, value, cb) => {
      // 验证电话的正则表达式
      const regPhone = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regPhone.test(value)) {
        return cb()
      } else {
        cb(new Error('请输入合法的电话'))
      }
    }
    return {
      // 获取用户列表的参数对象
      qureInfo: {
        // 搜索关键字
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示的条数
        pagesize: 4
      },
      userList: [],
      total: 0,
      // 对话框显示与隐藏
      dialogVisible: false,
      // 添加用户的数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的校验规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 10,
            message: '用户名长度在6~10个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      // 控制修改用户的对话框
      editDialogVisiable: false,
      // 要修改的用户的信息
      editForm: {},
      // 修改用户信息时候的表单校验规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          // 自定义校验规则
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      // 控制分配角色对话框显示与隐藏
      fenpeiRoleDialogVisiable: false,
      // 角色
      fenpeiRole: {},
      // 角色列表
      roleList: [],
      // 下拉框中显示的角色
      selectRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.qureInfo })
      if (res.meta.status != 200) {
        return this.$message.error('获取用户列表失败！')
      } else {
        this.userList = res.data.users
        this.total = res.data.total
      }
    },
    // 监听pagesize改变的事件
    handleSizeChange(newsize) {
      // 每页显示多少条
      this.qureInfo.pagesize = newsize
      // 重新请求数据
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newpage) {
      this.qureInfo.pagenum = newpage
      this.getUserList()
    },
    // 监听switch状态
    async userStateChange(userinfo) {
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        // 取反
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      } else {
        this.$message.success('更新用户状态成功！')
      }
    },
    // 关闭对话框后的表单重置效果
    dilogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户前的预验证（点击确定时）
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 验证通过，发起添加用户的请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status != 201) {
          this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        // 关闭对话框
        this.dialogVisible = false
        this.getUserList()
      })
    },
    // 修改用户信息
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status != 200) {
        return this.$message.error('请求用户信息失败!')
      } else {
        // 将用户信息保存到editForm
        this.editForm = res.data
        this.editDialogVisiable = true
      }
    },
    // 修改用户对话框关闭后的表单重置效果
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改并提交用户信息
    editUserInfo() {
      // 预验证
      this.$refs.editFormRef.validate(async valid => {
        // 发起修改用户信息的请求
        if (!valid) return
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败！')
        } else {
          // 关闭对话框
          this.editDialogVisiable = false
          // 重新刷新数据
          this.getUserList()
          // 提示成功信息
          this.$message.success('更新用户信息成功！')
        }
      })
    },
    // 删除用户
    async removeUserByid(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 点击确定，返回confirm
      // 点击取消返回cancel
      if (confirmResult == 'cancel') {
        return this.$message.info('已取消删除')
      }
      // 发起删除用户的请求
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      } else {
        this.getUserList()
        return this.$message.success('删除用户成功！')
      }
    },
    // 获取角色列表
    async fenpeijuese(role) {
      this.fenpeiRole = role
      // 在展示对话框之前先获取所有的角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')
      this.roleList = res.data
      this.fenpeiRoleDialogVisiable = true
    },
    // 分配角色
    async saveRoleInfo() {
      if (!this.selectRoleId) {
        return this.$message.error('请选择要分配的角色！')
      }
      const { data: res } = await this.$http.put(`users/${this.fenpeiRole.id}/role`, { rid: this.selectRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败！')
      }
      this.$message.success('更新角色成功！')
      this.getUserList()
      this.fenpeiRoleDialogVisiable = false
    }
  }
}
</script>

<style lang="less" scoped></style>
