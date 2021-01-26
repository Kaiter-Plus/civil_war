import axios from 'axios'

export function request(config) {
  // 1. 创建 axios 实例
  const instance = axios.create({
    baseURL: './json',
    timeout: 5000
  })
  // 2. axios 拦截器
  // 2.1. 拦截请求（当前实例拦截，使用全局拦截直接使用全局 axios 对象即可）
  instance.interceptors.request.use(config => {
    // 请求成功时拦截
    // console.log(config)
    // 处理完之后需要返回
    return config
  }, error => {
    // 请求失败时拦截
    console.log(error)
  })
  // 2.2. 拦截响应
  instance.interceptors.response.use(res => {
    // 响应成功时拦截
    // console.log(res)
    // 处理数据，直接返回需要的 data
    return res.data
  }, error => {
    // 响应失败时拦截
    console.log(error)
  })

  // 3. 发送网络请求
  return instance(config)
}