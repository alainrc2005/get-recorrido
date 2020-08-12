export function Error(message) {
  this.$q.notify({
    icon: 'mdi-clippy',
    color: 'negative',
    progress: true,
    message
  })
}

export function Success(message) {
  this.$q.notify({
    icon: 'mdi-hand-okay',
    color: 'positive',
    progress: true,
    message
  })
}

export function Warning(message) {
  this.$q.notify({
    icon: 'mdi-flash-circle',
    color: 'accent',
    progress: true,
    message
  })
}

export function AskForRemove () {
  return this.$q.dialog({
    title: 'Confirmación',
    message: '¿Está Seguro? Esta acción no se puede deshacer',
    ok: { color: 'negative' },
    cancel: { color: 'warning' },
    persistent: true
  })
}
