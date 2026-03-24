import {StyleProvider, Themes} from "@varlet/ui";
// import theme from "./custom";
import { theme_type } from "./type";
const toggleTheme = (type:theme_type) =>{
    console.log(type)
    switch (type){
        case 'dark':
            StyleProvider(Themes.dark)
            break
        case 'light':
            StyleProvider(null)
            break
        case 'md3-light':
            StyleProvider(Themes.md3Light)
            break
        case 'md3-dark':
            StyleProvider(Themes.md3Dark)
            break
        case 'default':
            window.matchMedia('(prefers-color-scheme: dark)').matches?'md3-dark':'md3-light'
            break
        // case 'custom':
        //     StyleProvider(theme)
        //     break;
        default:break
    }
}

const init = () => toggleTheme('md3-dark')

export default {
    init,
    toggleTheme
}