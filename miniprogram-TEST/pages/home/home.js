Page({
  onShow: function() {
    const openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.reLaunch({ url: '/pages/login/login' });
    }
  },

  // 增加跳转延迟，确保用户能看清 Q弹 的回跳动作
  navWithAnim: function(url) {
    setTimeout(() => {
      wx.navigateTo({ url: url });
    }, 150);
  },

  navToCenter: function() { this.navWithAnim('/pages/login/login'); },
  navToScan: function() { this.navWithAnim('/pages/GetImage/GetImage'); },
  navToArchive: function() { this.navWithAnim('/pages/archive/archive'); },
  navToRemind: function() { this.navWithAnim('/pages/remind/remind'); }
})