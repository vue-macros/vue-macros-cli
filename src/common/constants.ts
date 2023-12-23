export const officialMacros = [
  { name: 'define-options', value: 'defineOptions', volar: true, status: 'official' },
  { name: 'define-slots', value: 'defineSlots', volar: true, status: 'official' },
  { name: 'short-emits', value: 'shortEmits', volar: false, status: 'official' },
] as const

export const stableMacros = [
  { name: 'define-models', value: 'defineModels', volar: true, status: 'stable' },
  { name: 'define-props', value: 'defineProps', volar: true, status: 'stable' },
  { name: 'define-props-refs', value: 'definePropsRefs', volar: true, status: 'stable' },
  { name: 'define-render', value: 'defineRender', volar: false, status: 'stable' },
  { name: 'short-vmodel', value: 'shortVmodel', volar: true, status: 'stable' },
  { name: 'reactivity-transform', value: 'reactivityTransform', volar: false, status: 'stable' },
] as const

export const experimentalMacros = [
  { name: 'short-bind', value: 'shortBind', volar: true, status: 'experimental' },
  { name: 'define-prop', value: 'defineProp', volar: true, status: 'experimental' },
  { name: 'define-emit', value: 'defineEmit', volar: false, status: 'experimental' },
  { name: 'setup-component', value: 'setupComponent', volar: false, status: 'experimental' },
  { name: 'setup-sfc', value: 'setupSFC', volar: false, status: 'experimental' },
  { name: 'export-props', value: 'exportProps', volar: true, status: 'experimental' },
  { name: 'export-expose', value: 'exportExpose', volar: true, status: 'experimental' },
  { name: 'export-render', value: 'exportRender', volar: true, status: 'experimental' },
  { name: 'chain-call', value: 'chainCall', volar: false, status: 'experimental' },
  { name: 'jsx-directive', value: 'jsxDirective', volar: true, status: 'experimental' },
  { name: 'boolean-prop', value: 'booleanProp', volar: false, status: 'experimental' },
] as const

export const vueMacros = [
  ...officialMacros,
  ...stableMacros,
  ...experimentalMacros,
] as const

export type VueMacros = Partial<Record<
  typeof vueMacros[number]['value'],
  any
>>
