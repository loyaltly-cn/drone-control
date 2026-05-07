<script setup>
    import even from './even'
    import {state,obj} from "./index";
    const init = e => even.init(e)
</script>
<template>
    <Map @ready="init"/>
    <bottom-bar @change="even.change" :connect="state.connect" :pause="state.pause" :source="obj.source"/>
</template>