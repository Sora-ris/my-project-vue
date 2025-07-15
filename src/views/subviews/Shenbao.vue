<template>
  <div class="list-container">
    <el-card>
      <h2>价值户申报</h2>
      
      <!-- 申报表单 -->
      <el-form :model="declareForm" :rules="declareRules" ref="declareFormRef" label-width="120px">
        <el-form-item label="客户号" prop="kehuhao">
          <el-input v-model="declareForm.kehuhao" placeholder="请输入客户号" clearable style="width: 300px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleDeclare">申报</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 申报结果表格 -->
      <!-- <el-table :data="analysisData" border style="margin-top: 20px">
        <el-table-column prop="category" label="分类" width="180" />
        <el-table-column prop="value" label="数值" />
      </el-table> -->
    </el-card>
    
      
    <el-card class="import-section-card">
      <h2>批量申报</h2>
      <!-- Excel批量导入区域 -->
      <div class="import-section">
        <el-button type="primary" @click="downloadTemplate">下载导入模板</el-button>
        <el-upload
          class="upload-demo"
          action="/api/import_jzh"
          :headers="uploadHeaders"
          :on-success="handleImportSuccess"
          :on-error="handleImportError"
          :before-upload="beforeUpload"
          :show-file-list="false"
          :data="{ username: store.state.user?.username }"
          accept=".xlsx,.xls"
        >
          <el-button type="success">导入Excel</el-button>
        </el-upload>
      </div>
    </el-card>

    <!-- 导入结果展示 -->
    <el-card v-if="importResult" class="result-card">
      <div class="result-summary">
        <span>导入结果：</span>
        <span class="success-count">成功: {{ importResult.successCount }} 条</span>
        <span class="failure-count">失败: {{ importResult.failureCount }} 条</span>
      </div>
      <el-table :data="importResult.failedItems" border height="300" v-if="importResult.failureCount > 0">
        <el-table-column prop="kehuhao" label="客户号" width="150" />
        <el-table-column prop="error" label="失败原因" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed  } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElNotification } from 'element-plus'

const store = useStore()

// 申报表单数据
const declareForm = ref({
  kehuhao: ''
})

// 申报表单验证规则
const declareRules = ref({
  kehuhao: [
    { required: true, message: '客户号不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '客户号长度应在6-20位', trigger: 'blur' }
  ]
})

// 批量导入结果初始化
const importResult = ref(null)
// 表单引用
const declareFormRef = ref(null)

// // 申报结果数据 弃用
// const analysisData = ref([
//   { category: '月度申报量', value: '加载中...' },
//   { category: '通过率', value: '加载中...' }
// ])

// // 获取当前用户的申报统计数据  弃用
// const fetchDeclarationStats = async () => {
//   try {
//     const response = await store.dispatch('get_declaration_stats')
//     if (response?.data?.success) {
//       const stats = response.data.data
//       analysisData.value = [
//         { category: '月度申报量', value: stats.monthlyDeclarations || 0 },
//         { category: '通过率', value: stats.approvalRate ? `${stats.approvalRate}%` : 'N/A' }
//       ]
//     }
//   } catch (error) {
//     console.error('获取申报统计数据失败:', error)
//     ElMessage.error('获取申报统计数据失败')
//   }
// }

// 处理单个申报
const handleDeclare = () => {
  declareFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const kehuhao = declareForm.value.kehuhao
        const response = await store.dispatch('declare_jzh', { kehuhao })
        
        if (response?.data?.success) {
          ElMessage.success('申报成功！可在价值户明细中查看')
          // // 刷新统计数据
          // fetchDeclarationStats()
          // 清空表单
          declareForm.value.kehuhao = ''
        } else {
          // 处理逻辑错误 非http错误
          ElMessage.error(response?.data?.message || '申报失败')
        }
      } catch (error) {
        // 在store.index.js中 接收到服务器错误后 返回完整信息
        const serverMessage = error.response?.data?.message;
        
        if (error.response?.status === 409) {
          ElMessage.warning(serverMessage || '该客户已申报') 
        } else {
          ElMessage.error(serverMessage || '申报过程中发生错误')
        }
        console.error('申报失败详情:', error)
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  declareFormRef.value.resetFields()
}

// 上传请求头（携带认证信息）
const uploadHeaders = computed(() => {
  const token = localStorage.getItem('auth') 
    ? JSON.parse(localStorage.getItem('auth')).token 
    : ''
  return { Authorization: `Bearer ${token}` }
})

// 下载Excel模板
const downloadTemplate = () => {
  window.location.href = '/api/download_import_template'
}

// 文件上传前校验
const beforeUpload = (file) => {
  const isExcel = file.type === 'application/vnd.ms-excel' || 
                 file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isExcel) {
    ElMessage.error('只能上传Excel文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB!')
    return false
  }
  return true
}

// 导入成功处理
const handleImportSuccess = (response, file) => {
  if (response.success) {
    importResult.value = response.data
    ElNotification({
      title: '导入成功',
      message: `成功导入 ${response.data.successCount} 条数据，${response.data.failureCount} 条失败`,
      type: 'success',
      duration: 5000
    })
  } else {
    ElMessage.error(response.message || '导入失败')
  }
}

// 导入失败处理
const handleImportError = (response, file) => {
  //TODO
  ElMessage.error(response.message || '导入失败')
}


onMounted(() => {
  // // 页面加载时获取申报统计数据
  // fetchDeclarationStats()
})
</script>

<style scoped>
.list-container {
  padding: 20px;
}
.import-section-card {
  margin-top: 20px;
}
.import-section {
  /* margin-top: 20px; */
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
}
.result-card {
  margin-top: 20px;
}
.result-summary {
  margin-bottom: 15px;
  font-size: 16px;
}

.success-count {
  color: #67c23a;
  margin: 0 15px;
}

.failure-count {
  color: #f56c6c;
}
</style>