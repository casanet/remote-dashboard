<template>
  <div>
    <!-- Warning message before generating dialog -->
    <md-card v-if="!submit">
      <md-progress-bar md-mode="indeterminate" v-if="sending" />
      <md-card-header>
        <div class="md-title">Generate an API key to {{localServer.displayName}}</div>
      </md-card-header>

      <md-card-content>
        Generate a new authentication key for the local server.
        (it will delete current key if exist).
        <br />
        <br />
        <b>
          KEEP GENERATED KEY PRIVATE AND SECURE,
          PUT IT IN YOUR LOCAL SERVER AND NEVER SHOW IT TO ANYBODY!!!
        </b>
      </md-card-content>

      <md-card-actions>
        <md-button @click="finished" :disabled="sending">Cancel</md-button>
        <md-button @click="generate" :disabled="sending" class="md-primary">Generate</md-button>
      </md-card-actions>
    </md-card>
    <!-- Show generated key dialog -->
    <md-card v-else>
      <md-card-header>
        <div class="md-title">The generated API key for {{localServer.displayName}}</div>
      </md-card-header>

      <md-card-content>
        <md-field>
          <label>API key</label>
          <md-textarea v-model="generatedKey" readonly></md-textarea>
          <md-button class="md-icon-button" @click="copyKeyToClipboard">
            <md-icon>assignment</md-icon>
            <md-tooltip md-direction="bottom">Copy to the clipboard</md-tooltip>
          </md-button>
        </md-field>
        <p>
          To finish the authorization process, at the local server dashboard, open 
          settings -> remote server -> edit connection, 
          then in the dialog paste the remote server URI
          (it's should be <a :href="serverWebSocketsURI">{{ serverWebSocketsURI }}</a>)
          then paste the above-generated API code, and submit.
        </p>
        <b> 
          REMEMBER! KEEP GENERATED KEY PRIVATE AND SECURE,
          PUT IT IN YOUR LOCAL SERVER AND NEVER SHOW IT TO ANYBODY!!!
        </b>
      </md-card-content>

      <md-card-actions>
        <md-button @click="finishedAndRefresh" class="md-primary">I'm finished</md-button>
      </md-card-actions>
    </md-card>

    <md-snackbar
      md-position="center"
      :md-duration="5000"
      :md-active.sync="showCopySnackbar"
      md-persistent
    >
      <span>The generated API key copied to the clipboard, BE CAREFUL!</span>
      <md-button class="md-primary" @click="showCopySnackbar = false">OK</md-button>
    </md-snackbar>
  </div>
</template>

<script>
import restResource from "../../../services/rest-resource";

/** Black box, to copy any test to the clipboard */
const copyStringToClipboard = str => {
  // Create new element
  var el = document.createElement("textarea");
  // Set value (string to be copied)
  el.value = str;
  // Set non-editable to avoid focus and move outside of view
  el.setAttribute("readonly", "");
  el.style = { position: "absolute", left: "-9999px" };
  document.body.appendChild(el);
  // Select text inside element
  el.select();
  // Copy text to clipboard
  document.execCommand("copy");
  // Remove temporary element
  document.body.removeChild(el);
};

export default {
  name: "KeyGenerator",
  props: {
    localServer: Object
  },
  data: () => ({
    serverWebSocketsURI : '',
    showCopySnackbar: false,
    generatedKey: "",
    submit: false,
    sending: false
  }),
  created: function () {
    /** Extract the WS URI of the remote server from the API URL */
    const originalRemoteServerURL = process.env.VUE_APP_API_URL || 'http://127.0.0.1:3001';
    this.serverWebSocketsURI = 'ws' + originalRemoteServerURL.substring(4, originalRemoteServerURL.length);
  },
  methods: {
    async generate() {
      this.sending = true;

      try {
        this.generatedKey = await restResource.generateServerKey(
          this.localServer.macAddress
        );
        this.submit = true;
      } catch (error) {
        this.$snotify.error("Generating API key failed");
      }

      this.sending = false;
    },
    finished() {
      this.$emit("finished");
    },
    finishedAndRefresh() {
      this.$emit("finished", true);
    },
    copyKeyToClipboard() {
      copyStringToClipboard(this.generatedKey);
      this.showCopySnackbar = true;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
