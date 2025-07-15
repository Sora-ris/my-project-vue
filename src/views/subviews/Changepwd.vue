<template>
  <div class="list-container">
    <el-card>
      <el-form v-if="isAuthenticated">
      <h1>修改密码</h1>
      <el-input v-model="oldPassword" type="password" placeholder="旧密码" />
      <el-input v-model="newPassword" type="password" placeholder="新密码" />
      <el-button @click="handleChangePassword">确认修改</el-button>
      </el-form>
    </el-card>
    
  </div>
  
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

const store = useStore()
const oldPassword = ref('')
const newPassword = ref('')
const isAuthenticated = computed(() => store.state.isAuthenticated)

const handleChangePassword = async () => {
  console.log("开始修改密码")
  const success = await store.dispatch('changePassword', {
    oldPassword: oldPassword.value,
    newPassword: newPassword.value
  })
  console.log("修改密码")
  if (success) {
    ElMessage.success('密码修改成功')
    oldPassword.value = ''
    newPassword.value = ''
  } else {
    ElMessage.error('密码修改失败，请检查旧密码')
  }
}
</script>

<style scoped>
.list-container {
  padding: 20px;
}
</style>