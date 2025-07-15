<template>
    <el-container class="home-container">
    <!-- 顶部导航栏 -->
        <el-header>
            <el-menu
                :default-active="activeIndex"
                class="el-menu-demo"
                mode="horizontal"
                :ellipsis="false"
                @select="handleSelect"
            >
                <el-menu-item > <!-- logo -->
                <img 
                    style="width: 100px"
                    src="/src/assets/vue.svg"
                    alt="Element logo"
                />
                </el-menu-item> 
                <!-- 导航栏按钮 -->
                 <el-menu-item index="default">首页</el-menu-item>
                <el-menu-item index="Shenbao">价值户申报</el-menu-item>
                <el-menu-item index="Mingxi">价值户明细</el-menu-item>
                <!-- 管理员专属菜单 - 动态显示 -->
                <el-sub-menu 
                    v-if="isAdmin" 
                    index="SystemSetting"
                    popper-class="admin-submenu"
                >
                    <template #title>
                        <span>系统设置</span>
                    </template>
                    <el-menu-item index="UserManagement">用户管理</el-menu-item>
                    <el-menu-item index="DataImport">基础数据导入</el-menu-item>
                </el-sub-menu>

                <el-menu-item index="changepwd">修改密码</el-menu-item>
                <el-menu-item index='logout'>退出登录</el-menu-item>
            </el-menu>
        </el-header>
            <!-- 主体内容区 -->
        <el-main>
            <component :is="currentComponent" />
        </el-main>
    </el-container>
  
</template>

<script setup>
// 引用组件库
import { ref, shallowRef, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

// 导航栏子页面初始化     所有导航栏子页面只需要在该vue进行初始化和使用
import DefaultPage from './subviews/DefaultPage.vue'
import Shenbao from './subviews/Shenbao.vue'         
import Mingxi from './subviews/Mingxi.vue'
import Changepwd from './subviews/Changepwd.vue'
// import UserManagement from './subviews/UserManagement.vue'
// import DataImport from './subviews/DataImport.vue'


//登陆相关
const store = useStore()
const router = useRouter()

// 计算属性：判断当前用户是否为管理员
const isAdmin = computed(() => {
  const adminRoles = ['admin', '分行管理员', '机构管理员']; // 可扩展管理员角色列表
  return adminRoles.includes(store.state.user?.roleid);
});

const activeTab = ref('shenbao')
const currentComponent = shallowRef(DefaultPage)    // shallowRef子页面切换
const activeIndex = ref('1') // 定义并初始化

const handleSelect = (key) => {
    activeTab.value = key
    activeIndex.value = key
    switch (key) {  //导航栏按钮切换
    case 'Shenbao':
        currentComponent.value = Shenbao
        break
    case 'Mingxi':
        currentComponent.value = Mingxi
        break
    case 'changepwd':
        console.log(key)
        currentComponent.value = Changepwd
        break
    case 'logout':
        store.dispatch('logout')
        router.push('/login')
        break
    case 'UserManagement':
        currentComponent.value = UserManagement
        break
    case 'DataImport':
        currentComponent.value = DataImport
        break
    default:
        currentComponent.value = DefaultPage
        break
    }
}

// 组件挂载时检查用户角色
onMounted(() => {
    console.log('当前用户角色:', store.state.user?.roleid)
})
</script>


<style scoped>
.el-menu--horizontal > .el-menu-item:nth-child(4) {
  margin-right: auto;
}
</style>