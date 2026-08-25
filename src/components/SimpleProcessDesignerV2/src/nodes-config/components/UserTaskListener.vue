<template>
  <el-form ref="listenerFormRef" :model="configForm" label-position="top">
    <div v-for="(listener, listenerIdx) in taskListener" :key="listenerIdx">
      <el-divider content-position="left">
        <el-text tag="b" size="large">{{ listener.name }}</el-text>
      </el-divider>
      <el-form-item>
        <el-switch
          v-model="configForm[`task${listener.type}ListenerEnable`]"
          active-text="开启"
          inactive-text="关闭"
        />
      </el-form-item>
      <div v-if="configForm[`task${listener.type}ListenerEnable`]">
        <el-form-item>
          <el-alert
            title="仅支持 POST 请求，以请求体方式接收参数"
            type="warning"
            show-icon
            :closable="false"
          />
        </el-form-item>
        <el-form-item label="请求类型">
          <el-select
            :model-value="isDraftPreset(listener) ? 'create-draft' : 'custom'"
            style="width: 220px"
            @change="(val: string) => handlePresetChange(listener, val)"
          >
            <el-option label="自定义接口" value="custom" />
            <el-option label="创建流程草稿（待提交）" value="create-draft" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="请求地址"
          :prop="`task${listener.type}ListenerPath`"
          :rules="{
            required: true,
            message: '请求地址不能为空',
            trigger: 'blur'
          }"
        >
          <el-input v-model="configForm[`task${listener.type}ListenerPath`]" />
        </el-form-item>
        <!-- 预设：创建流程草稿。目标流程、草稿发起人，联动请求体中的 processDefinitionKey、userId 参数 -->
        <template v-if="isDraftPreset(listener)">
          <el-form-item label="目标流程">
            <el-select
              :model-value="getDraftParamValue(listener, 'processDefinitionKey')"
              filterable
              style="width: 330px"
              placeholder="选择要创建草稿的流程"
              @change="(val: string) => setDraftParamValue(listener, 'processDefinitionKey', val)"
            >
              <el-option
                v-for="model in modelOptions"
                :key="model.key"
                :label="model.name"
                :value="model.key"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="草稿发起人">
            <div class="flex items-center">
              <el-select
                :model-value="getDraftStartUserType(listener)"
                style="width: 150px"
                @change="(val: string) => handleDraftStartUserTypeChange(listener, val)"
              >
                <el-option label="本流程发起人" value="start-user" />
                <el-option label="指定用户" value="user" />
              </el-select>
              <el-select
                v-if="getDraftStartUserType(listener) === 'user'"
                :model-value="getDraftParamValue(listener, 'userId')"
                filterable
                style="width: 200px"
                placeholder="选择用户"
                @change="(val: string) => setDraftParamValue(listener, 'userId', val)"
              >
                <el-option
                  v-for="user in userOptions"
                  :key="user.id"
                  :label="user.nickname"
                  :value="String(user.id)"
                />
              </el-select>
            </div>
          </el-form-item>
        </template>
        <el-text
          v-if="isDraftPreset(listener) && getTargetEntityFormFields(listener).length > 0"
          type="info"
          size="small"
          class="mb-8px"
        >
          目标流程配置了实体表单，请求体「业务字段」的参数名可从其字段中选择
        </el-text>
        <HttpRequestParamSetting
          :header="configForm[`task${listener.type}Listener`].header"
          :body="configForm[`task${listener.type}Listener`].body"
          :bind="`task${listener.type}Listener`"
          :business-key-options="getTargetEntityFormFields(listener)"
        />
      </div>
    </div>
  </el-form>
</template>
<script setup lang="ts">
import { getModelList, getEntityFormList } from '@/api/bpm/model'
import type { ModelVO, EntityFormVO } from '@/api/bpm/model'
import * as UserApi from '@/api/system/user'
import HttpRequestParamSetting from './HttpRequestParamSetting.vue'
import { BpmHttpRequestParamTypeEnum } from '../../consts'

// 流程实例草稿创建接口（流程设计器监听器的内部回调）
const DRAFT_CREATE_PATH = '/bpm/process-draft/create-by-listener'
// 发起人占位符。后端解析为来源流程的发起人
const START_USER_PLACEHOLDER = '__START_USER__'

type ListenerType = { type: string }

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  formFieldOptions: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['update:modelValue'])
const listenerFormRef = ref()
const configForm = computed({
  get() {
    return props.modelValue
  },
  set(newValue) {
    emit('update:modelValue', newValue)
  }
})
const taskListener = ref([
  {
    name: '创建任务',
    type: 'Create'
  },
  {
    name: '指派任务执行人员',
    type: 'Assign'
  },
  {
    name: '完成任务',
    type: 'Complete'
  }
])

// 用户列表（草稿发起人「指定用户」下拉）
const userOptions = inject<Ref<UserApi.UserVO[]>>('userList', ref([]))

// 模型列表（目标流程下拉）
const modelOptions = ref<ModelVO[]>([])
// 实体表单列表（目标流程的实体表单字段，用于「业务字段」行的参数名下拉）
const entityFormOptions = ref<EntityFormVO[]>([])
onMounted(async () => {
  const [models, entityForms] = await Promise.all([
    getModelList(undefined),
    getEntityFormList()
  ])
  modelOptions.value = models
  entityFormOptions.value = entityForms
})

// ==================== 预设：创建流程草稿 ====================

/** 判断当前请求地址是否为「创建流程草稿」预设 */
const isDraftPreset = (listener: ListenerType) =>
  (configForm.value[`task${listener.type}ListenerPath`] ?? '').includes(DRAFT_CREATE_PATH)

/** 获得草稿接口的默认请求地址。按当前环境的 API 域名拼接，仍可手工修改 */
const getDefaultDraftPath = () =>
  import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_URL + DRAFT_CREATE_PATH

/** 获得监听器的请求参数结构。新节点未初始化时，创建默认结构 */
const getListenerParams = (listener: ListenerType) => {
  const key = `task${listener.type}Listener`
  const params = configForm.value[key]
  if (!params || !Array.isArray(params.header) || !Array.isArray(params.body)) {
    configForm.value[key] = {
      header: params?.header ?? [],
      body: params?.body ?? []
    }
    return configForm.value[key]
  }
  return params
}

/** 获得请求体中固定参数（例如说 processDefinitionKey、userId）的值 */
const getDraftParamValue = (listener: ListenerType, paramKey: string) => {
  const row = getListenerParams(listener).body.find((item) => item.key === paramKey)
  return row?.value ?? ''
}

/** 获得目标流程的实体表单字段。目标流程未配置实体表单时，返回空（参数名退回手工输入） */
const getTargetEntityFormFields = (listener: ListenerType) => {
  if (!isDraftPreset(listener)) {
    return []
  }
  const model = modelOptions.value.find(
    (item) => item.key === getDraftParamValue(listener, 'processDefinitionKey')
  )
  if (!model?.entityFormKey) {
    return []
  }
  return (
    entityFormOptions.value.find((form) => form.key === model.entityFormKey)?.fields ?? []
  )
}

/** 设置请求体中固定参数的值。行被删除时，重新添加 */
const setDraftParamValue = (listener: ListenerType, paramKey: string, value: string) => {
  const body = getListenerParams(listener).body
  let row = body.find((item) => item.key === paramKey)
  if (!row) {
    row = {
      key: paramKey,
      type: BpmHttpRequestParamTypeEnum.FIXED_VALUE,
      value: ''
    }
    body.push(row)
  }
  row.value = value
}

/** 切换请求类型。选「创建流程草稿」时，自动回填请求地址和固定参数 */
const handlePresetChange = (listener: ListenerType, preset: string) => {
  if (preset !== 'create-draft') {
    // 切回自定义接口，不修改任何数据
    return
  }
  if (!isDraftPreset(listener)) {
    configForm.value[`task${listener.type}ListenerPath`] = getDefaultDraftPath()
  }
  const body = getListenerParams(listener).body
  // 目标流程定义标识
  if (!body.some((item) => item.key === 'processDefinitionKey')) {
    body.push({
      key: 'processDefinitionKey',
      type: BpmHttpRequestParamTypeEnum.FIXED_VALUE,
      value: ''
    })
  }
  // 草稿发起人，默认本流程发起人
  if (!body.some((item) => item.key === 'userId')) {
    body.push({
      key: 'userId',
      type: BpmHttpRequestParamTypeEnum.FIXED_VALUE,
      value: START_USER_PLACEHOLDER
    })
  }
}

/** 获得草稿发起人类型 */
const getDraftStartUserType = (listener: ListenerType) =>
  getDraftParamValue(listener, 'userId') === START_USER_PLACEHOLDER ? 'start-user' : 'user'

/** 切换草稿发起人类型 */
const handleDraftStartUserTypeChange = (listener: ListenerType, type: string) => {
  if (type === 'start-user') {
    setDraftParamValue(listener, 'userId', START_USER_PLACEHOLDER)
    return
  }
  // 切到指定用户时，若当前是发起人占位符，清空等待选择
  const row = getListenerParams(listener).body.find((item) => item.key === 'userId')
  if (row && row.value === START_USER_PLACEHOLDER) {
    row.value = ''
  }
}

const validate = async () => {
  if (!listenerFormRef) return false
  return await listenerFormRef.value.validate()
}

defineExpose({ validate })
</script>
