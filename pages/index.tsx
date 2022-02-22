import type { NextPage } from 'next'
import Head from 'next/head'

import Mapbox from '../components/Mapbox'

import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>MapBox POC</title>
        <meta name="description" content="NextJS + MapBox POC" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Mapbox initialLat={34.3217} initialLng={-121.6353} initialZoom={5.6} />
    </div>
  )
}

export default Home
