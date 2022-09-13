<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="touxiang">
        <img src="../assets/touxiang.jpg" alt="" />
      </div>
      <!-- 表单区域 -->
      <el-form label-width="0" class="login_form" :model="Login_form" :rules="formLoginRules" ref="formLoginRef">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-user" v-model="Login_form.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input prefix-icon="iconfont icon-3702mima" v-model="Login_form.password" type="password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="form_button">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      // 表单上的数据绑定
      Login_form: {
        username: 'admin',
        password: '123456'
      },
      // 表单校验规则对象
      formLoginRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置表单
    resetForm() {
      // ref="formLoginRef"是引用，可以获取到dom对象
      // @refs是一个对象，可以找到formLoginRef属性
      this.$refs.formLoginRef.resetFields()
    },
    // 登录前的预验证
    login() {
      this.$refs.formLoginRef.validate(async vali => {
        if (!vali) {
          return
        } else {
          const { data: res } = await this.$http.post('login', this.Login_form)
          if (res.meta.status != 200) {
            return this.$message.error('登录失败!')
          } else {
            this.$message.success('登录成功!')
            // 登录成功后的操作行为
            // 1，将登录成功之后的token保存到sessionStorage中
            window.sessionStorage.setItem('token', res.data.token)
            // 2：localStorage会保存到本地，sessionStorage只在打开会话的时候会保存
            // 3:通过编程式导航跳转到后台主页
            this.$router.push('/home')
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.touxiang {
  position: absolute;
  left: 50%;
  // 移动距离
  transform: translate(-50%, -50%);
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 1px solid #eee;
  box-shadow: 0 0 5px #ddd;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}
.form_button {
  display: flex;
  justify-content: end;
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  // css3盒子模型 这样padding就不会撑大盒子
  box-sizing: border-box;
}
</style>
