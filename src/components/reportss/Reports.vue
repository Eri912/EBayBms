<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 2为 ECharts 准备一个定义了宽高的 DOM -->
      <div id="main" style="width: 750px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
// 1导入echarts
import * as echarts from 'echarts'
// 导入lodash
import _ from 'lodash'
export default {
  data() {
    return {
      // 需要合并的选项
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created() {},
  // 此时dom结构已经渲染完毕
  async mounted() {
    // 3基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))
    // 发起请求
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) return this.$message.error('获取图表失败！')
    // 4准备数据和配置项 loadsh的merge方法合并两个对象
    const result = _.merge(res.data, this.options)
    // 5使用刚指定的配置项和数据显示图表。
    myChart.setOption(result)
  },
  methods: {}
}
</script>

<style lang="less" scoped></style>
