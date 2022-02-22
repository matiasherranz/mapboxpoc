import { useRef, useEffect, FC } from 'react'

import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import useDebounce from './useDebounce'

import styles from './Mapbox.module.scss'
import {
  initializeMap,
  setupDragEnd,
  setupOnLoad,
  setupZoomEnd,
} from './mapboxHelpers'

type MapboxProps = {
  initialLng: number
  initialLat: number
  initialZoom: number
}

const Mapbox: FC<MapboxProps> = ({ initialLng, initialLat, initialZoom }) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | undefined>(undefined)
  const [dLng, lng, setLng] = useDebounce(initialLng, 1000)
  const [dLat, lat, setLat] = useDebounce(initialLat, 1000)
  const [dZoom, zoom, setZoom] = useDebounce(initialZoom, 1000)

  // Init Mapbox's `map`
  useEffect(() => {
    initializeMap(map, mapContainer, dLat, dLng, dZoom)
  })

  // Setup Mapbox's `onload` event
  useEffect(() => {
    setupOnLoad(map)
  }, [setLat, setLng, setZoom, dZoom])

  // Setup Mapbox's `zoomend` event
  useEffect(() => {
    setupZoomEnd(map, dZoom, setZoom)
  }, [setZoom, dZoom])

  // Setup Mapbox's `dragend` event
  useEffect(() => {
    setupDragEnd(map, dZoom, setLat, setLng)
  }, [setLat, setLng, dZoom])

  return (
    <div className={styles.mapWrapper}>
      <div className={styles.sidebar}>
        Longitude: {dLng} | Latitude: {dLat} | Zoom: {dZoom}
      </div>
      <div ref={mapContainer} className={styles.mapContainer} />
    </div>
  )
}

export default Mapbox
