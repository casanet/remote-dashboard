<template>
  <div>
    <md-card>
      <md-progress-bar md-mode="indeterminate" v-if="sending" />

      <md-subheader>Edit contact email of the {{localServer.displayName}} local server</md-subheader>

      <md-card-content>
        <md-field :class="getValidationClass()">
          <label for="email">The contact email</label>
          <md-input
            type="email"
            name="email"
            id="email"
            autocomplete="email"
            v-model="contactMail"
            :disabled="sending"
          />
          <span class="md-error" v-if="!$v.contactMail.email">Invalid email</span>

          <md-button
            class="md-icon-button md-list-action"
            @click="contactMail = localServer.contactMail"
          >
            <md-icon>refresh</md-icon>
            <md-tooltip
              md-direction="bottom"
            >Reset to the current {{localServer.displayName}} contact</md-tooltip>
          </md-button>
        </md-field>
      </md-card-content>

      <md-card-actions>
        <md-button @click="finished">Cancel</md-button>
        <md-button @click="updateContact" class="md-primary">Update contact</md-button>
      </md-card-actions>
    </md-card>
  </div>
</template>

<script>
import restResource from "../../../services/rest-resource";

import { validationMixin } from "vuelidate";
import { required, email } from "vuelidate/lib/validators";

export default {
  name: "Contact",
  mixins: [validationMixin],
  props: {
    localServer: Object
  },
  data: () => ({
    contactMail: "",
    sending: false
  }),
  validations: {
    contactMail: {
      email
    }
  },
  methods: {
    getValidationClass() {
      const field = this.$v.contactMail;

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
          displayName: this.localServer.displayName,
          validUsers: [...this.localServer.validUsers],
          contactMail: this.contactMail ? this.contactMail : ""
        });
        this.$snotify.success("The local server contact successfully saved");
        this.$emit("finished", true);
      } catch (error) {
        this.$snotify.error("Edit the local server contact failed");
        this.finished();
      }
    },
    finished() {
      this.$emit("finished");
    }
  },
  mounted() {
    /** If the local server prop already passed, copy the contact, for next edit */
    this.contactMail = this.localServer ? this.localServer.contactMail : "";
  },
  watch: {
    localServer(newVal) {
      /** If the local server prop changed, copy the contact, for next edit */
      this.contactMail = newVal ? newVal.contactMail : "";
    }
  }
};
</script>

<style lang="scss" scoped>
</style>