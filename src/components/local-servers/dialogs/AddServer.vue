<template>
  <div>
    <form novalidate class="md-layout" @submit.prevent="validateServer">
      <md-card class="md-layout-item">
        <md-card-header>
          <div class="md-title">Add new local server</div>
        </md-card-header>

        <md-card-content>
          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('displayName')">
                <label for="displayName">Display name</label>
                <md-input
                  name="displayName"
                  id="displayName"
                  autocomplete="given-name"
                  v-model="form.displayName"
                  :disabled="sending"
                />
                <span class="md-error" v-if="!$v.form.displayName.required">The name is required</span>
                <span
                  class="md-error"
                  v-else-if="!$v.form.displayName.minlength"
                >The name can't be less than 3 characters length</span>
              </md-field>
            </div>

            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('physicalAddress')">
                <label for="last-name">Physical Address</label>
                <md-input
                  name="physicalAddress"
                  id="physicalAddress"
                  autocomplete="physical-address"
                  v-model="form.physicalAddress"
                  :disabled="sending"
                />
                <span
                  class="md-error"
                  v-if="!$v.form.physicalAddress.required"
                >The physical address is required</span>
                <span
                  class="md-error"
                  v-else-if="!$v.form.physicalAddress.minlength"
                >The physical address should be 12 characters length</span>
                <span
                  class="md-error"
                  v-else-if="!$v.form.physicalAddress.maxlength"
                >The physical address should be 12 characters length</span>
              </md-field>
            </div>
          </div>

          <md-field :class="getValidationClass('validEmail')">
            <label for="email">Valid Email</label>
            <md-input
              type="email"
              name="email"
              id="email"
              autocomplete="email"
              v-model="form.validEmail"
              :disabled="sending"
            />
            <span class="md-helper-text">Later you will able to add more accounts</span>
            <span class="md-error" v-if="!$v.form.validEmail.required">The valid email is required</span>
            <span class="md-error" v-else-if="!$v.form.validEmail.email">Invalid email</span>
          </md-field>
        </md-card-content>

        <md-progress-bar md-mode="indeterminate" v-if="sending" />

        <md-card-actions>
          <md-button @click="finished">Cancel</md-button>
          <md-button type="submit" class="md-primary" :disabled="sending">Add server</md-button>
        </md-card-actions>
      </md-card>
    </form>
  </div>
</template>

<script>
import restResource from "../../../services/rest-resource";

import { validationMixin } from "vuelidate";
import {
  required,
  email,
  minLength,
  maxLength
} from "vuelidate/lib/validators";

export default {
  name: "AddServer",
  mixins: [validationMixin],
  data: () => ({
    form: {
      displayName: null,
      physicalAddress: null,
      validEmail: null
    },
    sending: false
  }),
  validations: {
    form: {
      displayName: {
        required,
        minLength: minLength(3)
      },
      physicalAddress: {
        required,
        maxLength: maxLength(12),
        minLength: minLength(12)
      },
      validEmail: {
        required,
        email
      }
    }
  },
  methods: {
    getValidationClass(fieldName) {
      const field = this.$v.form[fieldName];

      if (field) {
        return {
          "md-invalid": field.$invalid && field.$dirty
        };
      }
    },
    clearForm() {
      this.$v.$reset();
      this.form.displayName = null;
      this.form.physicalAddress = null;
      this.form.validEmail = null;
    },
    async saveServer() {
      this.sending = true;

      try {
        await restResource.addServer(
          this.form.displayName,
          this.form.physicalAddress,
          this.form.validEmail
        );
        this.$snotify.success("A new local server created successfully");
        this.$emit("finished", true);
      } catch (error) {
        this.$snotify.error("Create a new local server failed");
        this.finished();
      }
    },
    validateServer() {
      this.$v.$touch();

      if (!this.$v.$invalid) {
        this.saveServer();
      }
    },
    finished() {
      this.$emit("finished");
    }
  }
};
</script>

<style lang="scss" scoped>
.md-progress-bar {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
}
</style>