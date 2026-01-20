Page({
  data: {
    reportData: {}
  },
  onLoad: function (options) {
    if (options.data) {
      try {
        let data = JSON.parse(decodeURIComponent(options.data));
        
        // 确保 risk_level 是小写，匹配 CSS 类名
        if (data.risk_level) {
          data.risk_level = data.risk_level.toLowerCase();
        } else {
          data.risk_level = 'low'; // 默认值
        }

        this.setData({ reportData: data });
      } catch (e) {
        console.error("解析报告数据失败:", e);
      }
    }
  },
  goBack: function() {
    wx.navigateBack();
  }
})