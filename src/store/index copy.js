import { createStore } from 'vuex'
import axios from 'axios'

export default createStore({
  state: {
    isAuthenticated: false,
    user: null
  },
  mutations: {
    SET_AUTH(state, payload) {
      state.isAuthenticated = payload.isAuthenticated
      state.user = payload.user
    }
  },
  actions: {
    login({ commit }, { username, password }) {
      // 模拟本地用户数据
      const validUsers = [
        { username: 'admin', password: '123456' },
        { username: 'user', password: 'test123' }
      ]
      const user = validUsers.find(u => 
        u.username === username && u.password === password
      )
      if (user) {
        commit('SET_AUTH', { isAuthenticated: true, user })
        return true
      }
      return false
    },
    logout({ commit }) {
      commit('SET_AUTH', { isAuthenticated: false, user: null })
    }
  }
})