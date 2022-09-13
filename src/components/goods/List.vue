<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- tabel -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格" width="95px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="80px"></el-table-column>
        <el-table-column label="创建时间" width="160px">
          <template v-slot="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160px">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="medium"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="medium" @click="removeGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination @size-change="goodsHandleSizeChange" @current-change="goodsHandleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[2, 5, 8, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="goodsTotal"> </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 获取商品列表请求参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 商品列表
      goodsList: [],
      // 总的条数
      goodsTotal: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败！')
      this.goodsList = res.data.goods
      this.goodsTotal = res.data.total
    },
    // 每页条数改变
    goodsHandleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 当前页码改变
    goodsHandleCurrentChange(newCurrent) {
      this.queryInfo.pagenum = newCurrent
      this.getGoodsList()
    },
    // 删除商品
    async removeGoods(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult == 'cancel') return this.$message.info('已取消删除')

      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除商品失败！')
      this.$message.success('删除商品成功！')
      this.getGoodsList()
    },
    // 添加商品
    addGoods() {
      this.$router.push('goods/add')
    }
  }
}
</script>

<style lang="less" scoped></style>
