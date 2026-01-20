Page({
  data: {
    myOpenid: '',
    historyRecords: [],
    showQR: true,
    qrVisible: false
  },

  onLoad: function (options) {
    if (options.external_openid) {
      this.setData({ 
        myOpenid: options.external_openid,
        showQR: false 
      });
    }
  },

  onShow: function () {
    if (!this.data.myOpenid) {
      const openid = wx.getStorageSync('openid');
      if (openid) {
        this.setData({ myOpenid: openid, showQR: true });
      }
    }
    if (this.data.myOpenid) {
      this.fetchRecords(this.data.myOpenid);
    }
  },

  fetchRecords: function (openid) {
    wx.request({
      url: 'http://192.168.1.11:5000/getHistory',
      method: 'GET',
      data: { openid: openid },
      success: (res) => {
        if (res.statusCode === 200) {
          // 数据清洗：统一风险等级字段值，确保 CSS 类名匹配
          const cleanedData = res.data.map(item => {
            let level = item.risk_level ? item.risk_level.toLowerCase() : 'low';
            if (level.includes('low')) level = 'low';
            if (level.includes('high')) level = 'high';
            if (level.includes('medium')) level = 'medium';
            return { ...item, risk_level: level };
          });
          this.setData({ historyRecords: cleanedData });
        }
      }
    });
  },

  viewDetail: function(e) {
    const item = e.currentTarget.dataset.item;
    const recordStr = encodeURIComponent(JSON.stringify(item));
    wx.navigateTo({
      url: `/pages/report/report?data=${recordStr}`
    });
  },

  showMyQR: function() { this.setData({ qrVisible: true }); },
  
  copyId: function () {
    wx.setClipboardData({
      data: this.data.myOpenid,
      success: () => wx.showToast({ title: '识别码已复制' })
    });
  }
})