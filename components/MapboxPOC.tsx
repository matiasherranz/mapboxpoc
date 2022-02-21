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
      // style: 'mapbox://styles/mapbox/streets-v11',
      style: 'mapbox://styles/mapbox/dark-v10',
      // center: [lng, lat],
      center: [-103.5917, 40.6699],
      // zoom: zoom,
      zoom: 3,
    })
    // const map.current = new mapboxgl.Map({
    //   container: 'map',
    //   style: 'mapbox://styles/mapbox/dark-v10',
    //   center: [-103.5917, 40.6699],
    //   zoom: 3
    // });
  })

  // useEffect(() => {
    // if (!map.current) return // wait for map to initialize
    // const current = map.current
    // current.on('move', () => {
    //   console.log('getBounds', current?.getBounds())
    //   setLng(Number(current?.getCenter().lng.toFixed(4)))
    //   setLat(Number(current.getCenter().lat.toFixed(4)))
    //   setZoom(Number(current.getZoom().toFixed(2)))
    // })
  // })

  useEffect(() => {
    map?.current?.on('load', async () => {
      const geojson = await getLocation();

      map?.current?.addSource('earthquakes', {
        type: 'geojson',
        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        //         data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
      });

      map?.current?.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        paint: {
        // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
        // with three steps to implement three types of circles:
        //   * Blue, 20px circles when point count is less than 100
        //   * Yellow, 30px circles when point count is between 100 and 750
        //   * Pink, 40px circles when point count is greater than or equal to 750
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            100,
            '#f1f075',
            750,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40
          ]
        }
      });

      map?.current?.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });

      map?.current?.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'earthquakes',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#11b4da',
          'circle-radius': 4,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });
    })

    map?.current?.on('zoomstart', () => {
      console.log('ZOOM START')
    })

    map?.current?.on('zoomend', () => {
      console.log('ZOOM END')
    })

    map?.current?.on('dragstart', () => {
      console.log('DRAG START')
    })

    map?.current?.on('dragend', () => {
      console.log('DRAG END')
    })
  }, [])

  async function getLocation() {
    try {
      const response = await fetch(
        'http://0.0.0.0:7680/api/v1/lender_search/map?bottom_right_lon=-73.79486283748136&bottom_right_lat=40.659420729455675&top_left_lat=40.8357674763742&top_left_lon=-74.12067610742683&precision=5',
        {
          // headers: new Headers({
          //   'Authorization': 'Bearer e427d7d9-c18b-4e57-a7ed-d35960c00d07',
          //   'X-Origin-App': 'test',
          // }),
          method: 'GET'
        },
      )
      const data = await response.json();

      // const { latitude, latitude } = data;

      // map?.current?.flyTo({
      //   center: [longitude, latitude],
      //   speed: 0.5
      // });

      return {
        'type': 'FeatureCollection',
        'features': data.map(({ coordinates }) => ({
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [coordinates.lon, coordinates.lat]
          }
        }))
      };
    } catch (err) {

      console.log('ERROR', err)

      // if (updateSource) clearInterval(updateSource);
      throw new Error(err);
    }
  }

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
