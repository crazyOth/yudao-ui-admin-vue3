<template>
  <ContentWrap v-loading="detailLoading">
    <el-descriptions :column="2" border>
      <el-descriptions-item
        v-if="!isFieldHidden('no')"
        :label-class-name="requiredLabelClass('no')"
        label="任务编号"
      >
        {{ detail.no }}
      </el-descriptions-item>
      <el-descriptions-item
        v-if="!isFieldHidden('name')"
        :label-class-name="requiredLabelClass('name')"
        label="任务名称"
      >
        <el-input v-if="isFieldWritable('name')" v-model="detail.name" class="!w-200px" />
        <span v-else>{{ detail.name }}</span>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="!isFieldHidden('contractId')"
        :label-class-name="requiredLabelClass('contractId')"
        label="关联合同"
      >
        <el-select
          v-if="isFieldWritable('contractId')"
          v-model="detail.contractId"
          filterable
          class="!w-200px"
        >
          <el-option
            v-for="item in contractList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
        <span v-else>{{ detail.contractName || detail.contractId }}</span>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="!isFieldHidden('status')"
        :label-class-name="requiredLabelClass('status')"
        label="状态"
      >
        <el-select v-if="isFieldWritable('status')" v-model="detail.status" class="!w-200px">
          <el-option
            v-for="item in taskStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-tag v-else :type="statusTagType(detail.status)">{{
          statusLabel(detail.status)
        }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="!isFieldHidden('priority')"
        :label-class-name="requiredLabelClass('priority')"
        label="优先级"
      >
        <el-select v-if="isFieldWritable('priority')" v-model="detail.priority" class="!w-200px">
          <el-option
            v-for="item in taskPriorityOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-tag v-else :type="priorityTagType(detail.priority)">
          {{ priorityLabel(detail.priority) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="!isFieldHidden('ownerUserId')"
        :label-class-name="requiredLabelClass('ownerUserId')"
        label="负责人"
      >
        <el-select
          v-if="isFieldWritable('ownerUserId')"
          v-model="detail.ownerUserId"
          filterable
          class="!w-200px"
        >
          <el-option
            v-for="user in userOptions"
            :key="user.id"
            :label="user.nickname"
            :value="user.id"
          />
        </el-select>
        <span v-else>{{ detail.ownerUserName || detail.ownerUserId }}</span>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="!isFieldHidden('startTime')"
        :label-class-name="requiredLabelClass('startTime')"
        label="开始时间"
      >
        <el-date-picker
          v-if="isFieldWritable('startTime')"
          v-model="detail.startTime"
          type="datetime"
          class="!w-200px"
        />
        <span v-else>{{ formatDate(detail.startTime) }}</span>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="!isFieldHidden('endTime')"
        :label-class-name="requiredLabelClass('endTime')"
        label="截止时间"
      >
        <el-date-picker
          v-if="isFieldWritable('endTime')"
          v-model="detail.endTime"
          type="datetime"
          class="!w-200px"
        />
        <span v-else>{{ formatDate(detail.endTime) }}</span>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="!isFieldHidden('remindTime')"
        :label-class-name="requiredLabelClass('remindTime')"
        label="提醒时间"
      >
        <el-date-picker
          v-if="isFieldWritable('remindTime')"
          v-model="detail.remindTime"
          type="datetime"
          class="!w-200px"
        />
        <span v-else>{{ formatDate(detail.remindTime) }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="创建人">
        {{ detail.creatorName || detail.creator }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间" :span="2">
        {{ formatDate(detail.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item
        v-if="!isFieldHidden('content')"
        :label-class-name="requiredLabelClass('content')"
        label="任务描述"
        :span="2"
      >
        <el-input
          v-if="isFieldWritable('content')"
          v-model="detail.content"
          type="textarea"
          :rows="3"
        />
        <span v-else>{{ detail.content || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="!isFieldHidden('tags')"
        :label-class-name="requiredLabelClass('tags')"
        label="标签"
      >
        <el-input
          v-if="isFieldWritable('tags')"
          v-model="detail.tags"
          placeholder="多个标签用逗号分隔"
          class="!w-200px"
        />
        <span v-else>{{ detail.tags || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="!isFieldHidden('remark')"
        :label-class-name="requiredLabelClass('remark')"
        label="备注"
      >
        <el-input
          v-if="isFieldWritable('remark')"
          v-model="detail.remark"
          type="textarea"
          :rows="2"
          class="!w-300px"
        />
        <span v-else>{{ detail.remark || '-' }}</span>
      </el-descriptions-item>
    </el-descriptions>

    <el-divider content-position="left">
      <span v-if="isFieldRequired('subTasks')" class="field-required-asterisk">*</span>
      子任务列表
    </el-divider>

    <!-- 子任务可编辑（审批节点配置了 subTasks 可编辑）：行内编辑 -->
    <el-table v-if="subTasksWritable" :data="detail.subTasks || []" border stripe>
      <el-table-column label="序号" type="index" width="60" align="center" />
      <el-table-column label="子任务名称" min-width="150">
        <template #default="scope">
          <el-input v-model="scope.row.name" placeholder="请输入子任务名称" />
        </template>
      </el-table-column>
      <el-table-column label="负责人" min-width="140">
        <template #default="scope">
          <el-select v-model="scope.row.ownerUserId" filterable placeholder="请选择负责人">
            <el-option
              v-for="user in userOptions"
              :key="user.id"
              :label="user.nickname"
              :value="user.id"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="优先级" min-width="100" align="center">
        <template #default="scope">
          <el-select v-model="scope.row.priority">
            <el-option
              v-for="item in taskPriorityOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="90" align="center">
        <template #default="scope">
          <el-tag :type="statusTagType(scope.row.status)">{{
            statusLabel(scope.row.status)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="截止时间" min-width="180">
        <template #default="scope">
          <el-date-picker v-model="scope.row.endTime" type="datetime" class="!w-full" />
        </template>
      </el-table-column>
      <el-table-column label="描述" min-width="150">
        <template #default="scope">
          <el-input v-model="scope.row.content" placeholder="请输入描述" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="70" align="center">
        <template #default="scope">
          <el-button link type="danger" @click="removeSubTask(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-row v-if="subTasksWritable" justify="center" class="mt-10px">
      <el-button @click="addSubTask" round>+ 添加子任务</el-button>
    </el-row>

    <!-- 子任务只读 -->
    <el-table v-else :data="detail.subTasks || []" border stripe>
      <el-table-column label="序号" type="index" width="60" align="center" />
      <el-table-column label="子任务名称" prop="name" min-width="150" />
      <el-table-column label="负责人" prop="ownerUserName" min-width="100" />
      <el-table-column label="优先级" min-width="80" align="center">
        <template #default="scope">
          <el-tag :type="priorityTagType(scope.row.priority)">
            {{ priorityLabel(scope.row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="80" align="center">
        <template #default="scope">
          <el-tag :type="statusTagType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" min-width="160">
        <template #default="scope">
          {{ formatDate(scope.row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column label="截止时间" min-width="160">
        <template #default="scope">
          {{ formatDate(scope.row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column label="描述" prop="content" min-width="150" show-overflow-tooltip />
    </el-table>

    <!-- 保存（存在可编辑字段时显示） -->
    <el-row v-if="hasWritableField" justify="center" class="mt-15px">
      <el-button type="primary" :loading="saving" @click="handleSave">保 存</el-button>
    </el-row>
  </ContentWrap>
</template>

<script setup lang="ts">
import { formatDate } from '@/utils/formatTime'
import * as TaskMainApi from '@/api/task/main'
import * as ContractApi from '@/api/crm/contract'
import * as UserApi from '@/api/system/user'

defineOptions({ name: 'TaskMainDetail' })

const props = withDefaults(
  defineProps<{
    id: string // 业务键（任务编号）
    fieldPermissions?: Record<string, string> // 表单字段权限（字段名 -> 权限：'1' 只读 / '2' 可编辑 / '3' 隐藏）
    fieldRequired?: string[] // 表单字段必填（字段名数组，仅对可编辑字段生效）
  }>(),
  { fieldPermissions: undefined, fieldRequired: undefined }
)

const message = useMessage()

const detailLoading = ref(false)
const saving = ref(false)
const detail = ref<Partial<TaskMainApi.TaskMainVO>>({})
const contractList = ref<any[]>([])
const userOptions = ref<any[]>([])

const taskStatusOptions = [
  { label: '未开始', value: 0, type: 'info' },
  { label: '进行中', value: 1, type: 'warning' },
  { label: '已完成', value: 2, type: 'success' },
  { label: '已取消', value: 3, type: 'danger' }
] as const
const taskPriorityOptions = [
  { label: '低', value: 0, type: 'info' },
  { label: '中', value: 1, type: 'primary' },
  { label: '高', value: 2, type: 'warning' },
  { label: '紧急', value: 3, type: 'danger' }
] as const

const statusLabel = (value?: number) =>
  taskStatusOptions.find((item) => item.value === value)?.label ?? value ?? '-'
const statusTagType = (value?: number) =>
  taskStatusOptions.find((item) => item.value === value)?.type ?? 'info'
const priorityLabel = (value?: number) =>
  taskPriorityOptions.find((item) => item.value === value)?.label ?? value ?? '-'
const priorityTagType = (value?: number) =>
  taskPriorityOptions.find((item) => item.value === value)?.type ?? 'info'

/** 字段是否可编辑（权限 '2'）；未传 fieldPermissions 时，纯只读页面 */
const isFieldWritable = (field: string) => props.fieldPermissions?.[field] === '2'
/** 字段是否隐藏（权限 '3'） */
const isFieldHidden = (field: string) => props.fieldPermissions?.[field] === '3'
/** 字段是否必填（展示红星） */
const isFieldRequired = (field: string) => props.fieldRequired?.includes(field) ?? false
/** 必填字段标签的样式类（红星） */
const requiredLabelClass = (field: string) =>
  isFieldRequired(field) ? 'is-field-required' : undefined
/** 是否存在可编辑字段（是则显示保存按钮） */
const hasWritableField = computed(() =>
  Object.values(props.fieldPermissions || {}).some((permission) => permission === '2')
)
/** 子任务区是否可编辑（对应实体表单的 subTasks 伪字段） */
const subTasksWritable = computed(() => isFieldWritable('subTasks'))

const addSubTask = () => {
  detail.value.subTasks = detail.value.subTasks || []
  detail.value.subTasks.push({
    name: undefined,
    content: undefined,
    status: 0,
    priority: 1,
    ownerUserId: undefined
  } as unknown as TaskMainApi.TaskSubVO)
}

const removeSubTask = (index: number) => {
  detail.value.subTasks?.splice(index, 1)
}

/** 字段名 -> 中文名称（必填校验的提示用） */
const fieldLabels: Record<string, string> = {
  no: '任务编号',
  name: '任务名称',
  contractId: '关联合同',
  status: '状态',
  priority: '优先级',
  ownerUserId: '负责人',
  startTime: '开始时间',
  endTime: '截止时间',
  remindTime: '提醒时间',
  content: '任务描述',
  tags: '标签',
  remark: '备注',
  subTasks: '子任务'
}

const isEmptyValue = (value: any) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0)

/** 校验必填字段（必填只对可编辑字段生效；后端 update 接口会再次校验）。不通过时提示并返回 false */
const validateRequiredFields = (): boolean => {
  for (const field of props.fieldRequired || []) {
    if (field === 'id' || field === 'no') continue // 非编辑字段，跳过
    const value = field === 'subTasks' ? detail.value.subTasks : (detail.value as any)[field]
    if (isEmptyValue(value)) {
      message.warning(`必填字段【${fieldLabels[field] || field}】不能为空`)
      return false
    }
  }
  return true
}

/** 保存任务（主任务 + 子任务）。返回 false 表示校验失败/保存失败（审批页据此中断审批） */
const handleSave = async (): Promise<boolean> => {
  if (!detail.value.name) {
    message.warning('任务名称不能为空')
    return false
  }
  if (!validateRequiredFields()) {
    return false
  }
  saving.value = true
  try {
    await TaskMainApi.updateTaskMain(detail.value as TaskMainApi.TaskMainVO)
    message.success('保存成功')
    await getDetail()
    return true
  } catch {
    // 请求错误提示已由 axios 拦截器处理
    return false
  } finally {
    saving.value = false
  }
}

/** 获取任务详情 */
const getDetail = async () => {
  if (!props.id) {
    return
  }
  detailLoading.value = true
  try {
    detail.value = (await TaskMainApi.getTaskMain(Number(props.id))) || {}
  } finally {
    detailLoading.value = false
  }
}

onMounted(async () => {
  // 存在可编辑字段时，加载用户列表、合同列表，供下拉框使用
  if (hasWritableField.value) {
    contractList.value = await ContractApi.getContractSimpleList()
    userOptions.value = await UserApi.getSimpleUserList()
  }
  getDetail()
})

// 审批详情页「通过」前会自动调用，先落库可编辑字段的修改
defineExpose({ save: handleSave })
</script>

<style scoped>
/* 必填字段标签的红星 */
:deep(.el-descriptions__label.is-field-required::before) {
  content: '*';
  color: var(--el-color-danger);
  margin-right: 4px;
}

.field-required-asterisk {
  color: var(--el-color-danger);
  margin-right: 4px;
}
</style>
