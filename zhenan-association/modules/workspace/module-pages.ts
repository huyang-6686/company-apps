import { findNavigationItem, type NavigationItem } from "./navigation";

export type ModulePageDefinition = NavigationItem & {
  description: string;
  status: "待接入" | "测试中";
  views: readonly string[];
};

const descriptions: Record<string, string> = {
  "会员台账": "统一查看单位信息、会员类型和当前状态。",
  "入会管理": "核验外部资料、记录补正状态并准备归档。",
  "会费标准": "维护身份档位、年度金额和生效附件。",
  "会费收缴": "查看年度应收、缴费核销和缴清状态。",
  "欠费管理": "集中查看欠费单位并保留催缴记录。",
  "收支台账": "管理收入、支出、分类和凭证关联。",
  "支出申请": "查看外部审批镜像和回流流水草稿。",
  "期间报表": "按月度、季度和年度查看收支构成。",
  "用印记录": "查看飞书用印审批镜像和回流状态。",
  "档案目录": "维护档案条目、档号和业务关联。",
  "著录管理": "维护题名、责任者、日期、分类和保管信息。",
  "归档任务": "跟进自动或手动归档任务和超期提醒。",
  "文件关联": "查看网盘路径、版本和业务文件关联。",
  "档案流转": "记录借阅、归还和移交状态。",
  "回收站": "查看软删除记录和网盘同步状态。",
  "补充账号": "管理长期协作者、临时访客和有效期回收。",
  "组织同步": "查看与光项目节点、成员和同步批次。",
  "权限审计": "只读查看与光下发绑定、数据范围和审计。",
  "集成配置": "管理钉钉、与光、飞书和网盘的配置引用。",
  "审计记录": "查看登录、变更、导出和回调审计。",
  "通知投递": "查看通知投递状态、失败原因和重试记录。",
};

const viewMap: Record<string, readonly string[]> = {
  "会员台账": ["单位会员", "类型与身份", "状态变更"],
  "入会管理": ["资料核验", "补正状态", "归档草稿"],
  "会费标准": ["年度金额", "生效记录", "表决附件"],
  "会费收缴": ["年度应收", "缴费核销", "缴清状态"],
  "欠费管理": ["欠费视图", "催缴记录"],
  "集成配置": ["平台配置", "回调通道", "凭据引用"],
  "通知投递": ["投递状态", "失败记录", "重试审计"],
};

export function getModulePageDefinition(route: string): ModulePageDefinition | undefined {
  const item = findNavigationItem(route);
  if (!item || item.route === "/membership/units") return undefined;

  return {
    ...item,
    description: descriptions[item.label] ?? "查看和管理本模块业务信息。",
    status: "待接入",
    views: viewMap[item.label] ?? ["列表视图", "状态视图", "操作记录"],
  };
}
