<script setup>
import even from './even'
  onBeforeMount(() => even.init())
</script>

<template>
  <button @click="even.handleConnect" >连接</button>
  <button @click="even.handlePause" >暂停</button>
  <button @click="even.handleResume">继续</button>
  <button @click="even.handleDisconnect">断开</button>
</template>
