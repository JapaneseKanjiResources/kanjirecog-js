<template>
    <div>
        <canvas class="signaturePad" ref="signaturePadCanvas"></canvas>

        <div class="clearfix"></div>

         <div class="btn-group">
            <button @click="clear" type="button" class="btn btn-default">
                <i class="fa fa-times"></i>
                Clear Signature
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import signature_pad from "signature_pad";

@Component({})
export default class SignaturePad extends Vue {
    private pad!: signature_pad;

    public $refs!: {
        signaturePadCanvas: HTMLCanvasElement;
    };

    public mounted() {
            const canvas = this.$refs.signaturePadCanvas;

            this.pad = new signature_pad(canvas, {
                onEnd: () => {
                    this.$emit("input", this.pad.toDataURL());
                },
            });
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.signaturePad {
    border: 2px solid #cbc9c6;
    border-radius: 5px;
}
</style>