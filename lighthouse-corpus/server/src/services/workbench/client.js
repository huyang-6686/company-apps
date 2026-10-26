'use strict';
/**
 * 与光工作中台接口抽象层
 * 当前状态：待工作台批准接口契约后实测
 */

class WorkbenchClient {
  constructor() {
    this.baseURL = process.env.WORKBENCH_BASE_URL || 'unknown';
    this.token = null;
  }

  async authenticate(appId, appSecret) {
    // 待与工作台确认鉴权方式（OAuth/Token）
    throw new Error('Workbench authentication not implemented');
  }

  async getUserRole(userId, tenantId) {
    // 待与工作台确认角色字段结构
    throw new Error('getUserRole not implemented');
  }

  async getNodesBySource(sourceId) {
    // 待与工作台确认节点基线接口
    throw new Error('getNodesBySource not implemented');
  }

  async sendEvent(eventType, payload) {
    // 待与工作台确认事件推送接口
    throw new Error('sendEvent not implemented');
  }
}

module.exports = WorkbenchClient;
