<template>
  <el-container class="home-containner">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理项目</span>
      </div>
      <el-button type="info" @click="logOut">退出</el-button>
    </el-header>
    <!-- 内容主体区域 -->
    <el-container>
      <!-- 左侧边栏 -->
      <el-aside :width="asideWidth">
        <div class="toggle-butotn" @click="toggleColopse">|||</div>
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subitem.path" v-for="subitem in item.children" :key="subitem.id" @click="saveAcitvePath('/' + subitem.path)">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subitem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右边主体区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('navPath')
  },
  data() {
    return {
      menuList: [],
      iconObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      collapseFlag: true,
      isCollapse: false,
      asideWidth: '200px',
      // 当前二级菜单链接的激活状态
      activePath: ''
    }
  },
  methods: {
    logOut() {
      // 退出功能，清空token，退回到首页
      window.sessionStorage.clear()
      this.$router.push('/Login')
    },
    // 从后台获取菜单列表
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      // console.log(this.menuList)
    },
    // 折叠
    toggleColopse() {
      if (this.collapseFlag) {
        this.isCollapse = true
        this.asideWidth = '64px'
        this.collapseFlag = false
      } else if (!this.collapseFlag) {
        this.isCollapse = false
        this.asideWidth = '200px'
        this.collapseFlag = true
      }
    },
    // 存储当前二级菜单path到sessionStorage中，（保存链接的激活状态）
    saveAcitvePath(navPath) {
      window.sessionStorage.setItem('navPath', navPath)
      this.activePath = navPath
    }
  }
}
</script>

<style lang="less" scoped>
.home-containner {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  padding-left: 0px;
  // 贴着两边对齐
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.el-menu {
  border-right: none;
}
.toggle-butotn {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
