<template>
  <div>
    <md-card>
      <md-progress-bar md-mode="indeterminate" v-if="sending" />

      <md-subheader>Edit the display name of the {{localServer.displayName}} local server</md-subheader>

      <md-card-content>
        <md-field :class="getValidationClass()">
          <label for="displayName">The Desplay Name</label>
          <md-input
            name="displayName"
            id="displayName"
            v-model="displayName"
            :disabled="sending"
          />
          <span class="md-error" v-if="!$v.displayName.required">The name is required</span>

          <md-button
            class="md-icon-button md-list-action"
            @click="displayName = localServer.displayName"
          >
            <md-icon>refresh</md-icon>
            <md-tooltip
              md-direction="bottom"
            >Reset to the current {{localServer.displayName}} display name</md-tooltip>
          </md-button>
        </md-field>
      </md-card-content>

      <md-card-actions>
        <md-button @click="finished">Cancel</md-button>
        <md-button @click="updateContact" class="md-primary">Update Name</md-button>
      </md-card-actions>
    </md-card>
  </div>
</template>

<script>
import restResource from "../../../services/rest-resource";

import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";

export default {
  name: "EditDisplayName",
  mixins: [validationMixin],
  props: {
    localServer: Object
  },
  data: () => ({
    displayName: "",
    sending: false
  }),
  validations: {
    displayName: {
      required
    }
  },
  methods: {
    getValidationClass() {
      const field = this.$v.displayName;

      if (field) {
        return {
          "md-invalid": field.$invalid && field.$dirty
        };
      }
    },
    async updateContact() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }

      this.sending = true;
      try {
        await restResource.editServer({
          macAddress: this.localServer.macAddress,
          displayName: this.displayName,
          validUsers: [...this.localServer.validUsers],
          contactMail: this.localServer.contactMail || ""
        });
        this.$snotify.success("The local server display name successfully saved");
        this.$emit("finished", true);
      } catch (error) {
        this.$snotify.error("Edit the local server display name failed");
        this.finished();
      }
    },
    finished() {
      this.$emit("finished");
    }
  },
  mounted() {
    /** If the local server prop already passed, copy the contact, for next edit */
    this.displayName = this.localServer ? this.localServer.displayName : "";
  },
  watch: {
    localServer(newVal) {
      /** If the local server prop changed, copy the contact, for next edit */
      this.displayName = newVal ? newVal.displayName : "";
    }
  }
};
</script>

<style lang="scss" scoped>
</style>