Page({
  data: {
    status: "",
    isAnalyzing: false
  },

  handleUpload: function() {
    if(this.data.isAnalyzing) return;
    const that = this;
    
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera', 'album'], // 竞赛演示建议加上 album 方便调试
      success(res) {
        that.setData({ 
          status: "图片捕获成功，后台解析中...",
          isAnalyzing: true 
        });
        that.uploadFile(res.tempFiles[0].tempFilePath);
      },
      fail(err) {
        that.setData({ status: "未捕获图片", isAnalyzing: false });
      }
    })
  },

  uploadFile: function(tempFilePath) {
    const openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      this.setData({ isAnalyzing: false });
      return;
    }

    wx.uploadFile({
      url: 'http://192.168.1.11:5000/getRandomReport?openid=' + openid, 
      filePath: tempFilePath,
      name: 'file',
      success: (res) => {
        if (res.statusCode === 200) {
          wx.navigateTo({
            url: `/pages/report/report?data=${encodeURIComponent(res.data)}&imgPath=${encodeURIComponent(tempFilePath)}`
          });
        } else {
          wx.showToast({ title: '解析失败', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络连接异常', icon: 'none' });
      },
      complete: () => {
        this.setData({ isAnalyzing: false });
      }
    });
  }
})