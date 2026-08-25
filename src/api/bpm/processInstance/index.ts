import request from '@/config/axios'
import { ProcessDefinitionVO } from '@/api/bpm/model'
import { NodeType, CandidateStrategy } from '@/components/SimpleProcessDesignerV2/src/consts'
export type Task = {
  id: string
  name: string
}

export type ProcessInstanceVO = {
  id: number
  name: string
  processDefinitionId: string
  category: string
  result: number
  tasks: Task[]
  fields: string[]
  status: number
  remark: string
  businessKey: string
  createTime: string
  endTime: string
  processDefinition?: ProcessDefinitionVO
}

// 用户信息
export type User = {
  id: number
  nickname: string
  avatar: string
}

// 审批任务信息
export type ApprovalTaskInfo = {
  id: number
  ownerUser: User
  assigneeUser: User
  status: number
  reason: string
  attachments?: string[]
  signPicUrl: string
}

// 审批节点信息
export type ApprovalNodeInfo = {
  id: number
  name: string
  nodeType: NodeType
  candidateStrategy?: CandidateStrategy
  status: number
  startTime?: Date
  endTime?: Date
  processInstanceId?: string
  candidateUsers?: User[]
  tasks: ApprovalTaskInfo[]
}

export const getProcessInstanceMyPage = async (params: any) => {
  return await request.get({ url: '/bpm/process-instance/my-page', params })
}

export const getProcessInstanceManagerPage = async (params: any) => {
  return await request.get({ url: '/bpm/process-instance/manager-page', params })
}

export const createProcessInstance = async (data) => {
  return await request.post({ url: '/bpm/process-instance/create', data: data })
}

export const cancelProcessInstanceByStartUser = async (id: number, reason: string) => {
  const data = {
    id: id,
    reason: reason
  }
  return await request.delete({ url: '/bpm/process-instance/cancel-by-start-user', data: data })
}

export const cancelProcessInstanceByAdmin = async (id: number, reason: string) => {
  const data = {
    id: id,
    reason: reason
  }
  return await request.delete({ url: '/bpm/process-instance/cancel-by-admin', data: data })
}

export const getProcessInstance = async (id: string) => {
  return await request.get({ url: '/bpm/process-instance/get?id=' + id })
}

export const getProcessInstanceCopyPage = async (params: any) => {
  return await request.get({ url: '/bpm/process-instance/copy/page', params })
}

// 获取审批详情
export const getApprovalDetail = async (params: any) => {
  return await request.get({ url: '/bpm/process-instance/get-approval-detail', params })
}

// 获取下一个执行的流程节点
export const getNextApprovalNodes = async (params: any) => {
  return await request.get({ url: '/bpm/process-instance/get-next-approval-nodes', params })
}

// 获取表单字段权限
export const getFormFieldsPermission = async (params: any) => {
  return await request.get({ url: '/bpm/process-instance/get-form-fields-permission', params })
}

// 获取流程实例的 BPMN 模型视图
export const getProcessInstanceBpmnModelView = async (id: string) => {
  return await request.get({ url: '/bpm/process-instance/get-bpmn-model-view?id=' + id })
}

// 获取流程实例打印数据
export const getProcessInstancePrintData = async (id: string) => {
  return await request.get({ url: '/bpm/process-instance/get-print-data?processInstanceId=' + id })
}

// ==================== 流程实例草稿 ====================

export interface ProcessDraftVO {
  id: number
  processDefinitionKey: string
  processDefinitionName?: string
  formCustomCreatePath?: string // 业务表单的提交地址（有值时，提交草稿 = 跳转该地址填写业务表单）
  name: string
  businessKey?: string
  variables?: Record<string, any> // 业务表单预填数据
  status: number
  processInstanceId?: string
  submitTime?: string
  createTime: string
}

// 获得我待提交草稿的分页
export const getProcessDraftMyPage = async (params: any) => {
  return await request.get({ url: '/bpm/process-draft/my-page', params })
}

// 获得草稿详情（本人，用于业务表单预填）
export const getProcessDraft = async (id: number) => {
  return await request.get({ url: '/bpm/process-draft/get?id=' + id })
}

// 提交草稿（发起流程），返回流程实例编号
export const submitProcessDraft = async (id: number) => {
  return await request.put({ url: `/bpm/process-draft/submit?id=${id}` })
}

// 删除草稿
export const deleteProcessDraft = async (id: number) => {
  return await request.delete({ url: `/bpm/process-draft/delete?id=${id}` })
}
