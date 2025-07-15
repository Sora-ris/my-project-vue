<template>
  <div class="list-container">
    <el-row :gutter="20">
      <!-- 左侧部门树 -->
      <el-col :span="6">
        <el-card>
          <h3>部门列表</h3>
          <el-input
            v-model="filterText"
            placeholder="搜索部门"
            class="search-input"
          />
          <el-tree
            ref="treeRef"
            :data="deptTree"
            node-key="bmid"
            :props="treeProps"
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
            :highlight-current="true"
            :default-expand-all="true"
          />
        </el-card>
      </el-col>
      
      <!-- 右侧价值户明细 -->
      <el-col :span="18">
        <el-card>
          <h2>{{ currentDept }} 价值户明细列表</h2>
          <el-table :data="tableData" border stripe height="650">
            <el-table-column prop="date" label="数据日期" width="120" />
            <el-table-column prop="customerId" label="客户编号" width="120" />
            <el-table-column prop="customerName" label="客户名称" width="180" />
            <el-table-column prop="valueFlag" label="零售价值客户标志" width="150" />
            <el-table-column prop="reason" label="达标原因" width="200" />
            <el-table-column prop="username" label="推荐人" width="150" />
            <!-- <el-table-column prop="depositBalance" label="存款余额" width="120" align="right">
              <template #default="{row}">
                {{ formatAmount(row.depositBalance) }}
              </template>
            </el-table-column> -->
            <!-- <el-table-column prop="loanBalance" label="贷款余额" width="120" align="right">
              <template #default="{row}">
                {{ formatAmount(row.loanBalance) }}
              </template>
            </el-table-column> -->
            <!-- <el-table-column prop="customerManager" label="客户经理" width="150" align="center"/> -->
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              background
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="pagination.currentPage"
              :page-sizes="[10, 15, 20, 30]"
              :page-size="pagination.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="pagination.total"
              class="pagination-container">
            </el-pagination>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElTree } from 'element-plus'
import { ElMessage } from 'element-plus'

const store = useStore()

// 数据状态
const deptTree = ref([])     // 部门树
const filterText = ref('')   // 搜索框
const treeRef = ref(null)
const tableData = ref([])    // 价值户明细列表
const currentDept = ref('')  // 当前显示的部门

// 分页配置 每一页多少条数据
const pagination = ref({
  currentPage: 1,
  pageSize: 15,
  total: 0
})

// 树结构配置
const treeProps = ref({
  children: 'children',
  label: 'bmname'
})

// 监听搜索文本变化
watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

// 从store获取当前用户信息(login时存储了用户完整信息)
const currentUser = computed(() => store.state.user)

// 格式化金额显示
const formatAmount = (value) => {
  if (!value) return '-'
  return `¥${Number(value).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

// 每页条数改变
const handleSizeChange = (pageSize) => {
  pagination.value.pageSize = pageSize;
  pagination.value.currentPage = 1; // 重置到第一页
  fetchValueCustomers();
};

// 当前页码改变
const handleCurrentChange = (currentPage) => {
  pagination.value.currentPage = currentPage;
  fetchValueCustomers();
};

// 树节点过滤
const filterNode = (value, data) => {
  if (!value) return true
  return data.bmname.includes(value)
}

// 树节点点击处理
const handleNodeClick = (data) => {
  currentDept.value = data.bmname
  pagination.value.currentPage = 1
  fetchValueCustomers()
}

// 获取部门树数据
const fetchDeptTree = async () => {
  try {
    const response = await store.dispatch('get_user_bm_tree');
    // 容错：空数据时设为空数组
    deptTree.value = response?.data?.success 
      ? response.data.data || [] 
      : [];
    
    if (currentUser.value?.bm && deptTree.value.length) {
      const currentNode = deptTree.value.find(node => 
        node.bmname === currentUser.value.bm
      );
      if (currentNode) {
        treeRef.value?.setCurrentKey(currentNode.bmid);
        currentDept.value = currentNode.bmname;
      }
    }
  } catch (error) {
    console.error('获取部门树失败:', error);
    deptTree.value = []; // 异常时重置为空数组
  }
}

// 获取价值户数据
// 页面进入 翻页 点击按钮都会调用该函数来刷新页面
const fetchValueCustomers = async () => {
  try {
    // 查找jzhmx信息 传入当前页和当前页容量
    // 每次翻页都会请求查找目标页数据
    const response = await store.dispatch('get_jzhmx_by_username', {
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize
    })
    if (response?.data?.success) {
      tableData.value = response.data.data.list
      pagination.value.total = response.data.data.total
      // console.log("mingxi.vue 共有户数： " + pagination.value.total)
      ElMessage.success('数据加载成功');
    }
  } catch (error) {
    console.error('获取价值户数据失败:', error)
  }
}

// 页面启动函数
onMounted(() => {
  fetchDeptTree()
  fetchValueCustomers()
})
</script>

<style scoped>
.list-container {
  padding: 20px;
}
.search-input {
  margin-bottom: 15px;
}
.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>