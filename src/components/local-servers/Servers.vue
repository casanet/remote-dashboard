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

    <!-- Edit comment dialog -->
    <md-dialog v-if="editCommentDialog" :md-active.sync="editCommentDialog">
      <edit-comment :localServer="selectedServer" @finished="onDialogClosed" />
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
    <md-dialog-confirm :md-active.sync="removeServerDialog"
      :md-title="'Remove ' + (selectedServer ? selectedServer.displayName : '')"
      md-content="Are you sure you want to permanently remove local server ?" md-confirm-text="Remove"
      md-cancel-text="Cancel" @md-confirm="onConfirmRemove" />

    <!-- Local servers card container -->
    <md-card class="md-elevation-4">
      <!-- Retrieving local servers loader animation -->
      <md-progress-bar v-if="loading" md-mode="query"></md-progress-bar>
      <!-- Local server table -->
      <md-table class="servers-table md-scrollbar" v-model="searched" md-sort="name" md-sort-order="asc"
        md-height="100%" @md-selected="onSelect">
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

        <md-empty-state v-if="!loading"
          md-description="There is no local server that mtachs your query, create and link the new one if you need">
          <md-button class="md-primary md-raised" @click="createServerDialog = true">Create a new server</md-button>
        </md-empty-state>

        <md-table-row slot="md-table-row" slot-scope="{ item }" md-selectable="single">
          <md-table-cell md-label="Status" md-sort-by="connectionStringStatus">
            <div v-if="item.connectionStringStatus === 'true'">
              ✔️
            </div>
            <div v-else>
              ❗
            </div>
            <md-tooltip md-direction="bottom">
              Last connection time {{ item.lastConnection }}, Last disconnection time {{ item.lastDisconnection }}
            </md-tooltip>
          </md-table-cell>
          <md-table-cell md-label="Name" md-sort-by="displayName">
            <div class="md-layout md-gutter md-alignment-center-space-between">
              <div class="md-layout-item md-size-70">{{ item.displayName }}</div>
              <div class="md-layout-item md-size-20">
                <md-button class="md-icon-button" @click="editNameDialog = true">
                  <md-icon>edit</md-icon>
                  <md-tooltip md-direction="bottom">Edit the '{{ item.displayName }}' display name</md-tooltip>
                </md-button>
              </div>
            </div>
          </md-table-cell>
          <md-table-cell md-label="Free Comment">
            <div class="md-layout md-gutter md-alignment-center-space-between">
              <div class="md-layout-item md-size-70">{{ item.comment }}</div>
              <div class="md-layout-item md-size-20">
                <md-button class="md-icon-button" @click="editCommentDialog = true">
                  <md-icon>comment</md-icon>
                  <md-tooltip md-direction="bottom">Edit the '{{ item.displayName }}' comment</md-tooltip>
                </md-button>
              </div>
            </div>
          </md-table-cell>
          <md-table-cell md-label="Physical address" md-sort-by="macAddress">{{ item.macAddress }}</md-table-cell>
          <md-table-cell md-label="Version" md-sort-by="version">{{ item.version }}</md-table-cell>
          <md-table-cell md-label="Platform" md-sort-by="platform">{{ item.platform }}</md-table-cell>
          <md-table-cell md-label="Local FQDN" >{{ item.localIp || '-' }}</md-table-cell>
          <md-table-cell md-label="Forward users">
            <div class="md-layout md-gutter md-alignment-center-space-between">
              <div class="md-layout-item md-size-10">
                <md-button class="md-icon-button md-raised" @click="validUsersServerDialog = true">
                  <md-icon>supervisor_account</md-icon>
                  <md-tooltip md-direction="bottom">Show & edit the '{{ item.displayName }}' valid forward users
                  </md-tooltip>
                </md-button>
              </div>
            </div>
          </md-table-cell>
          <md-table-cell md-label="Generate API Key">
            <md-button class="md-icon-button md-raised" @click="generateKeyServerDialog = true">
              <md-icon>lock</md-icon>
              <md-tooltip md-direction="bottom">Generate a new API key</md-tooltip>
            </md-button>
          </md-table-cell>
          <md-table-cell md-label="Contact">
            <md-button class="md-icon-button md-raised" @click="contactServerDialog = true">
              <md-icon>contact_mail</md-icon>
              <md-tooltip md-direction="bottom">Edit the '{{ item.displayName }}' contact</md-tooltip>
            </md-button>
          </md-table-cell>
          <md-table-cell md-label="Fetch logs">
            <md-button :disabled="item.macAddress === loadingMachineLogs" class="md-icon-button md-raised" @click="onDownloadLogs(item)">
              <md-icon>{{item.macAddress === loadingMachineLogs ? 'loop' : 'get_app'}}</md-icon>
              <md-tooltip md-direction="bottom">Fetch the '{{ item.displayName }}' logs</md-tooltip>
            </md-button>
          </md-table-cell>
          <md-table-cell md-label="Remove">
            <md-button class="md-icon-button md-raised" @click="removeServerDialog = true">
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
import EditComment from "@/components/local-servers/dialogs/EditComment.vue";

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
          toLower(item.comment || '').includes(term) ||
          toLower(item.macAddress).includes(term) ||
          toLower(item.displayName).includes(term) ||
          (item.platform && toLower(item.platform).includes(term)) ||
          (item.version && toLower(item.version).includes(term)) ||
          (item.validUsers &&
            0 <
            item.validUsers.filter(user => toLower(user).includes(term))
              .length)
      );
    }
  } catch (error) {
    // console.log(error);
  }

  return items;
};

const formatConnectionTime = utcTime => {
  if (!utcTime) {
    return "--:--:--";
  }

  const time = new Date(utcTime);
  return `${time.getDate()}/${time.getMonth() +
    1} ${time.toLocaleTimeString()}`;
};
export default {
  name: "servers",
  components: {
    AddServer,
    KeyGenerator,
    ValidUsers,
    Contact,
    EditDisplayName,
    EditComment
  },
  data() {
    return {
      createServerDialog: false,
      generateKeyServerDialog: false,
      removeServerDialog: false,
      validUsersServerDialog: false,
      contactServerDialog: false,
      editNameDialog: false,
      editCommentDialog: false,
      selectedServer: {},
      search: null,
      servers: [],
      searched: [],
      loading: false,
      loadingMachineLogs: '',
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
      this.editCommentDialog = false;

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

        /**
         * The default rows sorter dont know how to handle boolians,
         * so translate it to an string.
         */
        this.servers.forEach(
          server =>
            (server.connectionStringStatus = server.connectionStatus.toString())
        );

        this.servers.forEach(server => {
          server.lastConnection = formatConnectionTime(server.lastConnection);
          server.lastDisconnection = formatConnectionTime(
            server.lastDisconnection
          );
        });

        /** As default sort by name */
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
    },
    async onDownloadLogs(server) {
      this.loadingMachineLogs = server.macAddress;
      try {
        await restResource.downloadLogs(server);
      } catch (error) {
        this.$snotify.error("The local server logs download failed");
      }
      this.loadingMachineLogs = '';
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