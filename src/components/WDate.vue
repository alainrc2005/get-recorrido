<template>
    <q-dialog ref="dlg" persistent>
      <q-card style="width: 290px">
        <q-card-section class="row no-padding">
          <q-toolbar
            class="bg-primary text-white justify-center"
            style="min-height: 35px"
          >
            <q-btn-group>
              <q-btn icon="mdi-calendar-month" @click="tab = 'date'">
                <q-tooltip>
                  Fecha
                </q-tooltip>
              </q-btn>
              <q-btn icon="mdi-check" @click="accept">
                <q-tooltip>
                  Aplicar
                </q-tooltip>
              </q-btn>
              <q-btn icon="mdi-cancel" @click="hide">
                <q-tooltip>
                  Cancelar
                </q-tooltip>
              </q-btn>
            </q-btn-group>
          </q-toolbar>
        </q-card-section>
        <q-card-section class="no-padding">
          <q-date :options="options" v-model="date" mask="DD/MM/YYYY" />
        </q-card-section>
      </q-card>
    </q-dialog>
</template>

<script>
import moment from 'moment'

export default {
  name: 'WDate',
  props: {
    options: {
      type: Function
    }
  },
  data () {
    return {
      date: null,
      focused: false
    }
  },
  methods: {
    show (value) {
      if (value == null) {
        this.date = moment().format('DD/MM/YYYY')
      } else {
        this.date = value
      }
      this.$refs.dlg.show()
    },
    hide () {
      this.$refs.dlg.hide()
    },
    accept () {
      this.$emit('accept', this.date)
      this.hide()
    }
  }
}
</script>
<style>
.q-date__header {
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}
</style>
