<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    initGoogleMap () {
      try {
        console.info('[GET] initGoogleMap')
        const googleMapScript = document.createElement('SCRIPT'),
          url = 'https://maps.googleapis.com/maps/api/js?key=APIKEY'
        googleMapScript.setAttribute('src', url)
        googleMapScript.setAttribute('async', '')
        googleMapScript.setAttribute('defer', '')
        document.head.appendChild(googleMapScript)
      } catch (e) {
        console.error(e)
        Error.call(this, 'Ha ocurrido un error instanciando GoogleMap')
      }
    }
  },
  mounted () {
    this.initGoogleMap()
  }
}
</script>
