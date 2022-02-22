import type { NextPage } from 'next'
import Head from 'next/head'
import Script from 'next/script'

import MapboxPOC from '../components/MapboxPOC'

import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>MapBox POC</title>
        <meta name="description" content="NextJS + MapBox POC" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MapboxPOC />
    </div>
  )
}

export default Home
