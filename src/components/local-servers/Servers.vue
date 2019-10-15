<template>
  <div id="servers">
    <!-- Local server dialogs -->

    <!-- Create server dialog -->
    <md-dialog :md-active.sync="createServerDialog">
      <add-server @finished="onDialogClosed" />
    </md-dialog>
    <!-- Generate API key dialog -->
    <md-dialog :md-active.sync="generateKeyServerDialog">
      <key-generator :localServer="selectedServer" @finished="onDialogClosed" />
    </md-dialog>

    <!-- Edit display name dialog -->
    <md-dialog v-if="editNameDialog" :md-active.sync="editNameDialog">
      <edit-display-name :localServer="selectedServer" @finished="onDialogClosed" />
    </md-dialog>

    <!-- Edit valid users dialog -->
    <md-dialog v-if="validUsersServerDialog" :md-active.sync="validUsersServerDialog">
      <valid-users :localServer="selectedServer" @finished="onDialogClosed" />
    </md-dialog>
    <!-- Edit contact dialog -->
    <md-dialog v-if="contactServerDialog" :md-active.sync="contactServerDialog">
      <contact :localServer="selectedServer" @finished="onDialogClosed" />
    </md-dialog>
    <!-- Remove local server dialog -->
    <md-dialog-confirm
      :md-active.sync="removeServerDialog"
      :md-title="'Remove ' + (selectedServer ? selectedServer.displayName : '')"
      md-content="Are you sure you want to permanently remove local server ?"
      md-confirm-text="Remove"
      md-cancel-text="Cancel"
      @md-confirm="onConfirmRemove"
    />

    <!-- Local servers card container -->
    <md-card class="md-elevation-4">
      <!-- Retriveing local servers loader animation -->
      <md-progress-bar v-if="loading" md-mode="query"></md-progress-bar>
      <!-- Local server table -->
      <md-table
        class="servers-table md-scrollbar"
        v-model="searched"
        md-sort="name"
        md-sort-order="asc"
        md-fixed-header
        md-height="100%"
        @md-selected="onSelect"
      >
        <!-- Table toolbar -->
        <md-table-toolbar>
          <!-- Create new local server button -->
          <div class="md-toolbar-section-start">
            <md-button class="md-icon-button" @click="getServers">
              <md-icon>refresh</md-icon>
              <md-tooltip md-direction="bottom">Refresh servers table</md-tooltip>
            </md-button>
            <md-button class="md-icon-button" @click="createServerDialog = true">
              <md-icon>add</md-icon>
              <md-tooltip md-direction="bottom">Create a new server</md-tooltip>
            </md-button>
          </div>

          <!-- Filter local servers  -->
          <md-field md-clearable class="md-toolbar-section-end">
            <md-input placeholder="Search..." v-model="search" @input="searchOnTable" />
          </md-field>
        </md-table-toolbar>

        <md-empty-state
          v-if="!loading"
          md-description="There is no local server that mtachs your query, create and link the new one if you need"
        >
          <md-button
            class="md-primary md-raised"
            @click="createServerDialog = true"
          >Create a new server</md-button>
        </md-empty-state>

        <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single">
          <md-table-cell md-label="Status" md-sort-by="connectionStatus">
            <div v-if="item.connectionStatus">✅</div>
            <div v-else>❗</div>
          </md-table-cell>
          <md-table-cell md-label="Physical address" md-sort-by="macAddress">{{ item.macAddress }}</md-table-cell>
          <md-table-cell md-label="Name" md-sort-by="displayName">
            <div class="md-layout md-gutter md-alignment-center">
              <div class="md-layout-item">{{ item.displayName }}</div>
              <div class="md-layout-item md-size-40">
                <md-button class="md-icon-button md-raised" @click="editNameDialog = true">
                  <md-icon>edit</md-icon>
                  <md-tooltip md-direction="bottom">Edit the '{{ item.displayName }}' display name</md-tooltip>
                </md-button>
              </div>
            </div>
          </md-table-cell>
          <md-table-cell md-label="Valid users">
            <div class="md-layout md-gutter md-alignment-center">
              <div class="md-layout-item">
                <ul>
                  <li v-for="(user, i) in item.validUsers" :key="i">{{user}}</li>
                </ul>
              </div>
              <div class="md-layout-item md-size-25">
                <md-button class="md-icon-button md-raised" @click="validUsersServerDialog = true">
                  <md-icon>edit</md-icon>
                  <md-tooltip
                    md-direction="bottom"
                  >Edit the '{{ item.displayName }}' valid forward users</md-tooltip>
                </md-button>
              </div>
            </div>
          </md-table-cell>
          <md-table-cell>
            <md-button class="md-icon-button" @click="generateKeyServerDialog = true">
              <md-icon>lock</md-icon>
              <md-tooltip md-direction="bottom">Generate a new API key</md-tooltip>
            </md-button>
          </md-table-cell>
          <md-table-cell>
            <md-button class="md-icon-button" @click="contactServerDialog = true">
              <md-icon>contact_mail</md-icon>
              <md-tooltip md-direction="bottom">Edit the '{{ item.displayName }}' contact</md-tooltip>
            </md-button>
          </md-table-cell>
          <md-table-cell>
            <md-button class="md-icon-button" @click="removeServerDialog = true">
              <md-icon>delete</md-icon>
              <md-tooltip md-direction="bottom">Remove the '{{ item.displayName }}' local server</md-tooltip>
            </md-button>
          </md-table-cell>
        </md-table-row>
      </md-table>
    </md-card>
  </div>
</template>

<script>
import restResource from "../../services/rest-resource";
import AddServer from "@/components/local-servers/dialogs/AddServer.vue";
import KeyGenerator from "@/components/local-servers/dialogs/KeyGenerator.vue";
import ValidUsers from "@/components/local-servers/dialogs/ValidUsers.vue";
import Contact from "@/components/local-servers/dialogs/Contact.vue";
import EditDisplayName from "@/components/local-servers/dialogs/EditDisplayName.vue";

const toLower = text => {
  return text.toString().toLowerCase();
};

const filterServers = (items, term) => {
  try {
    if (term) {
      term = toLower(term);
      /** Look for term in item properties */
      return items.filter(
        item =>
          toLower(item.macAddress).includes(term) ||
          toLower(item.displayName).includes(term) ||
          (item.validUsers &&
            0 <
              item.validUsers.filter(user => toLower(user).includes(term))
                .length)
      );
    }
  } catch (error) {}

  return items;
};

export default {
  name: "servers",
  components: {
    AddServer,
    KeyGenerator,
    ValidUsers,
    Contact,
    EditDisplayName
  },
  data() {
    return {
      createServerDialog: false,
      generateKeyServerDialog: false,
      removeServerDialog: false,
      validUsersServerDialog: false,
      contactServerDialog: false,
      editNameDialog: false,
      selectedServer: {},
      search: null,
      servers: [],
      searched: [],
      loading: false
    };
  },
  created() {
    /** Fetch local servers */
    this.getServers();
  },
  methods: {
    async onDialogClosed(requireRefresh) {
      this.createServerDialog = false;
      this.generateKeyServerDialog = false;
      this.removeServerDialog = false;
      this.validUsersServerDialog = false;
      this.contactServerDialog = false;
      this.editNameDialog = false;

      if (requireRefresh) {
        await this.getServers();
      }
    },
    onSelect(item) {
      if (item) this.selectedServer = item;
    },
    searchOnTable() {
      this.searched = filterServers(this.servers, this.search);
    },
    async getServers() {
      this.loading = true;
      try {
        this.servers = await restResource.getServers();
        this.servers.sort((itemA, itemB) => {
          return itemA.displayName < itemB.displayName ? -1 : 1;
        });
      } catch (error) {
        this.$snotify.error("Retrieving local servers failed");
        this.servers = [];
      }
      this.searched = this.servers;
      this.loading = false;
    },
    async onConfirmRemove() {
      this.loading = true;
      try {
        await restResource.removeServer(this.selectedServer.macAddress);
        this.$snotify.success("The local server removed successfully");
        await this.onDialogClosed(true);
      } catch (error) {
        this.$snotify.error("Remove the local server failed");
        await this.onDialogClosed(false);
      }
    }
  }
};
</script>

<style scoped>
.servers-table {
  max-width: calc(100vw - 25px);
  height: calc(100vh - 100px);
}
</style>