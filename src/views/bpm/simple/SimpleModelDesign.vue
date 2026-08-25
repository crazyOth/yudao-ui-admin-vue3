<template>
  <ContentWrap :bodyStyle="{ padding: '20px 16px' }">
    <SimpleProcessDesigner
      :model-form-id="modelFormId"
      :model-form-type="modelFormType"
      :start-user-ids="startUserIds"
      :start-dept-ids="startDeptIds"
      :entity-form-fields="entityFormFields"
      @success="handleSuccess"
      ref="designerRef"
    />
  </ContentWrap>
</template>
<script setup lang="ts">
import { SimpleProcessDesigner } from '@/components/SimpleProcessDesignerV2/src/'

defineOptions({
  name: 'SimpleModelDesign'
})

defineProps<{
  modelName?: string
  modelFormId?: number
  modelFormType?: number
  startUserIds?: number[]
  startDeptIds?: number[]
  // 实体表单（业务表单）的字段。用于流程设计器监听器的「业务字段」参数
  entityFormFields?: Array<{ field: string; label: string }>
}>()

const emit = defineEmits(['success'])

// 修改成功回调
const handleSuccess = (data?: any) => {
  console.info('handleSuccess', data)
  if (data) {
    emit('success', data)
  }
}
</script>
<style lang="scss" scoped></style>
