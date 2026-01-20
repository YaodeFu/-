Page({
  data: {
    isLogin: false,
    fullOpenId: '',
    recordCount: 0,
    familyCount: 0
  },

  onShow: function() {
    this.checkStatus();
  },

  // 检查登录状态
  checkStatus: function() {
    const openid = wx.getStorageSync('openid');
    if (openid) {
      this.setData({
        isLogin: true,
        fullOpenId: openid
      });
      this.fetchStats(openid);
    } else {
      this.setData({ isLogin: false });
    }
  },

  // 获取真实的统计数据
  fetchStats: function(openid) {
    wx.request({
      url: 'http://192.168.1.11:5000/getHistory',
      data: { openid: openid },
      success: (res) => {
        if (Array.isArray(res.data)) {
          this.setData({ recordCount: res.data.length });
        }
      }
    });

    wx.request({
      url: 'http://192.168.1.11:5000/getBoundParents',
      data: { child_openid: openid },
      success: (res) => {
        if (Array.isArray(res.data)) {
          this.setData({ familyCount: res.data.length });
        }
      }
    });
  },

  // --- 核心逻辑：登录并跳转 ---
  handleLogin: function() {
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.showLoading({ title: '正在登录' });
          
          wx.request({
            url: 'http://192.168.1.11:5000/login', // 替换为你的后端IP
            method: 'POST',
            data: { code: res.code },
            success: (serverRes) => {
              if (serverRes.data.openid) {
                // 1. 存储 OpenID 到本地缓存
                wx.setStorageSync('openid', serverRes.data.openid);
                
                // 2. 更新当前页面的登录状态 UI
                this.checkStatus();

                // 3. 登录成功提示
                wx.hideLoading();
                wx.showToast({
                  title: '登录成功',
                  icon: 'success',
                  duration: 1000
                });

                // 4. 延迟跳转到 Home 页面
                // 使用 reLaunch 是为了清空页面栈，防止用户点击左上角又回到登录引导页
                setTimeout(() => {
                  wx.reLaunch({
                    url: '/pages/home/home'
                  });
                }, 1000);

              } else {
                wx.hideLoading();
                wx.showModal({ title: '登录失败', content: '未能获取有效OpenID', showCancel: false });
              }
            },
            fail: () => {
              wx.hideLoading();
              wx.showToast({ title: '服务器连接失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  // 退出登录
  handleLogout: function() {
    wx.showModal({
      title: '提示',
      content: '确定退出并清除登录状态吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('openid');
          this.checkStatus();
        }
      }
    });
  },

  // 跳转逻辑
  navToArchive: function() { wx.navigateTo({ url: '/pages/archive/archive' }); },
  navToRemind: function() { wx.navigateTo({ url: '/pages/remind/remind' }); },
  navToAbout: function() { wx.navigateTo({ url: '/pages/about/about' }); },
  showCleanCache: function() { wx.showToast({ title: '清理完成', icon: 'success' }); }
})