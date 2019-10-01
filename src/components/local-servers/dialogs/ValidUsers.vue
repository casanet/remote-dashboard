<template>
  <div>
    <md-card>
      <md-progress-bar md-mode="indeterminate" v-if="sending" />

      <md-list class="md-double-line md-scrollbar md-dense">
        <md-subheader>Edit vaild users of the {{localServer.displayName}} local server</md-subheader>

        <md-list-item v-for="(user, i) in validUsers" :key="i">
          <div class="md-list-item-text">
            <span>{{user}}</span>
          </div>

          <md-button class="md-icon-button md-list-action" @click="removeUser(user)">
            <md-icon>remove</md-icon>
            <md-tooltip md-direction="bottom">Remove {{user}} from being a valid-user</md-tooltip>
          </md-button>
        </md-list-item>

        <md-divider></md-divider>

        <md-list-item>
          <md-field :class="getValidationClass()">
            <label for="email">New valid email</label>
            <md-input
              type="email"
              name="email"
              id="email"
              autocomplete="email"
              v-model="newUserBlank"
              :disabled="sending"
            />
            <span class="md-error" v-if="!$v.newUserBlank.required">The email is required</span>
            <span class="md-error" v-else-if="!$v.newUserBlank.email">Invalid email</span>
          </md-field>

          <md-button class="md-icon-button md-list-action" @click="addUser(newUserBlank)">
            <md-icon>add</md-icon>
            <md-tooltip md-direction="bottom">Add {{newUserBlank}} to the valid users</md-tooltip>
          </md-button>
        </md-list-item>
      </md-list>

      <md-card-actions>
        <md-button @click="finished">Cancel</md-button>
        <md-button @click="updateValidUsers" class="md-primary">I'm finished</md-button>
      </md-card-actions>
    </md-card>
  </div>
</template>

<script>
import restResource from "../../../services/rest-resource";

import { validationMixin } from "vuelidate";
import { required, email } from "vuelidate/lib/validators";

export default {
  name: "ValidUsers",
  mixins: [validationMixin],
  props: {
    localServer: Object
  },
  data: () => ({
    newUserBlank: "",
    validUsers: [],
    sending: false
  }),
  validations: {
    newUserBlank: {
      required,
      email
    }
  },
  methods: {
    getValidationClass() {
      const field = this.$v.newUserBlank;

      if (field) {
        return {
          "md-invalid": field.$invalid && field.$dirty
        };
      }
    },
    async updateValidUsers() {
      this.sending = true;
      try {
        await restResource.editServer({
          macAddress: this.localServer.macAddress,
          displayName: this.localServer.displayName,
          validUsers: [...this.validUsers],
          contactMail : this.localServer.contactMail || ""
        });
        this.$snotify.success("The local server valid users successfully saved");
        this.$emit("finished", true);
      } catch (error) {
        this.$snotify.error("Edit the local server valid users failed");
        this.finished();
      }
      this.validUsers = [];
    },
    finished() {
      this.$emit("finished");
    },
    addUser() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }
      this.validUsers.push(this.newUserBlank);
      this.newUserBlank = "";
      this.$v.$reset();
    },
    removeUser(userToRemove) {
      this.validUsers = this.validUsers.filter(user => {
        return userToRemove !== user;
      });
    }
  },
  mounted() {
    /** If the local server prop already passed, copy the valid users, for next edit */
    this.validUsers = [
      ...(this.localServer && this.localServer.validUsers
        ? this.localServer.validUsers
        : [])
    ];
  },
  watch: {
    localServer(newVal) {
      /** If the local server prop changed, copy the new valid users, for next edit */
      this.validUsers = [
        ...(newVal && newVal.validUsers ? newVal.validUsers : [])
      ];
    }
  }
};
</script>

<style lang="scss" scoped>
</style>