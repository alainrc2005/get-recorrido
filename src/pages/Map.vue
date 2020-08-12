<template>
  <q-page padding class="q-ma-md">
    <div id="gmap" style="width:100%;height:500px"></div>
    <br/>
    <div class="q-gutter-lg">
      <q-card v-for="(d, idx) in distances" class="col-12" :key="idx">
        <q-card-section class="bg-primary text-white q-py-xs">
          {{d.origin}} - {{d.destination}}
        </q-card-section>
        <q-card-section>
          <q-list class="text-caption" dense>
            <q-item>
              <q-item-section>
                <q-item-label>Distancia</q-item-label>
              </q-item-section>
              <q-item-section class="text-right">
                <q-item-label class="ellipsis">{{ d.distance }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Tiempo Estimado</q-item-label>
              </q-item-section>
              <q-item-section class="text-right">
                <q-item-label class="ellipsis">{{d.duration}}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Estado</q-item-label>
              </q-item-section>
              <q-item-section class="text-right">
                <q-item-label class="ellipsis">{{d.status}}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
    <q-page-sticky position="top" :offset="[0, 18]">
      <q-fab
        vertical-actions-align="center"
        color="purple"
        icon="keyboard_arrow_down"
        direction="down"
      >
        <q-fab-action color="primary" to="/" icon="mdi-home" label="Inicio" />
        <q-fab-action color="secondary" @click="download" icon="mdi-cloud-download-outline" label="Descargar" />
      </q-fab>
    </q-page-sticky>
    <backtotop/>
  </q-page>
</template>

<script>
  import { Error, Success, Warning } from '../helpers/helpers'
import moment from 'moment'
import { getLocationsByDate } from '../helpers/db'
import backtotop from '../components/backtotop'
import { exportFile } from 'quasar'

export default {
  name: 'Map',
  components: {
    backtotop
  },
  data () {
    return {
      coords: [],
      distances: []
    }
  },
  methods: {
    attachDescription (map, marker, reservation) {
      const infowindow = new google.maps.InfoWindow(
        {
          content: reservation
        })
      infowindow.open(map, marker)
      google.maps.event.addListener(marker, 'click', function () {
        infowindow.open(map, marker)
      })
    },
    gDistance () {
      if (this.coords.length <= 1) return Warning.call(this, 'No existen localizaciones suficientes para calcular distancia')
      const matrix = new google.maps.DistanceMatrixService()
      const destinations = []
      for (let i = 1; i < this.coords.length; i++) {
        destinations.push(new google.maps.LatLng(this.coords[i].latitude, this.coords[i].longitude))
      }
      matrix.getDistanceMatrix({
        origins: [new google.maps.LatLng(this.coords[0].latitude, this.coords[0].longitude)],
        destinations,
        travelMode: google.maps.TravelMode.DRIVING
      }, (r, status) => {
        console.log(r)
        if (status !== 'OK') Error.call(this, 'Ha ocurrido un error obteniendo matriz de distancia')
        for (let i = 0; i < this.coords.length - 1; i++) {
          this.distances.push({
            origin: this.coords[i].label,
            destination: this.coords[i + 1].label,
            distance: r.rows[0].elements[i].status === 'OK' ? r.rows[0].elements[i].distance.text : 'N/A',
            duration: r.rows[0].elements[i].status === 'OK' ? r.rows[0].elements[i].duration.text : 'N/A',
            status: r.rows[0].elements[i].status
          })
        }
        console.log(this.distances)
      })
    },
    gMap () {
      try {
        const mapOptions = {
          center: new google.maps.LatLng(21.5, -80),
          mapTypeControl: false,
          zoom: 7,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        const map = new google.maps.Map(document.getElementById('gmap'), mapOptions)
        let request = {
            travelMode: google.maps.TravelMode.DRIVING
          }, directionsDisplay = new google.maps.DirectionsRenderer(),
          directionsService = new google.maps.DirectionsService()
        directionsDisplay.setMap(map)
        for (let l = 0; l < this.coords.length; l++) {
          const marker = new google.maps.Marker({
            position: new google.maps.LatLng(this.coords[l].latitude, this.coords[l].longitude),
            map: map
          })
          this.attachDescription(map, marker, this.coords[l].label)
          if (l === 0) request.origin = marker.getPosition()
          else if (l === this.coords.length - 1) request.destination = marker.getPosition()
          else {
            if (!request.waypoints) request.waypoints = []
            request.waypoints.push({
              location: marker.getPosition(),
              stopover: true
            })
          }
        }
        if (request.destination) {
          directionsService.route(request, function (result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(result)
            }
          })
        }
      } catch (e) {
        console.error(e)
        Error.call(this, 'Ha ocurrido un error de conexión con GoogleMap')
        this.$router.push('/')
      }
    },
    async getLocations () {
      const start = moment(this.$route.query.date, 'DD/MM/YYYY')
          .startOf('date')
          .format('YYYY-MM-DD HH:mm'),
        end = moment(this.$route.query.date, 'DD/MM/YYYY')
          .endOf('date')
          .format('YYYY-MM-DD HH:mm')
      this.coords = await getLocationsByDate(start, end)
    },
    download () {
      let csv = '', date = moment(this.$route.query.date, 'DD/MM/YYYY').format('YYYY-MM-DD')
      this.distances.forEach(it => {
        csv += `${date},${it.origin},${it.destination},${it.distance},${it.duration},${it.status}\n`
      })
      const status = exportFile(`${date}.csv`, csv)
      if (status === true) {
        Success.call(this, 'Descarga realizada con éxito')
      } else {
        Error.call(this, 'Ha ocurrido un error en la descarga')
        console.error('[GET] Error: ' + status)
      }
    }
  },
  async mounted () {
    await this.getLocations()
    this.gMap()
    this.gDistance()
  }
}
</script>
