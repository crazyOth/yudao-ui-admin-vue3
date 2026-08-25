<template>
  <el-form ref="formRef" :model="modelData" :rules="rules" label-width="120px" class="mt-20px">
    <el-form-item label="表单类型" prop="formType" class="mb-20px">
      <el-radio-group v-model="modelData.formType">
        <el-radio
          v-for="dict in getIntDictOptions(DICT_TYPE.BPM_MODEL_FORM_TYPE)"
          :key="dict.value"
          :value="dict.value"
        >
          {{ dict.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item
      v-if="modelData.formType === BpmModelFormType.NORMAL"
      label="流程表单"
      prop="formId"
    >
      <el-select v-model="modelData.formId" clearable style="width: 100%">
        <el-option v-for="form in formList" :key="form.id" :label="form.name" :value="form.id" />
      </el-select>
    </el-form-item>
    <el-form-item
      v-if="modelData.formType === BpmModelFormType.CUSTOM"
      label="实体表单"
      prop="entityFormKey"
    >
      <el-select
        v-model="modelData.entityFormKey"
        clearable
        placeholder="选择业务实体表单（可选）"
        style="width: 330px"
      >
        <el-option
          v-for="form in entityFormList"
          :key="form.key"
          :label="form.name"
          :value="form.key"
        />
      </el-select>
      <el-tooltip
        class="item"
        content="选择业务模块注册的实体表单后，自动回填下方提交/查看路由（实体表单未声明的路由会被清空，仍可手工填写），且流程设计器监听器可选择该表单的「业务字段」做参数映射"
        effect="light"
        placement="top"
      >
        <Icon icon="ep:question" class="ml-5px" />
      </el-tooltip>
    </el-form-item>
    <el-form-item
      v-if="modelData.formType === BpmModelFormType.CUSTOM"
      label="表单提交路由"
      prop="formCustomCreatePath"
    >
      <el-input
        v-model="modelData.formCustomCreatePath"
        placeholder="请输入表单提交路由"
        style="width: 330px"
      />
      <el-tooltip
        class="item"
        content="自定义表单的提交路径，使用 Vue 的路由地址，例如说：bpm/oa/leave/create.vue"
        effect="light"
        placement="top"
      >
        <Icon icon="ep:question" class="ml-5px" />
      </el-tooltip>
    </el-form-item>
    <el-form-item
      v-if="modelData.formType === BpmModelFormType.CUSTOM"
      label="表单查看地址"
      prop="formCustomViewPath"
    >
      <el-input
        v-model="modelData.formCustomViewPath"
        placeholder="请输入表单查看的组件地址"
        style="width: 330px"
      />
      <el-tooltip
        class="item"
        content="自定义表单的查看组件地址，使用 Vue 的组件地址，例如说：bpm/oa/leave/detail.vue"
        effect="light"
        placement="top"
      >
        <Icon icon="ep:question" class="ml-5px" />
      </el-tooltip>
    </el-form-item>
    <!-- 表单预览 -->
    <div
      v-if="
        modelData.formType === BpmModelFormType.NORMAL &&
        modelData.formId &&
        formPreview.rule.length > 0
      "
      class="mt-20px"
    >
      <div class="flex items-center mb-15px">
        <div class="h-15px w-4px bg-[#1890ff] mr-10px"></div>
        <span class="text-15px font-bold">表单预览</span>
      </div>
      <form-create
        v-model="formPreview.formData"
        :rule="formPreview.rule"
        :option="formPreview.option"
      />
    </div>
  </el-form>
</template>

<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as FormApi from '@/api/bpm/form'
import type { EntityFormVO } from '@/api/bpm/model'
import { setConfAndFields2 } from '@/utils/formCreate'
import { BpmModelFormType } from '@/utils/constants'
import type { Rule } from '@form-create/element-ui'

const props = defineProps<{
  formList: FormApi.FormVO[]
  entityFormList: EntityFormVO[]
}>()

const formRef = ref()

// 创建本地数据副本
const modelData = defineModel<any>()

// 表单预览数据
const formPreview = ref({
  formData: {},
  rule: [] as Rule[],
  option: {
    submitBtn: false,
    resetBtn: false,
    formData: {}
  }
})

// 监听表单ID变化，加载表单数据
watch(
  () => modelData.value.formId,
  async (newFormId) => {
    if (newFormId && modelData.value.formType === BpmModelFormType.NORMAL) {
      const data = await FormApi.getForm(newFormId)
      setConfAndFields2(formPreview.value, data.conf, data.fields)
      // 设置只读
      formPreview.value.rule.forEach((item) => {
        item.props = { ...item.props, disabled: true }
      })
    } else {
      formPreview.value.rule = []
    }
  },
  { immediate: true }
)

// 当前选中的实体表单
const selectedEntityForm = computed(() => {
  if (modelData.value.formType !== BpmModelFormType.CUSTOM || !modelData.value.entityFormKey) {
    return undefined
  }
  return props.entityFormList.find((form) => form.key === modelData.value.entityFormKey)
})

// 监听实体表单变化，自动回填自定义表单的提交/查看路由；
// 实体表单未声明的路由会被清空（例如说 弹窗式新建入口没有提交路由），避免残留其他实体表单的路由被误用；清空后仍可手工填写
watch(
  () => modelData.value.entityFormKey,
  (newKey) => {
    if (!newKey) {
      return
    }
    const entityForm = props.entityFormList.find((form) => form.key === newKey)
    if (!entityForm) {
      return
    }
    modelData.value.formCustomCreatePath = entityForm.createRoute ?? ''
    modelData.value.formCustomViewPath = entityForm.viewRoute ?? ''
  },
  { immediate: true }
)

const rules = computed(() => ({
  formType: [{ required: true, message: '表单类型不能为空', trigger: 'blur' }],
  formId: [{ required: true, message: '流程表单不能为空', trigger: 'blur' }],
  // 选中的实体表单未声明该路由时（例如说 弹窗式新建入口没有提交路由），允许为空
  formCustomCreatePath:
    selectedEntityForm.value && !selectedEntityForm.value.createRoute
      ? []
      : [{ required: true, message: '表单提交路由不能为空', trigger: 'blur' }],
  formCustomViewPath:
    selectedEntityForm.value && !selectedEntityForm.value.viewRoute
      ? []
      : [{ required: true, message: '表单查看地址不能为空', trigger: 'blur' }]
}))

/** 表单校验 */
const validate = async () => {
  await formRef.value?.validate()
}

defineExpose({
  validate
})
</script>
