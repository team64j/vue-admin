<script>
import store from '../store'
import router from '../router'

export default {
  name: 'Login',
  data () {
    return {
      form: {},
      data: null,
      connected: false,
      lang: {
        key: 'en',
        user: 'User',
        password: 'Password',
        remember: 'Remember me',
        login: 'Login'
      },
      errors: {},
      hostname: store.getters['Storage/get']('hostname') || location.origin,
      hostnames: store.getters['Storage/get']('hostnames') || [],
      logged: false,
      isCheckServer: false,
      isLogin: false,
      isShowLanguages: false,
      isShowHostnames: false
    }
  },
  created () {
    this.checkServer()
  },
  methods: {
    checkServer () {
      this.data = null
      this.connected = false
      this.errors = {}
      this.isCheckServer = true

      if (!this.hostname) {
        this.hostname = location.origin
      }

      store.dispatch('Storage/set', { hostname: this.hostname.replace(/\/$/g, '') })

      axios.post('bootstrap').then(r => {
        if (typeof r.data === 'string') {
          this.errors['hostname'] = true
          return
        }

        this.data = r.data['data'] || {}

        if (this.data.version) {
          this.connected = true
        }

        if (this.data.languages?.length) {
          this.lang = this.data.languages[store.getters['Storage/get']('lang') || 'en'] ?? {}
        }
      }).catch(() => {
        this.connected = false
        this.errors['hostname'] = true
      }).finally(() => {
        this.isCheckServer = false
      })
    },
    showLanguages () {
      this.isShowLanguages = !this.isShowLanguages
    },
    selectLanguage (lang) {
      this.lang = lang
      store.dispatch('Storage/set', { lang: lang.key })
      this.showLanguages()
    },
    showHostnames () {
      this.isShowHostnames = !this.isShowHostnames
    },
    selectHostname (hostname) {
      this.hostname = hostname
      store.dispatch('Storage/set', { hostname: this.hostname })
      this.showHostnames()
      this.checkServer()
    },
    login () {
      this.errors = {}
      this.isLogin = true

      axios.post('/auth/login', this.form).then(r => {
        const data = r.data['data']

        if (data['access_token']) {
          this.logged = true
          store.dispatch('Storage/set', { lang: this.lang.key })

          if (!this.hostnames.some(i => i === this.hostname)) {
            this.hostnames.push(this.hostname)
            store.dispatch('Storage/set', { hostnames: this.hostnames })
          }

          store.dispatch('Storage/set', {
            token: data['access_token'],
            tokenExpiresIn: data['expires_in']
          }).then(() => {
            router.push('/').then(() => location.reload())
          })
        }
      }).catch(() => {
        this.errors['username'] = true
        this.errors['password'] = true
      }).finally(() => {
        this.isLogin = false
      })
    }
  }
}
</script>

<template>
  <div class="dark flex w-full h-full justify-center items-center bg-login">
    <div
        class="relative overflow-hidden bg-black/80 text-white/80 font-medium rounded-xl pt-6 px-8 pb-6 shadow-lg w-[33rem] max-w-[95%]">

      <div class="flex items-center justify-center">
        <img src="../../img/logo.svg" :src="data['logo']" class="inline-block h-14">
        <div class="text-3xl font-bold text-white ml-3 uppercase">Vue Admin</div>
      </div>

      <div class="text-center text-xs font-normal">{{ data?.['siteName'] || `* * *` }}</div>

      <div>
        <label for="hostname" class="text-sm">Manager API</label>

        <div class="flex mb-2 mx-[1px]">
          <div v-if="data?.languages?.length" class="grow-0 flex -mx-[1px]">
            <button type="button" class="h-full flex items-center border-2 py-2 !ring-0 !bg-transparent rounded-r-none"
                    @click="showLanguages">
              {{ lang.key?.toUpperCase() }}
            </button>
          </div>
          <div class="grow flex -mx-[1px]">
            <input v-model="hostname" type="text" id="hostname"
                   class="border-2 py-2 !ring-0 !bg-transparent rounded-r-none z-[1]"
                   :class="[ errors['hostname'] ? '!border-rose-500' : '', lang ? 'rounded-l-none' : '']"
                   @keyup.enter="checkServer">
          </div>
          <div v-if="hostnames.length" class="grow-0 flex -mx-[1px]">
            <button type="button" class="border-2 py-2 !ring-0 !bg-transparent h-full flex items-center rounded-none"
                    @click="showHostnames">
              <i class="fa fa-ellipsis fa-fw"/>
            </button>
          </div>
          <div class="grow-0 flex -mx-[1px]">
            <button type="button" class="border-2 py-2 !ring-0 !bg-transparent h-full flex items-center rounded-l-none"
                    :disabled="isCheckServer"
                    @click="checkServer">
              <i v-if="isCheckServer" class="fa fa-circle-notch fa-fw animate-spin"/>
              <i v-else class="fa fa-globe fa-fw" :class="[ connected ? 'text-green-500' : '']"/>
            </button>
          </div>
        </div>
      </div>

      <div v-if="connected" class="pt-2">
        <div class="mb-4">
          <label for="username" class="text-sm">{{ lang.user }}</label>
          <input v-model="form['username']"
                 type="text"
                 id="username"
                 name="username"
                 class="border-2 py-2 !ring-0 !bg-transparent"
                 :class="[ errors['username'] ? '!border-rose-500' : '']"
                 autocomplete="username"
                 @keyup.enter="login">
        </div>

        <div class="mb-4">
          <label for="password" class="text-sm">{{ lang.password }}</label>
          <input v-model="form['password']" type="password"
                 id="password"
                 name="password"
                 class="border-2 py-2 !ring-0 !bg-transparent"
                 :class="[ errors['password'] ? '!border-rose-500' : '']"
                 @keyup.enter="login">
        </div>

        <div class="flex justify-between items-center">
          <div class="inline-flex items-center">
            <input v-model="form['remember']" type="checkbox" id="remember" name="remember" class="mr-2 h-5 w-5">
            <label for="remember" class="text-sm">{{ lang.remember }}</label>
          </div>
          <div>
            <button type="button" class="btn-green !ring-0 py-2 px-5 flex items-center justify-center" :disabled="isLogin" @click="login">
              <i v-if="isLogin" class="fa fa-circle-notch fa-fw animate-spin absolute"/>
              <span :class="[ isLogin ? 'opacity-0' : '' ]">{{ lang.login }}</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="data?.version" class="text-xs text-gray-400 text-center mt-2 -mb-4">
        {{ data.version }}
      </div>

      <div v-if="isShowLanguages && data?.languages?.length"
           class="absolute z-10 bg-gray-800 text-white/80 rounded-xl p-8 left-0 top-0 w-full h-full overflow-auto">
        <i class="fa fa-close text-rose-600 absolute top-3 right-3 cursor-pointer" @click="showLanguages"/>

        <div v-for="i in data.languages"
             class="px-4 py-1 hover:bg-blue-600 hover:text-white rounded cursor-pointer transition"
             :class="[lang.key === i.key ? 'bg-white/10 font-bold' : '']"
             @click="selectLanguage(i)">
          <i class="fa fa-fw" :class="[lang.key === i.key ? 'fa-check' : '']"/>
          {{ i.value }}
        </div>
      </div>

      <div v-if="isShowHostnames"
           class="absolute z-10 bg-gray-800 text-white/80 rounded-xl p-8 left-0 top-0 w-full h-full overflow-auto">
        <i class="fa fa-close text-rose-600 absolute top-3 right-3 cursor-pointer" @click="showHostnames"/>

        <div v-for="i in this.hostnames"
             class="px-4 py-1 hover:bg-blue-600 hover:text-white rounded cursor-pointer transition"
             :class="[hostname === i ? 'bg-white/10 font-bold' : '']"
             @click="selectHostname(i)">
          <i class="fa fa-fw" :class="[hostname === i ? 'fa-check' : '']"/>
          {{ i }}
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.bg-login {
  @apply bg-center bg-cover;
  background-image: url("../../img/login-background.jpg");
}
</style>

<style>
html {
  font-size: 16px;
}
</style>
