import { createStore } from 'vuex';
import axios from 'axios';


// // 全局启用Cookie传递
// axios.defaults.withCredentials = true;

// 初始化时尝试读取本地存储
const savedState = JSON.parse(localStorage.getItem('auth')) || {};

export default createStore({
  state: {
    isAuthenticated: savedState.isAuthenticated || false,
    user: savedState.user || null
  },
  mutations: {
    SET_AUTH(state, payload) {
      state.isAuthenticated = payload.isAuthenticated;
      state.user = payload.user;
      // 状态变化时存入localStorage
      localStorage.setItem('auth', JSON.stringify(payload));
    },
    CLEAR_AUTH(state) {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('auth');
    }
  },
  actions: {
    // 登录接口
    async login({ commit }, { userid, password }) {
      try {
        // 配置跨域凭证传递
        const response = await axios.post('/api/login'
          , { userid, password }
          // , {withCredentials: true}// 关键：发送Cookie
          ); 
        if (response.data.success) {
          // console.log('store/index.js  success')
          commit('SET_AUTH', { 
            isAuthenticated: true, 
            // 保存返回的user信息(在auth.js中返回)
            // login后保存了全部userinfo   后续可在store.state.user里获取到
            user: response.data.user     
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error('store/index.js  登录失败:', error);
        return false;
      }
    },
    
    async changePassword({ state }, { oldPassword, newPassword }) {
      if (!state.user) return false;
      try {
        const response = await axios.post(
          '/api/change-password',
          //密码修改 post时加上userid
          { userid: state.user.userid, oldPassword, newPassword }  
          // ,{ withCredentials: true } // 携带凭证
        );
        return response.data.success;
      } catch (error) {
        console.error('密码修改失败:', error);
        return false;
      }
    },
    // 获取用户名接口
    // login时已经保存了用户名 该接口已弃用
    async get_username({ state }) {
      if (!state.user) return false;
      try {
        const response = await axios.post('/api/get_username'
          ,{userid: state.user.userid}
          ); 
        return response
      } catch (error) {
        console.error('获取用户名失败:', error);
        return null;
      }
    },

    // 首页：获取部门所有价值户户数
    async get_bmjzh_hz({ state }) {
      if (!state.user) return false;
      try {
        const response = await axios.post('/api/get_bmjzh_hz'
          ); 
        if (response.data.success) {
          // 数据库null值 容错
          response.data.data = response.data.data.map(item => ({
            ...item,
            num: item.num ?? 0 // 空值合并为 0
          }));
        } 
        return response
      } catch (error) {
        console.error('数据获取失败:', error);
        return false;
      }
    },

    // 价值户申报页：价值户申报接口
    async declare_jzh({ state }, { kehuhao }) {
      if (!state.user) return false;
      try {
        const response = await axios.post('/api/declare_jzh', {
          kehuhao
        });
        return response;
      } catch (error) {
        // console.error('申报失败:', error);
        // return false;
        // 返回完整错误对象而非false
        return Promise.reject(error); // 将错误传递给组件层
      }
    },

    // 价值户申报页：下载导入模板
    async download_import_template({ state }) {
      if (!state.user) return false;
      try {
        const response = await axios.get('/api/download_import_template', {
          responseType: 'blob'
        });
        return response;
      } catch (error) {
        console.error('下载模板失败:', error);
        return false;
      }
    },

    // 价值户明细页：获取个人名下价值户
    async get_jzhmx_by_username({ state }, { page = 1, pageSize = 15 }) {
      if (!state.user) return false;
      try {
        const response = await axios.post('/api/get_jzhmx_by_username', {
          page,
          pageSize
        });
        return response;
      } catch (error) {
        console.error('获取价值户明细失败:', error);
        return false;
      }
    },

    // 价值户明细页：获取个人名下价值户所属部门
    async get_user_bm_tree({ state }) {
      if (!state.user) return false;
      try {
        const response = null
        return response;
      } catch (error) {
        console.error('获取价值户明细失败:', error);
        return false;
      }
    },

    // 登出接口
    logout({ commit }) {
      commit('CLEAR_AUTH'); // 调用统一清理方法
    }
  }
});