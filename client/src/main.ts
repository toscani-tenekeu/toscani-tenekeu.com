import './assets/main.css'

import { createApp } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faTerminal, faBars, faXmark, faBook, faGraduationCap, faNewspaper,
  faVideo, faArrowRight, faChevronRight, faClock, faUser, faCalendar,
  faTag, faMagnifyingGlass, faCirclePlay, faCode, faFilter,
  faBookOpen, faChalkboardUser, faPenNib, faFilm, faSun, faMoon,
  faGlobe, faDownload, faArrowUpRightFromSquare, faBriefcase,
} from '@fortawesome/free-solid-svg-icons'
import { faPython, faJs, faVuejs, faAndroid, faApple, faWindows, faLinux } from '@fortawesome/free-brands-svg-icons'

library.add(
  faTerminal, faBars, faXmark, faBook, faGraduationCap, faNewspaper,
  faVideo, faArrowRight, faChevronRight, faClock, faUser, faCalendar,
  faTag, faMagnifyingGlass, faCirclePlay, faCode, faFilter,
  faBookOpen, faChalkboardUser, faPenNib, faFilm, faSun, faMoon,
  faGlobe, faDownload, faArrowUpRightFromSquare, faBriefcase,
  faPython, faJs, faVuejs, faAndroid, faApple, faWindows, faLinux,
)

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.component('FontAwesomeIcon', FontAwesomeIcon)

app.mount('#app')
