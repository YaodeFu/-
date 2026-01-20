Page({
  showDoc: function(e) {
    const type = e.currentTarget.dataset.type;
    const titles = { 'user': '用户协议', 'privacy': '隐私政策条款' };
    wx.showModal({
      title: titles[type],
      content: '根据合规要求，此处应展示小程序的' + titles[type] + '全文。建议实际运营时跳转至专门的 H5 页面或文档地址。',
      showCancel: false,
      confirmText: '返回'
    });
  }
})