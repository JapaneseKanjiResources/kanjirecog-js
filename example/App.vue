<template>
    <div id="app" class="signature-pad">
        <div class="signature-pad--body">
            <canvas ref="signaturePadCanvas"></canvas>
        </div>

        <div class="signature-pad--footer">
            <div class="signature-pad--actions">
                <b-button-group size="sm" style="margin-bottom: 0.5rem">
                    <b-button variant="dark">CLEAR</b-button>
                    <b-button variant="dark">UNDO</b-button>
                </b-button-group>

                <b-button-group size="sm" style="margin-bottom: 0.5rem">
                    <b-button variant="dark">FUZZY</b-button>
                </b-button-group>
            </div>
        </div>

        <b-button-group size="sm">
            <b-button v-for="btn in buttons"
                      class="remove-focus-box-shadow"
                      :pressed.sync="btn.state" 
                      :variant="btn.variant" 
                      :key="btn.variant">
                {{ btn.caption }}
            </b-button>
        </b-button-group>
        
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import signature_pad from "signature_pad";

@Component({})
export default class App extends Vue {
  private pad!: signature_pad;
    private canvas!: HTMLCanvasElement;

    // dynamic component
    public $refs!: {
        signaturePadCanvas: HTMLCanvasElement;
    };

    // lifecycle hook
    public mounted() {
        this.$nextTick(() => {
            // Code that will run only after the
            // entire view has been rendered
            window.addEventListener("resize", this.resizeCanvas);

            this.canvas = this.$refs.signaturePadCanvas;

            this.pad = new signature_pad(this.canvas, {
                onEnd: () => {
                    this.$emit("input", this.pad.toDataURL());
                },
            });

            this.resizeCanvas();
        });
    }

    private resizeCanvas() {
        // When zoomed out to less than 100%, for some very strange reason,
        // some browsers report devicePixelRatio as less than 1
        // and only part of the canvas is cleared then.
        const ratio =  Math.max(window.devicePixelRatio || 1, 1);
        this.canvas.width = this.canvas.offsetWidth * ratio;
        this.canvas.height = this.canvas.offsetHeight * ratio;
        this.canvas.getContext("2d").scale(ratio, ratio);
        // This library does not listen for canvas changes, so after the canvas is automatically
        // cleared by the browser, SignaturePad#isEmpty might still return false, even though the
        // canvas looks empty, because the internal data of this library wasn't cleared. To make sure
        // that the state of this library is consistent with visual state of the canvas, you
        // have to clear it manually.
        this.pad.clear();
    }

    // // Component Props
    // @Prop() private data!: any[];

    public variant = "outline-dark";

    // Initial data can be declared as class properties...
    public buttons = [
        { variant: this.variant, caption: "一" },
        { variant: this.variant, caption: "二" },
        { variant: this.variant, caption: "三" },
        { variant: this.variant, caption: "四" },
        { variant: this.variant, caption: "五" },
        { variant: this.variant, caption: "六" },
        { variant: this.variant, caption: "七" },
        { variant: this.variant, caption: "八" },
        { variant: this.variant, caption: "九" },
        { variant: this.variant, caption: "十" },
      ];
}
</script>

<style lang="scss">
  // find these variables in docs and node_modules/bootstrap/scss/bootstrap.scss
  // $font-size-sm: .675rem !default;
  @import "~bootstrap/scss/bootstrap";  // import complete bootstrap.scss source from node_modules using ~ alias

.remove-focus-box-shadow {
  &:focus,
  &.focus {
    box-shadow: none;
  }
}
</style>

<style>
/* style borrowed from http://szimek.github.io/signature_pad */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
      -ms-flex-pack: center;
          justify-content: center;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
  height: 100vh;
  width: 100%;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
  margin: 0;
  padding: 32px 16px;
  font-family: Helvetica, Sans-Serif;
}

.signature-pad {
  position: relative;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
    -ms-flex-direction: column;
        flex-direction: column;
  font-size: 10px;
  width: 100%;
  height: 100%;
  max-width: 700px;
  max-height: 460px;
  border: 1px solid #e8e8e8;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.27), 0 0 40px rgba(0, 0, 0, 0.08) inset;
  border-radius: 4px;
  padding: 16px;
}

.signature-pad::before,
.signature-pad::after {
  position: absolute;
  z-index: -1;
  content: "";
  width: 40%;
  height: 10px;
  bottom: 10px;
  background: transparent;
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.4);
}

.signature-pad::before {
  left: 20px;
  -webkit-transform: skew(-3deg) rotate(-3deg);
          transform: skew(-3deg) rotate(-3deg);
}

.signature-pad::after {
  right: 20px;
  -webkit-transform: skew(3deg) rotate(3deg);
          transform: skew(3deg) rotate(3deg);
}

.signature-pad--body {
  position: relative;
  -webkit-box-flex: 1;
      -ms-flex: 1;
          flex: 1;
  border: 1px solid #f4f4f4;
}

.signature-pad--body
canvas {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.02) inset;
}

.signature-pad--footer {
  color: #C3C3C3;
  text-align: center;
  font-size: 1.2em;
  margin-top: 8px;
}

.signature-pad--actions {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: justify;
      -ms-flex-pack: justify;
          justify-content: space-between;
  margin-top: 8px;
}
</style>
