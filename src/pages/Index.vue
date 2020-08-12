<template>
  <q-page padding class="q-ma-md">
    <q-card>
      <q-card-section class="row no-padding">
        <q-toolbar class="bg-primary text-white rounded-borders">
          <q-icon name="mdi-crosshairs-gps" size="md" />
          <q-toolbar-title>
            Recorridos
          </q-toolbar-title>
          <q-space />
          <q-btn
            rounded
            flat
            icon="mdi-calendar"
            :label="currentDate"
            @click="$refs.fd.show(currentDate)"
          />
          <q-btn round flat icon="mdi-map-marker-distance" @click="goMap"/>
          <q-btn round flat icon="mdi-map-marker-plus" @click="create" :loading="loading">
            <q-tooltip>
              Agregar Coordenada
            </q-tooltip>
          </q-btn>
        </q-toolbar>
      </q-card-section>
      <q-card-section>
        <div class="q-gutter-lg">
          <q-card v-for="(p, idx) in coords" class="col-12" :key="p.id">
            <q-card-section>
              <q-list class="text-caption" dense>
                <q-item>
                  <q-item-section>
                    <q-item-label>Latitud</q-item-label>
                  </q-item-section>
                  <q-item-section class="text-right">
                    <q-item-label class="ellipsis">{{
                      p.latitude
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label>Longitud</q-item-label>
                  </q-item-section>
                  <q-item-section class="text-right">
                    <q-item-label class="ellipsis">{{
                      p.longitude
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label>Lugar</q-item-label>
                  </q-item-section>
                  <q-item-section class="text-right">
                    <q-item-label class="ellipsis">{{ p.label }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label>Fecha y Hora</q-item-label>
                  </q-item-section>
                  <q-item-section class="text-right">
                    <q-item-label class="ellipsis">{{
                      moment(p.date).format("DD/MM/YYYY HH:mm")
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
            <q-separator />
            <q-card-actions align="center">
              <q-btn
                dense
                icon="mdi-map-marker-radius"
                rounded
                label="Editar"
                color="positive"
                @click="edit(p)"
              />
              <q-btn
                dense
                icon="mdi-map-marker-remove"
                rounded
                label="Eliminar"
                color="negative"
                @click="remove(p.id, idx)"
              />
            </q-card-actions>
          </q-card>
        </div>
        <div v-if="coords.length === 0" class="doc_note_warning q-my-lg">
          No existen Lugares en la fecha seleccionada
        </div>
      </q-card-section>
    </q-card>
    <q-dialog ref="dlg">
      <q-card class="q-dialog-plugin">
        <q-card-section class="row no-padding">
          <q-toolbar class="bg-primary text-white">
            <q-toolbar-title>{{ caption }}</q-toolbar-title>
            <q-btn round dense flat icon="close" v-close-popup>
              <q-tooltip>Cerrar</q-tooltip>
            </q-btn>
          </q-toolbar>
        </q-card-section>
        <q-card-section>
          <q-input label="Latitud" v-model="coord.latitude" />
          <q-input label="Longitud" v-model="coord.longitude" />
          <q-input label="Lugar" v-model="coord.label" autocomplete="on" />
          <q-input label="Fecha y Hora" v-model="coord.date" readonly />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            :disable="$v.$invalid"
            color="positive"
            label="Aceptar"
            @click="save"
          />
          <q-btn color="negative" label="Cancelar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <w-date ref="fd" @accept="filterDate" />
    <backtotop/>
  </q-page>
</template>

<script>
import { putLocation, getLocationsByDate, removeLocation } from '../helpers/db'
import { Error, AskForRemove, Success, Warning } from '../helpers/helpers'
import { required } from 'vuelidate/lib/validators'
import moment from 'moment'
import WDate from '../components/WDate'
import backtotop from '../components/backtotop'

function initCoord () {
  return {
    id: null,
    latitude: null,
    longitude: null,
    date: moment().format('YYYY-MM-DD HH:mm'),
    label: null
  }
}

export default {
  name: 'PageIndex',
  components: {
    WDate,
    backtotop
  },
  data () {
    return {
      loading: false,
      action: null,
      coord: initCoord(),
      coords: [],
      currentDate: null
    }
  },
  validations: {
    coord: {
      latitude: { required },
      longitude: { required },
      label: { required },
      date: { required }
    }
  },
  computed: {
    caption () {
      return this.action === 'store' ? 'Crear Punto' : 'Editar Punto'
    }
  },
  watch: {
    coords () {
      this.onRequest()
    }
  },
  methods: {
    moment,
    create () {
      console.info('[GET] Create')
      this.loading = true
      navigator.geolocation.getCurrentPosition(
        data => {
          this.loading = false
          this.action = 'store'
          this.coord = initCoord()
          this.coord.latitude = data.coords.latitude
          this.coord.longitude = data.coords.longitude
          Warning.call(this, `Precisión en metros: ${data.coords.accuracy}`)
          this.$refs.dlg.show()
        },
        error => {
          this.loading = false
          console.error(error)
          if (error.code === 1) {
            Error.call(this, 'Permiso no concedido a la aplicación')
          } else {
            Error.call(this, 'No se pudo obtener la ubicación')
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 3 * 60 * 1000,
          maximumAge: 0
        }
      )
    },
    edit (c) {
      this.action = 'update'
      Object.assign(this.coord, c)
      this.$refs.dlg.show()
    },
    filterDate (date) {
      this.currentDate = date
    },
    async save () {
      if (this.action === 'store') {
        delete this.coord.id
        const res = await putLocation(this.coord)
        if (res === -1) { return Error.call(this, 'Ha ocurrido un error creando Localización') }
      } else {
        const res = await putLocation(this.coord)
        if (res === -1) { return Error.call(this, 'Ha ocurrido un error actualizando Localización') }
      }
      this.$refs.dlg.hide()
    },
    remove (id, idx) {
      AskForRemove.call(this).onOk(_ => {
        removeLocation(id)
          .then(_ => {
            this.coords.splice(idx, 1)
            Success.call(this, 'La localización ha sido eliminada con éxito')
          })
          .catch(_ => {
            Error.call(this, 'Ha ocurrido un error eliminando localización')
          })
      })
    },
    async onRequest () {
      const start = moment(this.currentDate, 'DD/MM/YYYY')
          .startOf('date')
          .format('YYYY-MM-DD HH:mm'),
        end = moment(this.currentDate, 'DD/MM/YYYY')
          .endOf('date')
          .format('YYYY-MM-DD HH:mm')
      this.coords = await getLocationsByDate(start, end)
    },
    goMap () {
      this.$router.push('/map?date=' + this.currentDate)
    }
  },
  mounted () {
    this.currentDate = moment().format('DD/MM/YYYY')
    this.onRequest()
  }
}
</script>
