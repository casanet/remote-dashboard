<template>
  <div class="page-container">
    <md-app md-mode="reveal">
      <md-app-toolbar>
        <md-button class="md-icon-button" @click="menuVisible = !menuVisible">
          <md-icon>menu</md-icon>
        </md-button>
        <span class="md-title">Remote management</span>

        <div class="md-toolbar-section-end">
          <md-button class="md-icon-button" @click="logout">
            <md-icon>exit_to_app</md-icon>
            <md-tooltip md-direction="bottom">Log out</md-tooltip>
          </md-button>
        </div>
      </md-app-toolbar>

      <md-app-drawer :md-active.sync="menuVisible">
        <md-toolbar class="md-transparent" md-elevation="0">Navigation</md-toolbar>

        <md-list>
          <md-list-item to="/dashboard/servers">
            <md-icon>computer</md-icon>
            <span class="md-list-item-text">Servers</span>
          </md-list-item>
        </md-list>
      </md-app-drawer>

      <md-app-content>
        <!-- Dashboard routing -->
        <router-view></router-view>
      </md-app-content>
    </md-app>
  </div>
</template>

<script>
import restResource from "../services/rest-resource";

export default {
  name: "dashboard",
  components: {},
  data: () => ({
    menuVisible: false
  }),
  mounted() {},
  methods: {
    async logout() {
      try {
        await restResource.logout();
        this.$router.push("/login");
      } catch (error) {
        this.$snotify.error('Logout failed');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.md-app {
  height: 100vh;
  border: 1px solid rgba(#000, 0.12);
}

.md-drawer {
  width: 230px;
  max-width: calc(100vw - 125px);
}
</style>