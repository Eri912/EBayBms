<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单表格 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template v-slot="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="">
            <el-button type="primary" icon="el-icon-edit" size="medium" @click="editDialog"></el-button>
            <el-button type="success" icon="el-icon-location" size="medium"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination @size-change="goodsHandleSizeChange" @current-change="goodsHandleCurrentChange" :current-page="qureInfo.pagenum" :page-sizes="[2, 5, 8, 15]" :page-size="qureInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
      <!-- 修改对话框 -->
      <el-dialog title="修改" :visible.sync="editDialogVisible" width="50%">
        <el-form ref="form" label-width="80px">
          <el-form-item label="省市区/县">
            <el-input></el-input>
          </el-form-item>
          <el-form-item label="活动区域">
            <el-select placeholder="请选择区域">
              <el-option label="区域一" value="shanghai"></el-option>
              <el-option label="区域二" value="beijing"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 请求订单参数对象
      qureInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单列表
      orderList: [],
      total: 0,
      // 对话框
      editDialogVisible: false
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 请求订单列表
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.qureInfo })
      if (res.meta.status !== 200) return this.$message.error('获取订单列表失败！')
      this.orderList = res.data.goods
      this.total = res.data.total
      console.log(this.orderList)
    },
    // 每页条数发生改变
    goodsHandleSizeChange(newVal) {
      this.qureInfo.pagesize = newVal
      this.getOrderList()
    },
    // 页码发生改变
    goodsHandleCurrentChange(newVal) {
      this.qureInfo.pagenum = newVal
      this.getOrderList()
    },
    // 弹出修改对话框
    editDialog() {
      this.editDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped></style>
