<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <el-form-item label="任务名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入任务名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="关联合同" prop="contractId">
        <el-select
          v-model="queryParams.contractId"
          class="!w-240px"
          clearable
          placeholder="请选择合同"
          value-key="id"
          filterable
        >
          <el-option
            v-for="item in contractList"
            :key="item.id"
            :label="item.name"
            :value="item.id!"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          class="!w-200px"
          clearable
          placeholder="请选择状态"
        >
          <el-option
            v-for="dict in taskStatusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-select
          v-model="queryParams.priority"
          class="!w-200px"
          clearable
          placeholder="请选择优先级"
        >
          <el-option
            v-for="dict in taskPriorityOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
        <el-button v-hasPermi="['task:main:create']" type="primary" @click="openForm('create')">
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
        <el-button
          v-hasPermi="['task:main:query']"
          :loading="exportLoading"
          plain
          type="success"
          @click="handleExport"
        >
          <Icon class="mr-5px" icon="ep:download" />
          导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" :stripe="true">
      <el-table-column align="center" label="任务编号" prop="no" width="140" />
      <el-table-column align="center" label="任务名称" prop="name" width="180">
        <template #default="scope">
          <el-link :underline="false" type="primary" @click="openDetail(scope.row.id)">
            {{ scope.row.name }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column align="center" label="关联合同" width="160">
        <template #default="scope">
          <el-link
            :underline="false"
            type="primary"
            @click="openContractDetail(scope.row.contractId)"
          >
            {{ scope.row.contractName }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" width="100">
        <template #default="scope">
          <el-tag
            :color="getStatusColor(scope.row.status)"
            effect="dark"
            size="small"
          >
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="审批状态" width="110">
        <template #default="scope">
          <el-tag
            :color="getAuditStatusColor(scope.row.auditStatus)"
            effect="dark"
            size="small"
          >
            {{ getAuditStatusLabel(scope.row.auditStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="优先级" width="100">
        <template #default="scope">
          <el-tag :color="getPriorityColor(scope.row.priority)" effect="dark" size="small">
            {{ getPriorityLabel(scope.row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="负责人" prop="ownerUserName" width="120" />
      <el-table-column align="center" label="子任务" width="80">
        <template #default="scope">
          <span>{{ scope.row.subTasks ? scope.row.subTasks.length : 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="截止时间" width="120">
        <template #default="scope">
          {{ scope.row.endTime ? formatDate(scope.row.endTime) : '-' }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" width="120">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="260">
        <template #default="scope">
          <el-button
            v-if="scope.row.auditStatus === 0 || scope.row.auditStatus === 10"
            v-hasPermi="['task:main:update']"
            link
            type="primary"
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            v-if="scope.row.auditStatus === 0"
            v-hasPermi="['task:main:update']"
            link
            type="primary"
            @click="handleStartProcess(scope.row)"
          >
            提交审批
          </el-button>
          <el-button
            v-else
            v-hasPermi="['task:main:query']"
            link
            type="primary"
            @click="handleProcessDetail(scope.row)"
          >
            查看审批
          </el-button>
          <el-button link type="primary" @click="openDetail(scope.row.id)">
            详情
          </el-button>
          <el-button
            v-hasPermi="['task:main:delete']"
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <TaskMainForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import * as TaskMainApi from '@/api/task/main'
import TaskMainForm from './TaskMainForm.vue'
import { formatDate } from '@/utils/formatTime'
import download from '@/utils/download'
import * as ContractApi from '@/api/crm/contract'

defineOptions({ name: 'TaskMain' })

const message = useMessage()
const { t } = useI18n()

// 任务状态选项
const taskStatusOptions = ref([
  { label: '未开始', value: 0 },
  { label: '进行中', value: 1 },
  { label: '已完成', value: 2 },
  { label: '已取消', value: 3 }
])

// 任务优先级选项
const taskPriorityOptions = ref([
  { label: '低', value: 0 },
  { label: '中', value: 1 },
  { label: '高', value: 2 },
  { label: '紧急', value: 3 }
])

const loading = ref(true)
const total = ref(0)
const list = ref([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: null,
  contractId: null,
  status: null,
  priority: null
})
const queryFormRef = ref()
const exportLoading = ref(false)
const contractList = ref<any[]>([])

const getList = async () => {
  loading.value = true
  try {
    const data = await TaskMainApi.getTaskMainPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

const formRef = ref()
const openForm = (
  type: string,
  id?: number,
  fieldPermissions?: Record<string, string>,
  fieldRequired?: string[]
) => {
  formRef.value.open(type, id, fieldPermissions, fieldRequired)
}

/** 编辑：审批中时，先校验当前用户的编辑权限（须为配置了可编辑字段的审批节点负责人）；非可编辑字段禁用编辑 */
const handleEdit = async (row: TaskMainApi.TaskMainVO) => {
  let fieldPermissions: Record<string, string> | undefined
  let fieldRequired: string[] | undefined
  if (row.auditStatus === 10) {
    const permission = await TaskMainApi.checkTaskMainUpdatePermission(row.id)
    if (!permission.allowed) {
      message.error('任务审批中，仅配置了可编辑字段的审批节点负责人可编辑')
      return
    }
    fieldPermissions = permission.fieldsPermission
    fieldRequired = permission.fieldsRequired
  }
  openForm('update', row.id, fieldPermissions, fieldRequired)
}

const handleStartProcess = async (row: any) => {
  try {
    await message.confirm(`确定对任务「${row.name}」发起审批流程吗？`)
    await TaskMainApi.startTaskProcess(row.id)
    message.success('已发起审批')
    await getList()
  } catch {}
}

/** 查看审批 */
const handleProcessDetail = (row: TaskMainApi.TaskMainVO) => {
  push({ name: 'BpmProcessInstanceDetail', query: { id: row.processInstanceId } })
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await TaskMainApi.deleteTaskMain(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await TaskMainApi.exportTaskMain(queryParams)
    download.excel(data, '任务.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

const openDetail = (id: number) => {
  openForm('update', id)
}

const openContractDetail = (id: number) => {
  push({ name: 'CrmContractDetail', params: { id } })
}

const getStatusColor = (status) => {
  const colors = ['#909399', '#409EFF', '#67C23A', '#F56C6C']
  return colors[status] || '#909399'
}

const getStatusLabel = (status) => {
  const labels = ['未开始', '进行中', '已完成', '已取消']
  return labels[status] || '未知'
}

const getPriorityColor = (priority) => {
  const colors = ['#909399', '#409EFF', '#E6A23C', '#F56C6C']
  return colors[priority] || '#909399'
}

const getPriorityLabel = (priority) => {
  const labels = ['低', '中', '高', '紧急']
  return labels[priority] || '中'
}

const getAuditStatusColor = (status) => {
  const colors: Record<number, string> = {
    0: '#909399', // 未提交
    10: '#409EFF', // 审批中
    20: '#67C23A', // 审核通过
    30: '#F56C6C', // 审核不通过
    40: '#E6A23C' // 已取消
  }
  return colors[status] || '#909399'
}

const getAuditStatusLabel = (status) => {
  const labels: Record<number, string> = {
    0: '未提交',
    10: '审批中',
    20: '审核通过',
    30: '审核不通过',
    40: '已取消'
  }
  return labels[status] || '未知'
}

const { push } = useRouter()

onMounted(async () => {
  await getList()
  contractList.value = await ContractApi.getContractSimpleList()
})
</script>
