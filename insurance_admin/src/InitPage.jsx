import React from 'react';
import styles from './style';
import { Wonders, Navbar, Home, NationalPark, Diversity, Sponsor, Discovery, Rare, Emblematic } from "./components";
import LastBlock from './components/LastBlock';
import { boton } from './assets';

function InitPage() {
  return (
    <>
      <div className='w-full overflow-hidden'>
        <Home></Home>
      </div>
    </>
  )
}

export default InitPage