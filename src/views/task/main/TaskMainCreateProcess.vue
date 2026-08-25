<template>
  <el-row :gutter="20">
    <el-col :span="16">
      <ContentWrap title="任务信息">
        <el-form
          ref="formRef"
          v-loading="formLoading"
          :model="formData"
          :rules="formRules"
          label-width="100px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="任务名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入任务名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="关联合同" prop="contractId">
                <el-select
                  v-model="formData.contractId"
                  placeholder="请选择合同"
                  filterable
                  class="!w-full"
                >
                  <el-option
                    v-for="item in contractList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="状态" prop="status">
                <el-select v-model="formData.status" placeholder="请选择状态" class="!w-full">
                  <el-option
                    v-for="dict in taskStatusOptions"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="优先级" prop="priority">
                <el-select v-model="formData.priority" placeholder="请选择优先级" class="!w-full">
                  <el-option
                    v-for="dict in taskPriorityOptions"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="开始时间" prop="startTime">
                <el-date-picker
                  v-model="formData.startTime"
                  type="datetime"
                  placeholder="选择开始时间"
                  class="!w-full"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="截止时间" prop="endTime">
                <el-date-picker
                  v-model="formData.endTime"
                  type="datetime"
                  placeholder="选择截止时间"
                  class="!w-full"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="提醒时间" prop="remindTime">
                <el-date-picker
                  v-model="formData.remindTime"
                  type="datetime"
                  placeholder="选择提醒时间"
                  class="!w-full"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="负责人" prop="ownerUserId">
                <el-select
                  v-model="formData.ownerUserId"
                  placeholder="请选择负责人"
                  filterable
                  class="!w-full"
                >
                  <el-option
                    v-for="user in userOptions"
                    :key="user.id"
                    :label="user.nickname"
                    :value="user.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="任务描述" prop="content">
            <el-input
              v-model="formData.content"
              type="textarea"
              :rows="3"
              placeholder="请输入任务描述"
            />
          </el-form-item>

          <el-form-item label="标签" prop="tags">
            <el-input
              v-model="formData.tags"
              placeholder="请输入标签，多个标签用逗号分隔"
            />
          </el-form-item>

          <el-divider content-position="left">子任务列表</el-divider>

          <div class="sub-tasks">
            <draggable
              v-model="formData.subTasks"
              item-key="id"
              handle=".drag-handle"
              animation="300"
            >
              <template #item="{ element, index }">
                <div class="sub-task-item">
                  <div class="sub-task-header">
                    <span class="drag-handle">☰</span>
                    <span class="sub-task-index">{{ index + 1 }}</span>
                    <el-button
                      type="danger"
                      size="small"
                      circle
                      @click="removeSubTask(index)"
                    >
                      <Icon icon="ep:delete" />
                    </el-button>
                  </div>
                  <el-row :gutter="10">
                    <el-col :span="12">
                      <el-form-item label="子任务名称" :prop="`subTasks.${index}.name`">
                        <el-input
                          v-model="element.name"
                          placeholder="请输入子任务名称"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="负责人">
                        <el-select
                          v-model="element.ownerUserId"
                          placeholder="请选择负责人"
                          clearable
                          filterable
                          class="!w-full"
                        >
                          <el-option
                            v-for="user in userOptions"
                            :key="user.id"
                            :label="user.nickname"
                            :value="user.id"
                          />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row :gutter="10">
                    <el-col :span="12">
                      <el-form-item label="截止时间">
                        <el-date-picker
                          v-model="element.endTime"
                          type="datetime"
                          placeholder="选择截止时间"
                          class="!w-full"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="优先级">
                        <el-select
                          v-model="element.priority"
                          placeholder="请选择优先级"
                          class="!w-full"
                        >
                          <el-option
                            v-for="dict in taskPriorityOptions"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                          />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-form-item label="描述">
                    <el-input
                      v-model="element.content"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入子任务描述"
                    />
                  </el-form-item>
                </div>
              </template>
            </draggable>

            <el-row justify="center" class="mt-3">
              <el-button @click="addSubTask" round>+ 添加子任务</el-button>
            </el-row>
          </div>

          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
            />
          </el-form-item>

          <el-form-item>
            <el-button :disabled="formLoading" type="primary" @click="submitForm">
              发起审批
            </el-button>
          </el-form-item>
        </el-form>
      </ContentWrap>
    </el-col>

    <!-- 审批相关：流程信息 -->
    <el-col :span="8">
      <ContentWrap title="审批流程" :bodyStyle="{ padding: '0 20px 0' }">
        <ProcessInstanceTimeline
          ref="timelineRef"
          :activity-nodes="activityNodes"
          :show-status-icon="false"
          @select-user-confirm="selectUserConfirm"
        />
      </ContentWrap>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import * as TaskMainApi from '@/api/task/main'
import * as ContractApi from '@/api/crm/contract'
import * as UserApi from '@/api/system/user'
import * as DefinitionApi from '@/api/bpm/definition'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import ProcessInstanceTimeline from '@/views/bpm/processInstance/detail/ProcessInstanceTimeline.vue'
import { CandidateStrategy, NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'
import { ApprovalNodeInfo } from '@/api/bpm/processInstance'
import draggable from 'vuedraggable'
import { useTagsViewStore } from '@/store/modules/tagsView'

defineOptions({ name: 'TaskMainCreateProcess' })

const message = useMessage() // 消息弹窗
const { delView } = useTagsViewStore() // 视图操作
const { push, currentRoute } = useRouter() // 路由
const { query } = useRoute() // 查询参数

const formLoading = ref(false) // 表单的加载中：1）重新发起时的数据加载；2）提交的按钮禁用
const draftId = ref<number>() // 草稿编号（来自「待提交」草稿提交时传入，提交成功后后端标记草稿为已提交）
const formData = ref<TaskMainApi.TaskMainFormVO>({
  name: undefined,
  contractId: undefined,
  content: undefined,
  status: 0,
  priority: 1,
  startTime: undefined,
  endTime: undefined,
  remindTime: undefined,
  ownerUserId: undefined,
  remark: undefined,
  tags: undefined,
  subTasks: []
})
const formRules = reactive({
  name: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
  contractId: [{ required: true, message: '关联合同不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref

const taskStatusOptions = ref([
  { label: '未开始', value: 0 },
  { label: '进行中', value: 1 },
  { label: '已完成', value: 2 },
  { label: '已取消', value: 3 }
])
const taskPriorityOptions = ref([
  { label: '低', value: 0 },
  { label: '中', value: 1 },
  { label: '高', value: 2 },
  { label: '紧急', value: 3 }
])
const contractList = ref<ContractApi.ContractVO[]>([])
const userOptions = ref<UserApi.UserVO[]>([])

const addSubTask = () => {
  formData.value.subTasks.push({
    id: undefined,
    name: undefined,
    content: undefined,
    status: 0,
    priority: 1,
    startTime: undefined,
    endTime: undefined,
    ownerUserId: undefined,
    remark: undefined
  })
}
const removeSubTask = (index: number) => {
  formData.value.subTasks.splice(index, 1)
}

// 审批相关：变量
type StartUserSelectTask = {
  id: string
  name: string
}
type TaskMainCreateProcessData = TaskMainApi.TaskMainVO & {
  startUserSelectAssignees?: Record<string, number[]>
}
const processDefineKey = 'rwgl' // 流程定义 Key
const startUserSelectTasks = ref<StartUserSelectTask[]>([]) // 发起人需要选择审批人的用户任务列表
const startUserSelectAssignees = ref<Record<string, number[]>>({}) // 发起人选择审批人的数据
const tempStartUserSelectAssignees = ref<Record<string, number[]>>({}) // 历史发起人选择审批人的数据，用于每次表单变更时，临时保存
const activityNodes = ref<ProcessInstanceApi.ApprovalNodeInfo[]>([]) // 审批节点信息
const processDefinitionId = ref('')

/** 提交表单 */
const submitForm = async () => {
  // 1.1 校验表单
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 1.2 审批相关：校验指定审批人
  if (startUserSelectTasks.value?.length > 0) {
    for (const userTask of startUserSelectTasks.value) {
      if (
        Array.isArray(startUserSelectAssignees.value[userTask.id]) &&
        startUserSelectAssignees.value[userTask.id].length === 0
      ) {
        return message.warning(`请选择${userTask.name}的审批人`)
      }
    }
  }

  // 2. 提交请求
  formLoading.value = true
  try {
    const data = { ...formData.value } as unknown as TaskMainCreateProcessData
    // 审批相关：设置指定审批人
    if (startUserSelectTasks.value?.length > 0) {
      data.startUserSelectAssignees = startUserSelectAssignees.value
    }
    await TaskMainApi.createTaskMainWithProcess(data, draftId.value)
    message.success('发起成功')
    // 关闭当前 Tab，返回任务列表
    delView(unref(currentRoute))
    await push({ path: '/task/main' })
  } finally {
    formLoading.value = false
  }
}

/** 审批相关：获取审批详情 */
const getApprovalDetail = async () => {
  try {
    const data = await ProcessInstanceApi.getApprovalDetail({
      processDefinitionId: processDefinitionId.value,
      activityId: NodeId.START_USER_NODE_ID,
      // 流程变量，用于节点预测（与后端发起流程时写入的变量保持一致）
      processVariablesStr: JSON.stringify({
        name: formData.value.name,
        contractId: formData.value.contractId,
        priority: formData.value.priority,
        status: formData.value.status
      })
    })

    if (!data) {
      message.error('查询不到审批详情信息！')
      return
    }
    // 获取审批节点，显示 Timeline 的数据
    activityNodes.value = data.activityNodes

    // 获取发起人自选的任务
    startUserSelectTasks.value = data.activityNodes?.filter(
      (node: ApprovalNodeInfo) => CandidateStrategy.START_USER_SELECT === node.candidateStrategy
    )
    // 恢复之前的选择审批人
    if (startUserSelectTasks.value?.length > 0) {
      for (const node of startUserSelectTasks.value) {
        if (
          tempStartUserSelectAssignees.value[node.id] &&
          tempStartUserSelectAssignees.value[node.id].length > 0
        ) {
          startUserSelectAssignees.value[node.id] = tempStartUserSelectAssignees.value[node.id]
        } else {
          startUserSelectAssignees.value[node.id] = []
        }
      }
    }
  } finally {
  }
}

/** 审批相关：选择发起人 */
const selectUserConfirm = (id: string, userList: any[]) => {
  startUserSelectAssignees.value[id] = userList?.map((item: any) => item.id)
}

/** 获取任务数据，用于重新发起时自动填充 */
const getDetail = async (id: number) => {
  try {
    formLoading.value = true
    const data = await TaskMainApi.getTaskMain(id)
    if (!data) {
      message.error('重新发起任务失败，原因：任务数据不存在')
      return
    }
    formData.value = {
      name: data.name,
      contractId: data.contractId,
      content: data.content,
      status: data.status,
      priority: data.priority,
      startTime: data.startTime,
      endTime: data.endTime,
      remindTime: data.remindTime,
      ownerUserId: data.ownerUserId,
      remark: data.remark,
      tags: data.tags,
      subTasks: data.subTasks ?? []
    }
  } finally {
    formLoading.value = false
  }
}

/** 获取草稿数据，用于「待提交」草稿提交时预填业务表单 */
const getDraftDetail = async (id: number) => {
  try {
    formLoading.value = true
    const draft = await ProcessInstanceApi.getProcessDraft(id)
    if (!draft) {
      message.error('草稿数据不存在，请从「待提交」重新进入！')
      return
    }
    const vars = draft.variables ?? {}
    formData.value = {
      name: vars.name,
      contractId: vars.contractId != null ? Number(vars.contractId) : undefined,
      content: vars.content,
      status: 0,
      priority: vars.priority != null ? Number(vars.priority) : 1,
      startTime: undefined,
      endTime: undefined,
      remindTime: undefined,
      ownerUserId: vars.ownerUserId != null ? Number(vars.ownerUserId) : undefined,
      remark: vars.remark,
      tags: vars.tags,
      subTasks: []
    }
  } finally {
    formLoading.value = false
  }
}

/** 初始化 */
onMounted(async () => {
  // 加载合同、用户选项
  contractList.value = await ContractApi.getContractSimpleList()
  userOptions.value = await UserApi.getSimpleUserList()

  // 加载流程定义
  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )
  if (!processDefinitionDetail) {
    message.error('任务审批流程模型未配置，请检查流程标识 rwgl！')
    return
  }
  processDefinitionId.value = processDefinitionDetail.id
  startUserSelectTasks.value = processDefinitionDetail.startUserSelectTasks

  // 如果来自「待提交」草稿提交（draftId），用草稿数据预填表单
  if (query.draftId) {
    draftId.value = Number(query.draftId)
    await getDraftDetail(draftId.value)
  } else if (query.id) {
    // 如果有业务编号（重新发起），加载原有任务数据
    await getDetail(Number(query.id))
  }

  // 审批相关：加载最新的审批详情，主要用于节点预测
  await getApprovalDetail()
})

/** 审批相关：预测流程节点会因为输入的参数值而产生新的预测结果值，所以需重新预测一次 */
watch(
  formData.value,
  (newValue, oldValue) => {
    if (!oldValue) {
      return
    }
    if (newValue && Object.keys(newValue).length > 0) {
      // 记录之前的节点审批人
      tempStartUserSelectAssignees.value = startUserSelectAssignees.value
      startUserSelectAssignees.value = {}
      // 加载最新的审批详情,主要用于节点预测
      getApprovalDetail()
    }
  },
  {
    immediate: true
  }
)
</script>

<style scoped>
.sub-tasks {
  margin-top: 10px;
}

.sub-task-item {
  padding: 15px;
  margin-bottom: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.sub-task-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.drag-handle {
  cursor: move;
  margin-right: 10px;
  font-size: 16px;
}

.sub-task-index {
  font-weight: bold;
  margin-right: 10px;
}
</style>
