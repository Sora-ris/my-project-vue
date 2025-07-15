import { createApp } from 'vue'
// 导入自己写的组件
import App from './App.vue'       //vue的根组件 固定写法
import router from './router'
import store from './store'
// 导入样式库
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
// 将组件注册为全局可使用
// vue中调用全局组件 需使用组合式api写法，
// 即import写法 参考home.vue中的store调用方法
app.use(router)
app.use(store)
app.use(ElementPlus)

app.mount('#app')

