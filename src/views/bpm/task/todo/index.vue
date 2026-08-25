<template>
  <doc-alert title="审批通过、不通过、驳回" url="https://doc.iocoder.cn/bpm/task-todo-done/" />
  <doc-alert title="审批加签、减签" url="https://doc.iocoder.cn/bpm/sign/" />
  <doc-alert
    title="审批转办、委派、抄送"
    url="https://doc.iocoder.cn/bpm/task-delegation-and-cc/"
  />
  <doc-alert title="审批加签、减签" url="https://doc.iocoder.cn/bpm/sign/" />

  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <el-form-item label="" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入任务名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
      </el-form-item>
      <el-form-item label="" prop="category" class="absolute right-130px">
        <el-select
          v-model="queryParams.category"
          placeholder="请选择流程分类"
          clearable
          class="!w-155px"
          @change="handleQuery"
        >
          <el-option
            v-for="category in categoryList"
            :key="category.code"
            :label="category.name"
            :value="category.code"
          />
        </el-select>
      </el-form-item>
      <!-- 高级筛选 -->
      <el-form-item class="absolute right-0">
        <el-popover
          :visible="showPopover"
          persistent
          :width="400"
          :show-arrow="false"
          placement="bottom-end"
        >
          <template #reference>
            <el-button @click="showPopover = !showPopover">
              <Icon icon="ep:plus" class="mr-5px" />高级筛选
            </el-button>
          </template>
          <el-form-item
            label="所属流程"
            class="font-bold"
            label-position="top"
            prop="processDefinitionKey"
          >
            <el-select
              v-model="queryParams.processDefinitionKey"
              placeholder="请选择流程定义"
              clearable
              @change="handleQuery"
              class="!w-390px"
            >
              <el-option
                v-for="item in processDefinitionList"
                :key="item.key"
                :label="item.name"
                :value="item.key"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="发起时间" class="font-bold" label-position="top" prop="createTime">
            <el-date-picker
              v-model="queryParams.createTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
              class="w-240px!"
            />
          </el-form-item>
          <el-form-item class="font-bold" label-position="top">
            <div class="flex justify-end w-full">
              <el-button @click="resetQuery">清空</el-button>
              <el-button @click="showPopover = false">取消</el-button>
              <el-button type="primary" @click="handleQuery">确认</el-button>
            </div>
          </el-form-item>
        </el-popover>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <!-- 待办 -->
      <el-tab-pane label="待办" name="todo">
        <el-table v-loading="loading" :data="list">
          <el-table-column align="center" label="流程" prop="processInstance.name" width="180" />
          <el-table-column label="摘要" prop="processInstance.summary" width="180">
            <template #default="scope">
              <div
                class="flex flex-col"
                v-if="scope.row.processInstance.summary && scope.row.processInstance.summary.length > 0"
              >
                <div v-for="(item, index) in scope.row.processInstance.summary" :key="index">
                  <el-text type="info"> {{ item.key }} : {{ item.value }} </el-text>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="发起人"
            prop="processInstance.startUser.nickname"
            width="100"
          />
          <el-table-column
            :formatter="dateFormatter"
            align="center"
            label="发起时间"
            prop="processInstance.createTime"
            width="180"
          />
          <el-table-column align="center" label="当前任务" prop="name" width="180" />
          <el-table-column
            :formatter="dateFormatter"
            align="center"
            label="任务时间"
            prop="createTime"
            width="180"
          />
          <el-table-column
            align="center"
            label="流程编号"
            prop="processInstanceId"
            :show-overflow-tooltip="true"
          />
          <el-table-column align="center" label="任务编号" prop="id" :show-overflow-tooltip="true" />
          <el-table-column align="center" label="操作" fixed="right" width="80">
            <template #default="scope">
              <el-button link type="primary" @click="handleAudit(scope.row)">办理</el-button>
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
      </el-tab-pane>

      <!-- 待提交 -->
      <el-tab-pane label="待提交" name="draft">
        <el-form :inline="true" class="-mb-15px">
          <el-form-item label="">
            <el-input
              v-model="draftQueryParams.name"
              class="!w-240px"
              clearable
              placeholder="请输入草稿标题"
              @keyup.enter="handleDraftQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="handleDraftQuery">
              <Icon class="mr-5px" icon="ep:search" />
              搜索
            </el-button>
          </el-form-item>
        </el-form>
        <el-table v-loading="draftLoading" :data="draftList">
          <el-table-column
            align="center"
            label="草稿标题"
            prop="name"
            width="220"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            align="center"
            label="流程定义"
            prop="processDefinitionName"
            width="180"
            :show-overflow-tooltip="true"
          />
          <el-table-column align="center" label="业务标识" prop="businessKey" :show-overflow-tooltip="true" />
          <el-table-column
            :formatter="dateFormatter"
            align="center"
            label="创建时间"
            prop="createTime"
            width="180"
          />
          <el-table-column align="center" label="操作" fixed="right" width="120">
            <template #default="scope">
              <el-button
                link
                type="primary"
                :loading="submittingId === scope.row.id"
                @click="handleSubmitDraft(scope.row)"
              >
                提交
              </el-button>
              <el-button link type="danger" @click="handleDeleteDraft(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <Pagination
          v-model:limit="draftQueryParams.pageSize"
          v-model:page="draftQueryParams.pageNo"
          :total="draftTotal"
          @pagination="getDraftList"
        />
      </el-tab-pane>
    </el-tabs>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as TaskApi from '@/api/bpm/task'
import { CategoryApi, CategoryVO } from '@/api/bpm/category'
import * as DefinitionApi from '@/api/bpm/definition'
import {
  ProcessDraftVO,
  getProcessDraftMyPage,
  submitProcessDraft,
  deleteProcessDraft
} from '@/api/bpm/processInstance'

defineOptions({ name: 'BpmTodoTask' })

const { push } = useRouter() // 路由
const route = useRoute() // 路由

const message = useMessage() // 消息弹窗

// ========== 待办 ==========
const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const processDefinitionList = ref<any[]>([]) // 流程定义列表
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  category: undefined,
  processDefinitionKey: '',
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const categoryList = ref<CategoryVO[]>([]) // 流程分类列表
const showPopover = ref(false) // 高级筛选是否展示

/** 查询任务列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await TaskApi.getTaskTodoPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 处理审批按钮 */
const handleAudit = (row: any) => {
  push({
    name: 'BpmProcessInstanceDetail',
    query: {
      id: row.processInstance.id,
      taskId: row.id
    }
  })
}

// ========== 待提交（草稿） ==========
const activeTab = ref(route.query.tab === 'draft' ? 'draft' : 'todo') // 当前 tab
const draftLoading = ref(false) // 草稿列表的加载中
const draftList = ref<ProcessDraftVO[]>([]) // 草稿列表的数据
const draftTotal = ref(0) // 草稿列表的总页数
const draftLoaded = ref(false) // 草稿列表是否已加载（切换 tab 时懒加载）
const submittingId = ref<number>() // 正在提交的草稿编号（按钮防重）
const draftQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: ''
})

/** 查询草稿列表 */
const getDraftList = async () => {
  draftLoading.value = true
  try {
    const data = await getProcessDraftMyPage(draftQueryParams)
    draftList.value = data.list
    draftTotal.value = data.total
  } finally {
    draftLoading.value = false
  }
}

/** 搜索按钮操作（草稿） */
const handleDraftQuery = () => {
  draftQueryParams.pageNo = 1
  getDraftList()
}

/** 切换 tab 操作（待提交列表懒加载） */
const handleTabClick = (pane: any) => {
  if (pane.paneName === 'draft' && !draftLoaded.value) {
    draftLoaded.value = true
    getDraftList()
  }
}

/** 提交草稿按钮操作 */
const handleSubmitDraft = async (row: ProcessDraftVO) => {
  // 有业务表单（formCustomCreatePath）时，跳转业务表单页，由草稿数据预填，表单提交时正式发起流程
  if (row.formCustomCreatePath) {
    push({ path: row.formCustomCreatePath, query: { draftId: row.id } })
    return
  }
  try {
    await message.confirm(`是否确认提交草稿「${row.name}」？提交后将正式发起流程`)
  } catch {
    return
  }
  submittingId.value = row.id
  try {
    await submitProcessDraft(row.id)
    message.success('提交成功')
    await getDraftList()
    // 提交后，第一个节点可能分配给我自己，刷新待办列表
    getList()
  } finally {
    submittingId.value = undefined
  }
}

/** 删除草稿按钮操作 */
const handleDeleteDraft = async (row: ProcessDraftVO) => {
  try {
    await message.confirm(`是否确认删除草稿「${row.name}」？删除后不可恢复`)
  } catch {
    return
  }
  await deleteProcessDraft(row.id)
  message.success('删除成功')
  await getDraftList()
}

/** 初始化 **/
onMounted(async () => {
  await getList()
  categoryList.value = await CategoryApi.getCategorySimpleList()
  // 获取流程定义列表
  processDefinitionList.value = await DefinitionApi.getSimpleProcessDefinitionList()
  // 直接进入待提交 tab 时（如从站内信跳转），加载草稿列表
  if (activeTab.value === 'draft') {
    draftLoaded.value = true
    await getDraftList()
  }
})
</script>
