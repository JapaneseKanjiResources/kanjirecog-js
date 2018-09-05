<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <SignaturePad />    
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import SignaturePad from "./components/SignaturePad.vue";

@Component({
  components: {
    SignaturePad,
  },
})
export default class App extends Vue {}
</script>
