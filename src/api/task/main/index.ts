import request from '@/config/axios'

export interface TaskMainVO {
  id: number
  no: string
  name: string
  contractId: number
  contractName?: string
  content: string
  status: number
  processInstanceId?: string
  auditStatus: number
  priority: number
  startTime: Date
  endTime: Date
  remindTime: Date
  ownerUserId: number
  ownerUserName?: string
  remark: string
  tags: string
  subTasks: TaskSubVO[]
  createTime?: Date
  creator: string
  creatorName: string
  updateTime?: Date
}

export interface TaskSubVO {
  id: number
  mainId: number
  name: string
  content: string
  status: number
  priority: number
  startTime: Date
  endTime: Date
  ownerUserId: number
  ownerUserName?: string
  remark: string
  createTime?: Date
  creator: string
  creatorName: string
  updateTime?: Date
}

// 子任务表单（前端新增/编辑用，不含 mainId/creator 等后端生成字段）
export interface TaskSubFormVO {
  id?: number
  name?: string
  content?: string
  status: number
  priority: number
  startTime?: Date
  endTime?: Date
  ownerUserId?: number
  remark?: string
}

// 主任务表单（前端新增/发起/编辑用，不含 no/auditStatus/creator 等后端生成字段）
export interface TaskMainFormVO {
  id?: number
  name?: string
  contractId?: number
  content?: string
  status: number
  priority: number
  startTime?: Date
  endTime?: Date
  remindTime?: Date
  ownerUserId?: number
  remark?: string
  tags?: string
  subTasks: TaskSubFormVO[]
}

// 查询任务主表分页列表
export const getTaskMainPage = async (params: any) => {
  return await request.get({ url: `/task/main/page`, params })
}

// 查询任务主表详情
export const getTaskMain = async (id: number) => {
  return await request.get({ url: `/task/main/get?id=` + id })
}

// 新增任务主表
export const createTaskMain = async (data: TaskMainVO) => {
  return await request.post({ url: `/task/main/create`, data })
}

// 新增任务主表，并发起任务审批流程（BPM 业务表单提交用）
// draftId：来自「待提交」草稿提交时传入，后端发起流程后标记草稿为已提交
export const createTaskMainWithProcess = async (data: TaskMainVO, draftId?: number) => {
  return await request.post({
    url: `/task/main/create-with-process` + (draftId ? `?draftId=${draftId}` : ''),
    data
  })
}

// 修改任务主表
export const updateTaskMain = async (data: TaskMainVO) => {
  return await request.put({ url: `/task/main/update`, data })
}

/** 任务编辑权限：是否允许 + 表单字段权限（字段名 -> 权限：'1' 只读 / '2' 可编辑 / '3' 隐藏） + 表单字段必填 */
export interface TaskMainUpdatePermissionVO {
  allowed: boolean
  fieldsPermission?: Record<string, string>
  fieldsRequired?: string[]
}

// 校验当前用户是否可编辑任务（审批中时，校验当前用户是否为配置了可编辑字段的审批节点负责人）
export const checkTaskMainUpdatePermission = async (id: number) => {
  return await request.get({
    url: `/task/main/check-update-permission?id=` + id
  }) as unknown as Promise<TaskMainUpdatePermissionVO>
}

// 删除任务主表
export const deleteTaskMain = async (id: number) => {
  return await request.delete({ url: `/task/main/delete?id=` + id })
}

// 导出任务主表 Excel
export const exportTaskMain = async (params: any) => {
  return await request.download({ url: `/task/main/export-excel`, params })
}

// 提交任务审批（发起审批流程）
export const startTaskProcess = async (id: number) => {
  return await request.put({ url: `/task/main/start-process?id=` + id })
}

// 更新任务主表状态
export const updateTaskMainStatus = async (id: number, status: number) => {
  return await request.put({ url: `/task/main/update-status?id=${id}&status=${status}` })
}

// 更新子任务状态
export const updateSubTaskStatus = async (id: number, status: number) => {
  return await request.put({ url: `/task/main/sub/update-status?id=${id}&status=${status}` })
}
