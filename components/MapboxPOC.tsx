import React, { useRef, useEffect, useState } from 'react'

import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import styles from './MapboxPOC.module.scss'

mapboxgl.accessToken =
  'pk.eyJ1IjoibWF0aWFzaGVycmFueiIsImEiOiJja3drenRhbGoxeDZtMnZuczFyd2lzbDJyIn0.DcL4Jp8fJ1XY2PtKggGxaA'

const MapboxPOC = () => {
  const mapContainer = useRef(null)
  const map = useRef<mapboxgl.Map | undefined>(undefined)
  const [lng, setLng] = useState(-70.9001)
  const [lat, setLat] = useState(42.3501)
  const [zoom, setZoom] = useState(9)

  useEffect(() => {
    if (map.current) return // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current ?? '',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom,
    })
  })

  useEffect(() => {
    if (!map.current) return // wait for map to initialize
    const current = map.current
    current.on('move', () => {
      setLng(Number(current?.getCenter().lng.toFixed(4)))
      setLat(Number(current.getCenter().lat.toFixed(4)))
      setZoom(Number(current.getZoom().toFixed(2)))
    })
  })

  return (
    <div className={styles.mapWrapper}>
      <div className={styles.sidebar}>
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className={styles.mapContainer} />
    </div>
  )
}

export default MapboxPOC
