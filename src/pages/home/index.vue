<script setup>
    import even from './even'
    import {state,obj} from "./index";
    const init = e => even.init(e)
</script>
<template>
    <Map @ready="init" @on_line="even.on_line"/>
    <bottom-bar @change="even.change" :connect="state.connect" :pause="state.pause" :source="obj.source"/>
</template>