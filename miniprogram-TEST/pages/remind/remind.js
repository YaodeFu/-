Page({
  data: {
    parentList: []
  },

  onShow: function() {
    this.loadParentList();
  },

  // 1. 扫码绑定
  handleScan: function() {
    wx.scanCode({
      onlyFromCamera: true, 
      success: (res) => {
        if (res.result) {
          // 增加二次确认
          wx.showModal({
            title: '确认绑定',
            content: '是否关联此家庭成员？',
            confirmColor: '#006a6a',
            success: (sm) => {
              if (sm.confirm) {
                this.bindAction(res.result);
              }
            }
          });
        }
      }
    });
  },

  // 绑定动作逻辑修复
  bindAction: function(p_openid) {
    const c_openid = wx.getStorageSync('openid');
    const currentList = this.data.parentList;

    // 问题1修复：检查是否重复绑定
    const isDuplicate = currentList.some(item => item.parent_openid === p_openid);
    if (isDuplicate) {
      wx.showToast({
        title: '该成员已在列表中',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 问题2修复：检查是否超过5个上限
    if (currentList.length >= 5) {
      wx.showModal({
        title: '人数已满',
        content: '为了保障隐私安全，最多只能绑定5位家人。请先移除不再需要的成员。',
        showCancel: false,
        confirmColor: '#006a6a'
      });
      return;
    }

    // 通过校验后，再发起请求
    wx.showLoading({ title: '绑定中...' });
    wx.request({
      url: 'http://192.168.1.11:5000/bindFamily',
      method: 'POST',
      data: { child_openid: c_openid, parent_openid: p_openid },
      success: (res) => {
        wx.hideLoading();
        // 建议：如果后端有返回具体的状态码，也可以在这里根据 res.data.code 进一步判断
        wx.showToast({ title: '绑定成功', icon: 'success' });
        this.loadParentList();
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络连接失败', icon: 'none' });
      }
    });
  },

  loadParentList: function() {
    const c_openid = wx.getStorageSync('openid');
    if (!c_openid) return;

    wx.request({
      url: 'http://192.168.1.11:5000/getBoundParents',
      data: { child_openid: c_openid },
      success: (res) => {
        if (res.data) {
          this.setData({ parentList: res.data });
        }
      }
    });
  },

  goToParentDetail: function(e) {
    const p_openid = e.currentTarget.dataset.openid;
    wx.navigateTo({
      url: `/pages/archive/archive?external_openid=${p_openid}`
    });
  },

  unBind: function(e) {
    const p_openid = e.currentTarget.dataset.popenid;
    const c_openid = wx.getStorageSync('openid');
    wx.showModal({
      title: '解除关联',
      content: '解除后将无法查看该成员的档案，确定吗？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: 'http://192.168.1.11:5000/unbindFamily',
            method: 'POST',
            data: { child_openid: c_openid, parent_openid: p_openid },
            success: () => {
              wx.showToast({ title: '已解除绑定' });
              this.loadParentList();
            }
          });
        }
      }
    });
  }
})