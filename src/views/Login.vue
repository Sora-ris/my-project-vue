<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
      <div class="login-header">
        <!-- <el-image :src="logoImage" fit="contain" class="logo"></el-image> -->
        <h2>无锡分行价值户申报系统</h2>
      </div>
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="loginForm"
        @submit.prevent="handleSubmit"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.userid"
            placeholder="请输入工号"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            native-type="submit" 
            :loading="loading"
            class="login-btn"
          >
            {{ loading ? '登录中...' : '立即登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      <div class="tips">
        <h5>请使用Google Chrome浏览器</h5>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

// // 静态资源路径（需替换为实际logo）
// const logoImage = new URL('@/assets/logo.png', import.meta.url).href

const router = useRouter()
const store = useStore()
const loginForm = ref(null)
const loading = ref(false)
const rememberMe = ref(false)

// 表单数据
const form = reactive({
  userid: '',
  password: ''  })

// 密码格式验证规则
const rules = reactive({
  userid: [
    { required: true, message: '请输入工号', trigger: 'blur' },
    { min: 4, max: 16, message: '长度在4到16个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, max: 18, message: '长度在4到18个字符', trigger: 'blur' }
  ]
})

// 初始化记住的账号
onMounted(() => {
  const savedUser = localStorage.getItem('savedUser')
  if (savedUser) {
    const { userid, password } = JSON.parse(savedUser)
    form.userid = userid
    form.password = password
    rememberMe.value = true
  }
})

// 登录按钮 提交处理
const handleSubmit = async () => {
  try {
    await loginForm.value.validate()     // 密码格式验证
    loading.value = true

    // 发送登录login请求 通过store.index.js 
    const loginIsSuccess = await store.dispatch('login', {
      userid: form.userid,
      password: form.password
    })
    if(loginIsSuccess)
    {
      ElMessage.success('登录成功')
      router.push('/home')
    }
    else{
      console.log("login.vue 密码错误")
      throw new Error('用户名或密码错误')
    }

    // 记住密码功能
    if (rememberMe.value) {
      localStorage.setItem('savedUser', JSON.stringify(form))
    } else {
      localStorage.removeItem('savedUser')
    }


  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 全屏居中容器 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 登录卡片样式 */
.login-card {
  width: 420px;
  padding: 30px;
  border-radius: 8px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  font-family: Avenir, Helvetica; 
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
}

.login-btn {
  width: 100%;
  margin-top: 10px;
}

.tips {
  text-align: center;
  font-family: Avenir, Helvetica; 
}

/* 响应式调整 */
@media (max-width: 480px) {
  .login-card {
    width: 90%;
    padding: 20px;
  }
}
</style>