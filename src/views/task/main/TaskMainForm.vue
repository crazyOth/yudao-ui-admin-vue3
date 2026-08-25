<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="任务名称" prop="name">
            <el-input
              v-model="formData.name"
              :disabled="!isFieldWritable('name')"
              placeholder="请输入任务名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="关联合同" prop="contractId">
            <el-select
              v-model="formData.contractId"
              :disabled="!isFieldWritable('contractId')"
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
            <el-select
              v-model="formData.status"
              :disabled="!isFieldWritable('status')"
              placeholder="请选择状态"
              class="!w-full"
            >
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
            <el-select
              v-model="formData.priority"
              :disabled="!isFieldWritable('priority')"
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

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              type="datetime"
              :disabled="!isFieldWritable('startTime')"
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
              :disabled="!isFieldWritable('endTime')"
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
              :disabled="!isFieldWritable('remindTime')"
              placeholder="选择提醒时间"
              class="!w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="负责人" prop="ownerUserId">
            <el-select
              v-model="formData.ownerUserId"
              :disabled="!isFieldWritable('ownerUserId')"
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
          :disabled="!isFieldWritable('content')"
          placeholder="请输入任务描述"
        />
      </el-form-item>

      <el-form-item label="标签" prop="tags">
        <el-input
          v-model="formData.tags"
          :disabled="!isFieldWritable('tags')"
          placeholder="请输入标签，多个标签用逗号分隔"
        />
      </el-form-item>

      <el-divider content-position="left">子任务列表</el-divider>

      <div class="sub-tasks" v-if="subTasksWritable">
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
      <!-- 子任务不可编辑时（审批中，subTasks 字段未配置为可编辑），只读展示 -->
      <el-table v-else :data="formData.subTasks || []" border stripe>
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="子任务名称" prop="name" min-width="150" />
        <el-table-column label="负责人" min-width="100">
          <template #default="scope">
            {{ scope.row.ownerUserName || getUserName(scope.row.ownerUserId) }}
          </template>
        </el-table-column>
        <el-table-column label="优先级" min-width="80" align="center">
          <template #default="scope">
            {{ taskPriorityOptions.find((item) => item.value === scope.row.priority)?.label }}
          </template>
        </el-table-column>
        <el-table-column label="截止时间" min-width="160">
          <template #default="scope">
            {{ scope.row.endTime ? formatDate(scope.row.endTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="描述" prop="content" min-width="150" show-overflow-tooltip />
      </el-table>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          :disabled="!isFieldWritable('remark')"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitForm" :disabled="formLoading">
        确 定
      </el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { formatDate } from '@/utils/formatTime'
import * as TaskMainApi from '@/api/task/main'
import * as ContractApi from '@/api/crm/contract'
import * as UserApi from '@/api/system/user'
import draggable from 'vuedraggable'

defineOptions({ name: 'TaskMainForm' })

const { t } = useI18n()
const message = useMessage()

const emit = defineEmits(['success'])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formRef = ref()

const formData = ref<TaskMainApi.TaskMainFormVO>({
  id: undefined,
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

// 字段名 -> 中文名称（动态必填规则的提示用）
const fieldLabels: Record<string, string> = {
  content: '任务描述',
  status: '状态',
  priority: '优先级',
  startTime: '开始时间',
  endTime: '截止时间',
  remindTime: '提醒时间',
  ownerUserId: '负责人',
  remark: '备注',
  tags: '标签'
}

// 表单校验规则。审批中编辑时，为「可编辑 + 必填」的字段动态追加必填规则
const formRules = computed(() => {
  const rules: Record<string, any[]> = {
    name: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
    contractId: [{ required: true, message: '关联合同不能为空', trigger: 'change' }]
  }
  for (const field of fieldRequired.value || []) {
    if (field === 'subTasks' || field === 'no' || field === 'id') continue
    if (!isFieldWritable(field)) continue // 必填只对可编辑字段生效
    rules[field] = [
      { required: true, message: `${fieldLabels[field] || field}不能为空`, trigger: 'change' }
    ]
  }
  return rules
})

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

const contractList = ref<any[]>([])
const userOptions = ref<any[]>([])

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

const removeSubTask = (index) => {
  formData.value.subTasks.splice(index, 1)
}

// 表单字段权限（审批中编辑时，由 check 接口返回）：为空时全字段可编辑
const fieldPermissions = ref<Record<string, string>>()
// 表单字段必填（审批中编辑时，由 check 接口返回，字段名数组）
const fieldRequired = ref<string[]>()

/** 字段是否可编辑：审批中时，仅权限为 '2'（可编辑）的字段可编辑；未提交时全可编辑 */
const isFieldWritable = (field: string) =>
  !fieldPermissions.value || fieldPermissions.value[field] === '2'

/** 子任务区是否可编辑（对应实体表单的 subTasks 伪字段） */
const subTasksWritable = computed(() => isFieldWritable('subTasks'))

/** 从已加载的用户列表中取用户昵称（只读子任务展示用） */
const getUserName = (userId?: number) =>
  userOptions.value.find((user) => user.id === userId)?.nickname ?? userId

const open = async (
  type: string,
  id?: number,
  permissions?: Record<string, string>,
  requiredFields?: string[]
) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增任务' : '编辑任务'
  formType.value = type
  resetForm()
  fieldPermissions.value = permissions
  fieldRequired.value = requiredFields

  // 加载合同列表
  contractList.value = await ContractApi.getContractSimpleList()

  // 加载用户列表
  userOptions.value = await UserApi.getSimpleUserList()

  if (id) {
    formLoading.value = true
    try {
      formData.value = await TaskMainApi.getTaskMain(id)
    } finally {
      formLoading.value = false
    }
  }
}

const resetForm = () => {
  formData.value = {
    id: undefined,
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
  }
  formRef.value?.resetFields()
}

const submitForm = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  // 子任务必填时：至少要有一个子任务
  if (
    (fieldRequired.value || []).includes('subTasks') &&
    (!formData.value.subTasks || formData.value.subTasks.length === 0)
  ) {
    message.warning('子任务为必填项，请至少添加一个子任务')
    return
  }
  formLoading.value = true
  try {
    // 表单类型不含 no/auditStatus/creator 等后端生成字段，提交时转为 VO
    if (formType.value === 'create') {
      await TaskMainApi.createTaskMain(formData.value as TaskMainApi.TaskMainVO)
      message.success(t('common.createSuccess'))
    } else {
      await TaskMainApi.updateTaskMain(formData.value as TaskMainApi.TaskMainVO)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

defineExpose({ open })
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
