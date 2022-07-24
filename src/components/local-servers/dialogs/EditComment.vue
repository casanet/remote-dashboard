<template>
  <div>
    <md-card>
      <md-progress-bar md-mode="indeterminate" v-if="sending" />

      <md-subheader>Edit the comment of the {{localServer.displayName}} local server</md-subheader>

      <md-card-content>
        <md-field :class="getValidationClass()">
          <label for="comment">The Comment</label>
          <md-input
            name="comment"
            id="comment"
            v-model="comment"
            :disabled="sending"
          />
          <span class="md-error" v-if="!$v.comment.required">The comment is required</span>

          <md-button
            class="md-icon-button md-list-action"
            @click="comment = localServer.comment"
          >
            <md-icon>refresh</md-icon>
            <md-tooltip
              md-direction="bottom"
            >Reset to the current {{localServer.displayName}} comment</md-tooltip>
          </md-button>
        </md-field>
      </md-card-content>

      <md-card-actions>
        <md-button @click="finished">Cancel</md-button>
        <md-button @click="updateContact" class="md-primary">Update Comment</md-button>
      </md-card-actions>
    </md-card>
  </div>
</template>

<script>
import restResource from "../../../services/rest-resource";

import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";

export default {
  name: "EditComment",
  mixins: [validationMixin],
  props: {
    localServer: Object
  },
  data: () => ({
    comment: "",
    sending: false
  }),
  validations: {
    comment: {
      required
    }
  },
  methods: {
    getValidationClass() {
      const field = this.$v.comment;

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
          contactMail: this.localServer.contactMail || "",
          comment: this.comment,
        });
        this.$snotify.success("The local server comment successfully saved");
        this.$emit("finished", true);
      } catch (error) {
        this.$snotify.error("Edit the local server comment failed");
        this.finished();
      }
    },
    finished() {
      this.$emit("finished");
    }
  },
  mounted() {
    /** If the local server prop already passed, copy the contact, for next edit */
    this.comment = this.localServer ? this.localServer.comment : "";
  },
  watch: {
    localServer(newVal) {
      /** If the local server prop changed, copy the contact, for next edit */
      this.comment = newVal ? newVal.comment : "";
    }
  }
};
</script>

<style lang="scss" scoped>
</style>