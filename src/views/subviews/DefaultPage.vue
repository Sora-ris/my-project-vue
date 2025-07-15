<template>
  <!-- 用户欢迎区域 -->
  <div class="home-container">
    <div class="welcome-section">
      <el-card shadow="hover">
        <div class="user-greeting">
          <el-icon :size="15" color="#409EFF"><UserFilled/></el-icon>
          <h1>您好，{{ username }}</h1>
        </div>
      </el-card>
    </div>

    <!-- 数据表格区域 -->
    <div class="data-table-section">
      <el-card shadow="always">
          <el-table el-table 
            :data="tableData" 
            height="500px" 
            stripe 
            style="width: 100%"
            v-loading="loading"
            element-loading-text="数据加载中...">
              <!-- 序号列（自动排序） -->
              <el-table-column 
                type="index" 
                :index="indexMethod" 
                label="" 
                width="80" 
                align="center">
              </el-table-column>

              <!-- 部门信息列 prop与数据库字段名一致 数据即可正常显示-->
                <el-table-column 
                  prop="bm"         
                  label="部门" 
                  min-width="200"
                  sortable
                >
                  <template #default="{ row }">
                    <el-tag type="info" effect="plain">
                      {{ row.bm }}
                    </el-tag>
                  </template>
                </el-table-column>

              <!-- 价值户户数列 prop与数据库字段名一致 数据即可正常显示-->
                <el-table-column 
                  prop="num" 
                  label="价值户户数" 
                  width="150"
                  sortable
                  align="right"
                >
                  <template #default="{ row }">
                    <el-text type="danger" tag="strong">
                      {{ row.num.toLocaleString() }}
                    </el-text>
                  </template>
                </el-table-column>
          </el-table>
          
          <!-- 数据更新时间 -->
          <!-- <div class="update-time">
            <el-text type="info" size="small">
              数据更新时间: {{ lastUpdateTime }}
            </el-text>
          </div> -->
        </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'


const store = useStore();
const tableData = ref([]);        // 存储列表数据 初始化为空
const loading = ref(true);        // 是否在loading

// 响应式ui写法 用const定义，改值通过username.value
const username = ref(store.state.user?.userid || '用户'); 
// const lastUpdateTime = ref('');   // 表格最后更新时间戳

// 表格 第一列自定义序号 自增生成方法 从1开始
const indexMethod = (index) => {
  return index + 1;
};

// 从后端获取数据
const fetchData = async () => {
  try {
    // 1. 获取用户名
    username.value = store.state.user?.username || '?';    // login时已经保存在store里
      
    // 2. 获取表格数据
    const tableResponse = await store.dispatch('get_bmjzh_hz');
    if (tableResponse && tableResponse.data.success) {
      tableData.value = tableResponse.data.data;
      // ElMessage.success('数据加载成功');
    } else {
      ElMessage.error('数据获取失败');
    }
  } catch (error) {
    console.error('数据获取失败:', error);
    ElMessage.error('数据加载失败');
  } finally {
    loading.value = false;
  }
};

// 页面组件挂载时调用 系统函数
onMounted(() => {
  // 获取数据更新页面
  fetchData();
});
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.welcome-section {
  margin-bottom: 15px;
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-greeting h1 {
  font-size: 20px;
  margin: 0;
  font-weight: normal;
  color: #333;
}

.data-table-section {
  margin-top: 20px;
}

.update-time {
  margin-top: 15px;
  text-align: right;
  padding-right: 10px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .user-greeting {
    flex-direction: column;
    text-align: center;
  }
  
  .user-greeting h1 {
    font-size: 1.5rem;
  }
}

</style>




