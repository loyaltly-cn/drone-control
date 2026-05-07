type Emits = 'connect'|'pause'|'change-drone-cell'|'cog'|'db'

const buttons:Array<{
    text:string,
    emit:Emits,
    icon:string,
}> = [{
    text:'飞机列表',
    emit:'change-drone-cell',
    icon:'drone'
},{
    text:'设置',
    emit:'cog',
    icon:'cog-outline'
}]

export {
    buttons
}

export type { Emits }