import { useNavigate } from 'react-router-dom';
import { favicon } from '../assets';

import { FaUsers } from 'react-icons/fa6';
import { MdHome, MdSettings } from 'react-icons/md';

function NavbarAdmin() {
  const navigate = useNavigate();

  return (

    <>
      <div className='bg-gray-50 dark:bg-gray-900'>
        <aside id="sidebar-multi-level-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
          <div className='h-[200px] bg-gray-50 dark:bg-gray-800  flex justify-center items-center'>
            <img src={favicon} alt="" />
          </div>
          <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
            <ul className="space-y-5 font-medium ">
              <li>
                <a href="/dashboard" className="flex items-center py-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                  <MdHome className='flex-shrink-0 w-8 h-8 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'></MdHome>
                  <span className="ms-3">Inicio</span>
                </a>
              </li>

              <li>
                <a href="/parametros-generales" className="flex items-center py-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ">
                  <MdSettings className='flex-shrink-0 w-8 h-8 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'></MdSettings>
                  <span className="flex-1 ms-3 whitespace-nowrap">Parámetros Generales</span>
                  {/* <span className="inline-flex items-center justify-center px-2 ms-3 text-sm font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">Pro</span> */}
                </a>
              </li>
            </ul>

            <ul className="space-y-5 font-medium border-t border-gray-200 dark:border-gray-700 mt-5">
              <li className='mt-5'>
                <a href="/usuarios" className="flex items-center py-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                  <FaUsers className='flex-shrink-0 w-8 h-8 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'></FaUsers>
                  <span className="ms-3">Usuarios</span>
                </a>
              </li>
            </ul>

          </div>
        </aside>
      </div>
    </>
  )
}

export default NavbarAdmin