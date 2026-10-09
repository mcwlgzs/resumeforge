import type { Ref } from 'vue'

/**
 * 原生拖拽排序（HTML5 DnD）。
 *
 * 交互设计：只有按住拖拽手柄才允许拖动，避免用户想选中输入框文字时误触发拖拽。
 * 采用「实时重排」而非「拖到目标再落位」，松手即完成，手感更接近 Notion。
 */
export function useDragSort<T extends { id: string }>(list: Ref<T[]>) {
  const draggingId = ref('')
  /** 已按住手柄、允许开始拖拽的元素 */
  const armedId = ref('')

  function arm(id: string) {
    armedId.value = id
  }

  function onDragStart(id: string, e: DragEvent) {
    if (armedId.value !== id) {
      e.preventDefault()
      return
    }
    draggingId.value = id
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', id)
    }
  }

  function onDragOver(id: string, e: DragEvent) {
    if (!draggingId.value) return
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    if (draggingId.value === id) return

    const arr = list.value
    const from = arr.findIndex((x) => x.id === draggingId.value)
    const to = arr.findIndex((x) => x.id === id)
    if (from < 0 || to < 0 || from === to) return

    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
  }

  function onDragEnd() {
    draggingId.value = ''
    armedId.value = ''
  }

  return { draggingId, armedId, arm, onDragStart, onDragOver, onDragEnd }
}
