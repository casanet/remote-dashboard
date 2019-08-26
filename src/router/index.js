import Vue from 'vue'
import Router from 'vue-router'

/** Import components */
import Servers from '@/components/local-servers/Servers'
import Dashboard from '@/components/Dashboard'
import Login from '@/components/Login'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/login',
            component: Login
        },
        {
            path: '/dashboard',
            component: Dashboard,
            children: [
                { path: 'servers', component: Servers, },
                {
                    path: '*',
                    redirect: '/'
                },
                {
                    path: '/',
                    redirect: 'servers'
                }
            ]
        },
        {
            path: '*',
            redirect: 'dashboard'
        }
    ]
})
