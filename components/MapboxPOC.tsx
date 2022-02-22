import React, { useRef, useEffect, useState } from 'react'
import ReactMapboxGl, { Marker } from '../../../'

import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import useDebounce from './useDebounce'
import styles from './MapboxPOC.module.scss'

mapboxgl.accessToken =
  'pk.eyJ1IjoibWF0aWFzaGVycmFueiIsImEiOiJja3drenRhbGoxeDZtMnZuczFyd2lzbDJyIn0.DcL4Jp8fJ1XY2PtKggGxaA'

const API = 'http://0.0.0.0:7680/api/v1/lender_search/map'

const MapboxPOC = () => {
  const mapContainer = useRef(null)
  const map = useRef<mapboxgl.Map | undefined>(undefined)
  const [lng, setLng] = useState(-70)
  const [lat, setLat] = useState(42)

  const [dZoom, zoom, setZoom] = useDebounce(9, 500)
  // TODO: Initialize this to something more meaningful
  const [dBounds, bounds, setBounds] = useDebounce(
    { tl: { lat, lng }, br: { lat, lng } },
    500
  )

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
